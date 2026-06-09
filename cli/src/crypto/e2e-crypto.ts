/**
 * Cifrado Zero-Knowledge para WI-Dot (AES-256-GCM + PBKDF2).
 *
 * El servidor NUNCA recibe la passphrase ni el texto plano.
 * Solo almacena el payload cifrado y el hash SHA-256 del plaintext
 * (calculado en cliente) para que el CLI detecte cambios en sync.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  pbkdf2Sync,
  randomBytes,
} from 'node:crypto';

/** Versión del formato de payload — permite migraciones futuras sin romper clientes. */
export const PAYLOAD_VERSION = 1 as const;

/** Iteraciones PBKDF2 (OWASP 2023, SHA-256). Ajustar solo con bump de `v`. */
export const PBKDF2_ITERATIONS = 600_000;

/** Longitudes criptográficas fijas (bytes). */
export const SALT_LENGTH = 16;
export const IV_LENGTH = 12;
export const TAG_LENGTH = 16;
export const KEY_LENGTH = 32;

/**
 * Payload enviado/recibido por HTTP como JSON.
 *
 * Todos los campos binarios van en Base64 estándar (RFC 4648):
 * - Solo caracteres ASCII [A-Za-z0-9+/]
 * - Padding con '=' al final
 * - Sin saltos de línea (evita corrupción en JSON/logs/proxies)
 *
 * NUNCA envíes buffers crudos en JSON: bytes 0x00-0x1F, UTF-8 inválido o
 * secuencias de escape romperían el transporte HTTP y parsers de Linux configs.
 */
export interface EncryptedPayload {
  v: typeof PAYLOAD_VERSION;
  alg: 'AES-256-GCM';
  kdf: 'PBKDF2-SHA256';
  kdfIterations: number;
  /** Salt aleatorio por archivo — imprescindible para derivar clave única. */
  salt: string;
  /** Nonce de 12 bytes — único por operación de cifrado con la misma clave. */
  iv: string;
  /** Texto cifrado (sin el tag GCM). */
  ciphertext: string;
  /** Tag de autenticación GCM — detecta corrupción/manipulación al descifrar. */
  tag: string;
}

/** Cuerpo HTTP para POST/PUT de dotfiles. */
export interface DotfileUploadPayload {
  original_path: string;
  filename: string;
  /** SHA-256(hex) del plaintext UTF-8 — el servidor lo guarda pero NO puede verificarlo. */
  content_hash: string;
  /**
   * SHA-256(hex) de los bytes crudos: salt || iv || ciphertext || tag.
   * El servidor SÍ puede recomputarlo sobre el payload decodificado.
   */
  payload_hash: string;
  encrypted_payload: EncryptedPayload;
  commit_message?: string;
}

/** Respuesta API con blob cifrado para restaurar en disco. */
export interface DotfileDownloadPayload {
  original_path: string;
  filename: string;
  content_hash: string;
  payload_hash: string;
  encrypted_payload: EncryptedPayload;
}

/**
 * Codifica un Buffer a Base64 compacto (sin saltos de línea).
 *
 * Node representa datos binarios como Buffer (allocación fuera del heap JS).
 * Base64 convierte cada 3 bytes → 4 caracteres ASCII seguros para JSON/HTTP.
 */
export function bufferToBase64(data: Buffer): string {
  return data.toString('base64');
}

/**
 * Decodifica Base64 → Buffer.
 *
 * Usa 'base64' estricto de Node: ignora whitespace, valida padding.
 * Si el string llegó truncado o modificado por un proxy, lanza aquí.
 */
export function base64ToBuffer(data: string): Buffer {
  return Buffer.from(data, 'base64');
}

/** SHA-256 hex de un Buffer (integridad del blob cifrado). */
export function sha256Hex(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/** SHA-256 hex de texto plano UTF-8 (detección de cambios locales). */
export function sha256Plaintext(plaintext: string): string {
  return sha256Hex(Buffer.from(plaintext, 'utf8'));
}

/**
 * Deriva clave AES-256 desde passphrase + salt con PBKDF2-SHA256.
 *
 * La passphrase permanece solo en memoria del CLI; nunca se serializa ni se envía.
 */
export function deriveKey(passphrase: string, salt: Buffer, iterations: number): Buffer {
  return pbkdf2Sync(passphrase, salt, iterations, KEY_LENGTH, 'sha256');
}

/**
 * Concatena componentes binarios del payload para calcular payload_hash.
 * Orden fijo — cliente y servidor deben usar el mismo layout.
 */
export function buildPayloadBinary(payload: EncryptedPayload): Buffer {
  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);
  const tag = base64ToBuffer(payload.tag);

  return Buffer.concat([salt, iv, ciphertext, tag]);
}

/** Valida longitudes binarias tras decodificar Base64. */
export function assertPayloadBinaryLengths(payload: EncryptedPayload): void {
  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const tag = base64ToBuffer(payload.tag);

  if (salt.length !== SALT_LENGTH) {
    throw new Error(`Salt inválido: esperado ${SALT_LENGTH} bytes, recibido ${salt.length}.`);
  }
  if (iv.length !== IV_LENGTH) {
    throw new Error(`IV inválido: esperado ${IV_LENGTH} bytes, recibido ${iv.length}.`);
  }
  if (tag.length !== TAG_LENGTH) {
    throw new Error(`Tag GCM inválido: esperado ${TAG_LENGTH} bytes, recibido ${tag.length}.`);
  }
  if (base64ToBuffer(payload.ciphertext).length === 0) {
    throw new Error('Ciphertext vacío.');
  }
}

/**
 * Cifra contenido de texto plano → payload listo para HTTP.
 *
 * @param plaintext - Contenido del dotfile leído como UTF-8 (configs Linux).
 * @param passphrase - Frase de paso del usuario; solo existe en el CLI.
 */
export function encryptDotfile(plaintext: string, passphrase: string): DotfileUploadPayload {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(passphrase, salt, PBKDF2_ITERATIONS);

  // Buffer UTF-8: preserva newlines (\n), tabs y chars especiales del .conf
  const plaintextBuffer = Buffer.from(plaintext, 'utf8');

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  const encrypted_payload: EncryptedPayload = {
    v: PAYLOAD_VERSION,
    alg: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256',
    kdfIterations: PBKDF2_ITERATIONS,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertext),
    tag: bufferToBase64(tag),
  };

  const payloadBinary = buildPayloadBinary(encrypted_payload);

  return {
    original_path: '',
    filename: '',
    content_hash: sha256Hex(plaintextBuffer),
    payload_hash: sha256Hex(payloadBinary),
    encrypted_payload,
  };
}

/**
 * Descifra payload recibido de la API → texto plano para escribir en disco.
 *
 * GCM verifica el tag en decipher.final(); si el blob fue corrupto en tránsito
 * o storage, lanza error antes de devolver basura al filesystem.
 */
export function decryptDotfile(
  payload: EncryptedPayload,
  passphrase: string,
): string {
  assertPayloadBinaryLengths(payload);

  if (payload.v !== PAYLOAD_VERSION) {
    throw new Error(`Versión de payload no soportada: ${payload.v}.`);
  }
  if (payload.alg !== 'AES-256-GCM' || payload.kdf !== 'PBKDF2-SHA256') {
    throw new Error('Algoritmo o KDF no soportado.');
  }

  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);
  const tag = base64ToBuffer(payload.tag);

  const key = deriveKey(passphrase, salt, payload.kdfIterations);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const plaintextBuffer = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintextBuffer.toString('utf8');
}

/**
 * Verifica integridad del blob cifrado (sin descifrar).
 * Útil en CLI antes de decrypt para fallar rápido con mensaje claro.
 */
export function verifyPayloadIntegrity(
  payload: EncryptedPayload,
  expectedPayloadHash: string,
): void {
  assertPayloadBinaryLengths(payload);
  const actual = sha256Hex(buildPayloadBinary(payload));

  if (actual !== expectedPayloadHash.toLowerCase()) {
    throw new Error(
      'payload_hash no coincide: el blob cifrado pudo corromperse en tránsito o storage.',
    );
  }
}

/**
 * Lee archivo de disco, cifra y prepara body HTTP completo.
 *
 * @example
 * const body = await prepareDotfileUpload('/home/user/.config/hypr/hyprland.conf', 'mi-passphrase');
 * body.original_path = '~/.config/hypr/hyprland.conf';
 * body.filename = 'hyprland.conf';
 */
export async function prepareDotfileUpload(
  absolutePath: string,
  passphrase: string,
): Promise<DotfileUploadPayload> {
  const { readFile } = await import('node:fs/promises');
  const { basename } = await import('node:path');

  // Sin encoding = Buffer; aquí forzamos UTF-8 para dotfiles de texto
  const plaintext = await readFile(absolutePath, 'utf8');
  const result = encryptDotfile(plaintext, passphrase);

  result.filename = basename(absolutePath);

  return result;
}

/**
 * Descifra respuesta API y escribe dotfile en disco preservando UTF-8.
 *
 * @param absolutePath - Ruta destino en el filesystem local.
 * @param download - Payload devuelto por GET /dotfiles/{id}.
 */
export async function restoreDotfileToDisk(
  absolutePath: string,
  download: DotfileDownloadPayload,
  passphrase: string,
): Promise<void> {
  verifyPayloadIntegrity(download.encrypted_payload, download.payload_hash);

  const plaintext = decryptDotfile(download.encrypted_payload, passphrase);

  // Verificación opcional: plaintext hash vs metadata del servidor
  const localHash = sha256Plaintext(plaintext);
  if (localHash !== download.content_hash.toLowerCase()) {
    throw new Error(
      'content_hash no coincide tras descifrar: passphrase incorrecta o metadata corrupta.',
    );
  }

  const { writeFile, mkdir } = await import('node:fs/promises');
  const { dirname } = await import('node:path');

  await mkdir(dirname(absolutePath), { recursive: true });
  // utf8 explícito: escribe newlines Unix (\n) sin conversión CRLF
  await writeFile(absolutePath, plaintext, { encoding: 'utf8', mode: 0o600 });
}

export { randomBytes };

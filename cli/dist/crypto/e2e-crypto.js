/**
 * Cifrado Zero-Knowledge para WI-Dot (AES-256-GCM + PBKDF2).
 *
 * El servidor NUNCA recibe la passphrase ni el texto plano.
 * Solo almacena el payload cifrado y el hash SHA-256 del plaintext
 * (calculado en cliente) para que el CLI detecte cambios en sync.
 */
import { createCipheriv, createDecipheriv, createHash, pbkdf2Sync, randomBytes, } from 'node:crypto';
/** Versión del formato de payload — permite migraciones futuras sin romper clientes. */
export const PAYLOAD_VERSION = 1;
/** Iteraciones PBKDF2 (OWASP 2023, SHA-256). Ajustar solo con bump de `v`. */
export const PBKDF2_ITERATIONS = 600_000;
/** Longitudes criptográficas fijas (bytes). */
export const SALT_LENGTH = 16;
export const IV_LENGTH = 12;
export const TAG_LENGTH = 16;
export const KEY_LENGTH = 32;
/**
 * Codifica un Buffer a Base64 compacto (sin saltos de línea).
 *
 * Node representa datos binarios como Buffer (allocación fuera del heap JS).
 * Base64 convierte cada 3 bytes → 4 caracteres ASCII seguros para JSON/HTTP.
 */
export function bufferToBase64(data) {
    return data.toString('base64');
}
/**
 * Decodifica Base64 → Buffer.
 *
 * Usa 'base64' estricto de Node: ignora whitespace, valida padding.
 * Si el string llegó truncado o modificado por un proxy, lanza aquí.
 */
export function base64ToBuffer(data) {
    return Buffer.from(data, 'base64');
}
/** SHA-256 hex de un Buffer (integridad del blob cifrado). */
export function sha256Hex(data) {
    return createHash('sha256').update(data).digest('hex');
}
/** SHA-256 hex de texto plano UTF-8 (detección de cambios locales). */
export function sha256Plaintext(plaintext) {
    return sha256Hex(Buffer.from(plaintext, 'utf8'));
}
/**
 * Deriva clave AES-256 desde passphrase + salt con PBKDF2-SHA256.
 *
 * La passphrase permanece solo en memoria del CLI; nunca se serializa ni se envía.
 */
export function deriveKey(passphrase, salt, iterations) {
    return pbkdf2Sync(passphrase, salt, iterations, KEY_LENGTH, 'sha256');
}
/**
 * Concatena componentes binarios del payload para calcular payload_hash.
 * Orden fijo — cliente y servidor deben usar el mismo layout.
 */
export function buildPayloadBinary(payload) {
    const salt = base64ToBuffer(payload.salt);
    const iv = base64ToBuffer(payload.iv);
    const ciphertext = base64ToBuffer(payload.ciphertext);
    const tag = base64ToBuffer(payload.tag);
    return Buffer.concat([salt, iv, ciphertext, tag]);
}
/** Valida longitudes binarias tras decodificar Base64. */
export function assertPayloadBinaryLengths(payload) {
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
export function encryptDotfile(plaintext, passphrase) {
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);
    const key = deriveKey(passphrase, salt, PBKDF2_ITERATIONS);
    // Buffer UTF-8: preserva newlines (\n), tabs y chars especiales del .conf
    const plaintextBuffer = Buffer.from(plaintext, 'utf8');
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    const encrypted_payload = {
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
export function decryptDotfile(payload, passphrase) {
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
export function verifyPayloadIntegrity(payload, expectedPayloadHash) {
    assertPayloadBinaryLengths(payload);
    const actual = sha256Hex(buildPayloadBinary(payload));
    if (actual !== expectedPayloadHash.toLowerCase()) {
        throw new Error('payload_hash no coincide: el blob cifrado pudo corromperse en tránsito o storage.');
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
export async function prepareDotfileUpload(absolutePath, passphrase) {
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
export async function restoreDotfileToDisk(absolutePath, download, passphrase) {
    verifyPayloadIntegrity(download.encrypted_payload, download.payload_hash);
    const plaintext = decryptDotfile(download.encrypted_payload, passphrase);
    // Verificación opcional: plaintext hash vs metadata del servidor
    const localHash = sha256Plaintext(plaintext);
    if (localHash !== download.content_hash.toLowerCase()) {
        throw new Error('content_hash no coincide tras descifrar: passphrase incorrecta o metadata corrupta.');
    }
    const { writeFile, mkdir } = await import('node:fs/promises');
    const { dirname } = await import('node:path');
    await mkdir(dirname(absolutePath), { recursive: true });
    // utf8 explícito: escribe newlines Unix (\n) sin conversión CRLF
    await writeFile(absolutePath, plaintext, { encoding: 'utf8', mode: 0o600 });
}
export { randomBytes };

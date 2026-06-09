/**
 * Cifrado Zero-Knowledge para WI-Dot (AES-256-GCM + PBKDF2).
 *
 * El servidor NUNCA recibe la passphrase ni el texto plano.
 * Solo almacena el payload cifrado y el hash SHA-256 del plaintext
 * (calculado en cliente) para que el CLI detecte cambios en sync.
 */
import { randomBytes } from 'node:crypto';
/** Versión del formato de payload — permite migraciones futuras sin romper clientes. */
export declare const PAYLOAD_VERSION: 1;
/** Iteraciones PBKDF2 (OWASP 2023, SHA-256). Ajustar solo con bump de `v`. */
export declare const PBKDF2_ITERATIONS = 600000;
/** Longitudes criptográficas fijas (bytes). */
export declare const SALT_LENGTH = 16;
export declare const IV_LENGTH = 12;
export declare const TAG_LENGTH = 16;
export declare const KEY_LENGTH = 32;
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
export declare function bufferToBase64(data: Buffer): string;
/**
 * Decodifica Base64 → Buffer.
 *
 * Usa 'base64' estricto de Node: ignora whitespace, valida padding.
 * Si el string llegó truncado o modificado por un proxy, lanza aquí.
 */
export declare function base64ToBuffer(data: string): Buffer;
/** SHA-256 hex de un Buffer (integridad del blob cifrado). */
export declare function sha256Hex(data: Buffer): string;
/** SHA-256 hex de texto plano UTF-8 (detección de cambios locales). */
export declare function sha256Plaintext(plaintext: string): string;
/**
 * Deriva clave AES-256 desde passphrase + salt con PBKDF2-SHA256.
 *
 * La passphrase permanece solo en memoria del CLI; nunca se serializa ni se envía.
 */
export declare function deriveKey(passphrase: string, salt: Buffer, iterations: number): Buffer;
/**
 * Concatena componentes binarios del payload para calcular payload_hash.
 * Orden fijo — cliente y servidor deben usar el mismo layout.
 */
export declare function buildPayloadBinary(payload: EncryptedPayload): Buffer;
/** Valida longitudes binarias tras decodificar Base64. */
export declare function assertPayloadBinaryLengths(payload: EncryptedPayload): void;
/**
 * Cifra contenido de texto plano → payload listo para HTTP.
 *
 * @param plaintext - Contenido del dotfile leído como UTF-8 (configs Linux).
 * @param passphrase - Frase de paso del usuario; solo existe en el CLI.
 */
export declare function encryptDotfile(plaintext: string, passphrase: string): DotfileUploadPayload;
/**
 * Descifra payload recibido de la API → texto plano para escribir en disco.
 *
 * GCM verifica el tag en decipher.final(); si el blob fue corrupto en tránsito
 * o storage, lanza error antes de devolver basura al filesystem.
 */
export declare function decryptDotfile(payload: EncryptedPayload, passphrase: string): string;
/**
 * Verifica integridad del blob cifrado (sin descifrar).
 * Útil en CLI antes de decrypt para fallar rápido con mensaje claro.
 */
export declare function verifyPayloadIntegrity(payload: EncryptedPayload, expectedPayloadHash: string): void;
/**
 * Lee archivo de disco, cifra y prepara body HTTP completo.
 *
 * @example
 * const body = await prepareDotfileUpload('/home/user/.config/hypr/hyprland.conf', 'mi-passphrase');
 * body.original_path = '~/.config/hypr/hyprland.conf';
 * body.filename = 'hyprland.conf';
 */
export declare function prepareDotfileUpload(absolutePath: string, passphrase: string): Promise<DotfileUploadPayload>;
/**
 * Descifra respuesta API y escribe dotfile en disco preservando UTF-8.
 *
 * @param absolutePath - Ruta destino en el filesystem local.
 * @param download - Payload devuelto por GET /dotfiles/{id}.
 */
export declare function restoreDotfileToDisk(absolutePath: string, download: DotfileDownloadPayload, passphrase: string): Promise<void>;
export { randomBytes };

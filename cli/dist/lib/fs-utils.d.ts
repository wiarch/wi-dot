export declare class FileAccessError extends Error {
    readonly path: string;
    readonly code?: string | undefined;
    constructor(message: string, path: string, code?: string | undefined);
}
/** Comprueba lectura del path (archivo o directorio). */
export declare function assertReadable(targetPath: string): Promise<void>;
/** Recolecta archivos regulares de un path (archivo único o árbol de directorio). */
export declare function collectFiles(targetPath: string): Promise<string[]>;
/** Lee archivo de texto UTF-8 con errores descriptivos. */
export declare function readTextFile(absolutePath: string): Promise<string>;
/** Hash SHA-256 de archivo local; null si no existe. */
export declare function hashLocalFile(absolutePath: string): Promise<string | null>;
/** Hash SHA-256 streaming para archivos grandes. */
export declare function hashFileStream(absolutePath: string): Promise<string>;
/**
 * Escritura atómica: temp + rename.
 * Evita configs corruptas si el proceso muere a mitad de escritura.
 */
export declare function writeFileSecurely(absolutePath: string, content: string): Promise<void>;

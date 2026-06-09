/**
 * Expande prefijo `~` a $HOME de Linux.
 * Soporta `~`, `~/...` y `~user/...` (solo el usuario actual).
 */
export declare function expandTilde(inputPath: string): string;
/** Resuelve ruta absoluta expandiendo tilde y normalizando. */
export declare function resolvePath(inputPath: string): string;
/** Convierte ruta absoluta bajo $HOME a forma canónica `~/...` para la API. */
export declare function toOriginalPath(absolutePath: string): string;
/** Asegura URL base sin slash final. */
export declare function normalizeServerUrl(url: string): string;
/** Construye URL API absoluta. */
export declare function apiUrl(serverUrl: string, path: string): string;
/** Valida UUID v4 básico. */
export declare function isUuid(value: string): boolean;
/** Valida que la ruta sea absoluta tras expandir tilde. */
export declare function assertAbsolutePath(inputPath: string): string;

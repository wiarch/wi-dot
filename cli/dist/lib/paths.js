import { homedir } from 'node:os';
import { join, resolve, isAbsolute } from 'node:path';
/**
 * Expande prefijo `~` a $HOME de Linux.
 * Soporta `~`, `~/...` y `~user/...` (solo el usuario actual).
 */
export function expandTilde(inputPath) {
    if (inputPath === '~') {
        return homedir();
    }
    if (inputPath.startsWith('~/')) {
        return join(homedir(), inputPath.slice(2));
    }
    if (inputPath.startsWith('~')) {
        const rest = inputPath.slice(1);
        if (rest.startsWith('/') || rest === '') {
            return join(homedir(), rest);
        }
    }
    return inputPath;
}
/** Resuelve ruta absoluta expandiendo tilde y normalizando. */
export function resolvePath(inputPath) {
    return resolve(expandTilde(inputPath));
}
/** Convierte ruta absoluta bajo $HOME a forma canónica `~/...` para la API. */
export function toOriginalPath(absolutePath) {
    const home = homedir();
    const normalized = resolve(absolutePath);
    if (normalized === home) {
        return '~';
    }
    if (normalized.startsWith(`${home}/`)) {
        return `~${normalized.slice(home.length)}`;
    }
    return normalized;
}
/** Asegura URL base sin slash final. */
export function normalizeServerUrl(url) {
    return url.replace(/\/+$/, '');
}
/** Construye URL API absoluta. */
export function apiUrl(serverUrl, path) {
    const base = normalizeServerUrl(serverUrl);
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
}
/** Valida UUID v4 básico. */
export function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
/** Valida que la ruta sea absoluta tras expandir tilde. */
export function assertAbsolutePath(inputPath) {
    const expanded = expandTilde(inputPath);
    if (!isAbsolute(expanded)) {
        throw new Error(`Ruta inválida (debe ser absoluta o usar ~): ${inputPath}`);
    }
    return resolve(expanded);
}

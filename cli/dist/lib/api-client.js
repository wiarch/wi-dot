import { apiUrl } from './paths.js';
export class ApiError extends Error {
    status;
    body;
    constructor(message, status, body) {
        super(message);
        this.status = status;
        this.body = body;
        this.name = 'ApiError';
    }
}
const REQUEST_TIMEOUT_MS = 30_000;
export class ApiClient {
    config;
    constructor(config) {
        this.config = config;
    }
    async resolveEnvironmentId() {
        const environments = await this.listEnvironments();
        const match = environments.find((env) => env.sync_token.toLowerCase() === this.config.syncToken.toLowerCase());
        if (!match) {
            throw new ApiError(`Entorno con sync_token ${this.config.syncToken} no encontrado en el servidor.`, 404);
        }
        return match.id;
    }
    async listEnvironments() {
        const response = await this.request('/api/environments');
        return response.data;
    }
    async listDotfiles(environmentId) {
        const response = await this.request(`/api/environments/${environmentId}/dotfiles`);
        return response.data;
    }
    async uploadDotfile(environmentId, body) {
        const response = await this.request(`/api/environments/${environmentId}/dotfiles`, { method: 'POST', body });
        return response.data;
    }
    async downloadDotfile(environmentId, dotfileId) {
        const response = await this.request(`/api/environments/${environmentId}/dotfiles/${dotfileId}`);
        return response.data;
    }
    async request(path, options = {}) {
        const url = apiUrl(this.config.serverUrl, path);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(url, {
                method: options.method ?? 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${this.config.apiToken}`,
                    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
                signal: controller.signal,
            });
            const rawText = await response.text();
            let payload = null;
            if (rawText.length > 0) {
                try {
                    payload = JSON.parse(rawText);
                }
                catch {
                    payload = rawText;
                }
            }
            if (!response.ok) {
                const message = extractErrorMessage(payload) ??
                    `API respondió ${response.status} ${response.statusText}`;
                throw new ApiError(message, response.status, payload);
            }
            return payload;
        }
        catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new ApiError(`Timeout: el servidor no respondió en ${REQUEST_TIMEOUT_MS / 1000}s (${url}).`);
            }
            if (error instanceof TypeError) {
                throw new ApiError(`No se pudo conectar con ${url}. Verifica serverUrl y red.`);
            }
            throw new ApiError(error instanceof Error ? error.message : 'Error de red desconocido.');
        }
        finally {
            clearTimeout(timeout);
        }
    }
}
function extractErrorMessage(payload) {
    if (typeof payload !== 'object' || payload === null) {
        return null;
    }
    const record = payload;
    if (typeof record.message === 'string') {
        return record.message;
    }
    if (typeof record.error === 'string') {
        return record.error;
    }
    if (typeof record.errors === 'object' && record.errors !== null) {
        const errors = record.errors;
        const firstKey = Object.keys(errors)[0];
        if (firstKey && errors[firstKey]?.[0]) {
            return errors[firstKey][0];
        }
    }
    return null;
}

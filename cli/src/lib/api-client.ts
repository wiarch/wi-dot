import { apiUrl } from './paths.js';
import type { WidotConfig } from './config.js';
import type { DotfileDownloadPayload } from '../crypto/e2e-crypto.js';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiEnvironment {
  id: number;
  name: string;
  sync_token: string;
}

export interface ApiDotfileSummary {
  id: number;
  original_path: string;
  filename: string;
  content_hash: string;
}

interface LaravelResource<T> {
  data: T;
}

interface LaravelCollection<T> {
  data: T[];
}

const REQUEST_TIMEOUT_MS = 30_000;

export class ApiClient {
  constructor(private readonly config: WidotConfig) {}

  async resolveEnvironmentId(): Promise<number> {
    const environments = await this.listEnvironments();
    const match = environments.find(
      (env) => env.sync_token.toLowerCase() === this.config.syncToken.toLowerCase(),
    );

    if (!match) {
      throw new ApiError(
        `Entorno con sync_token ${this.config.syncToken} no encontrado en el servidor.`,
        404,
      );
    }

    return match.id;
  }

  async listEnvironments(): Promise<ApiEnvironment[]> {
    const response = await this.request<LaravelCollection<ApiEnvironment>>(
      '/api/environments',
    );

    return response.data;
  }

  async listDotfiles(environmentId: number): Promise<ApiDotfileSummary[]> {
    const response = await this.request<LaravelCollection<ApiDotfileSummary>>(
      `/api/environments/${environmentId}/dotfiles`,
    );

    return response.data;
  }

  async uploadDotfile(
    environmentId: number,
    body: Record<string, unknown>,
  ): Promise<ApiDotfileSummary> {
    const response = await this.request<LaravelResource<ApiDotfileSummary>>(
      `/api/environments/${environmentId}/dotfiles`,
      { method: 'POST', body },
    );

    return response.data;
  }

  async downloadDotfile(
    environmentId: number,
    dotfileId: number,
  ): Promise<DotfileDownloadPayload> {
    const response = await this.request<LaravelResource<DotfileDownloadPayload>>(
      `/api/environments/${environmentId}/dotfiles/${dotfileId}`,
    );

    return response.data;
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: Record<string, unknown> } = {},
  ): Promise<T> {
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
      let payload: unknown = null;

      if (rawText.length > 0) {
        try {
          payload = JSON.parse(rawText);
        } catch {
          payload = rawText;
        }
      }

      if (!response.ok) {
        const message = extractErrorMessage(payload) ??
          `API respondió ${response.status} ${response.statusText}`;

        throw new ApiError(message, response.status, payload);
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          `Timeout: el servidor no respondió en ${REQUEST_TIMEOUT_MS / 1000}s (${url}).`,
        );
      }

      if (error instanceof TypeError) {
        throw new ApiError(
          `No se pudo conectar con ${url}. Verifica serverUrl y red.`,
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Error de red desconocido.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

function extractErrorMessage(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.message === 'string') {
    return record.message;
  }

  if (typeof record.error === 'string') {
    return record.error;
  }

  if (typeof record.errors === 'object' && record.errors !== null) {
    const errors = record.errors as Record<string, string[]>;
    const firstKey = Object.keys(errors)[0];

    if (firstKey && errors[firstKey]?.[0]) {
      return errors[firstKey][0];
    }
  }

  return null;
}

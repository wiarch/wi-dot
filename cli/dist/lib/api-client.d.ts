import type { WidotConfig } from './config.js';
import type { DotfileDownloadPayload } from '../crypto/e2e-crypto.js';
export declare class ApiError extends Error {
    readonly status?: number | undefined;
    readonly body?: unknown | undefined;
    constructor(message: string, status?: number | undefined, body?: unknown | undefined);
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
export declare class ApiClient {
    private readonly config;
    constructor(config: WidotConfig);
    resolveEnvironmentId(): Promise<number>;
    listEnvironments(): Promise<ApiEnvironment[]>;
    listDotfiles(environmentId: number): Promise<ApiDotfileSummary[]>;
    uploadDotfile(environmentId: number, body: Record<string, unknown>): Promise<ApiDotfileSummary>;
    downloadDotfile(environmentId: number, dotfileId: number): Promise<DotfileDownloadPayload>;
    private request;
}

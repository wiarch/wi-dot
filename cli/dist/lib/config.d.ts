export interface WidotConfig {
    serverUrl: string;
    syncToken: string;
    apiToken: string;
    passphrase: string;
}
export declare const CONFIG_DIR: string;
export declare const CONFIG_PATH: string;
export declare class ConfigError extends Error {
    constructor(message: string);
}
export declare function configExists(): Promise<boolean>;
export declare function loadConfig(): Promise<WidotConfig>;
export declare function saveConfig(config: WidotConfig): Promise<void>;

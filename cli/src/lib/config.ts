import { mkdir, readFile, writeFile, chmod } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { isUuid, normalizeServerUrl } from './paths.js';

export interface WidotConfig {
  serverUrl: string;
  syncToken: string;
  apiToken: string;
  passphrase: string;
}

export const CONFIG_DIR = join(homedir(), '.config', 'widot');
export const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export async function configExists(): Promise<boolean> {
  try {
    await readFile(CONFIG_PATH, 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function loadConfig(): Promise<WidotConfig> {
  let raw: string;

  try {
    raw = await readFile(CONFIG_PATH, 'utf8');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === 'ENOENT') {
      throw new ConfigError(
        'Configuración no encontrada. Ejecuta `widot init` primero.',
      );
    }

    if (nodeError.code === 'EACCES') {
      throw new ConfigError(
        `Sin permiso de lectura en ${CONFIG_PATH}. Verifica permisos del archivo.`,
      );
    }

    throw new ConfigError(
      `No se pudo leer ${CONFIG_PATH}: ${nodeError.message}`,
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ConfigError('config.json corrupto: JSON inválido.');
  }

  return validateConfig(parsed);
}

export async function saveConfig(config: WidotConfig): Promise<void> {
  const normalized: WidotConfig = {
    serverUrl: normalizeServerUrl(config.serverUrl),
    syncToken: config.syncToken.trim(),
    apiToken: config.apiToken.trim(),
    passphrase: config.passphrase,
  };

  validateConfig(normalized);

  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await writeFile(CONFIG_PATH, `${JSON.stringify(normalized, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });

  try {
    await chmod(CONFIG_DIR, 0o700);
    await chmod(CONFIG_PATH, 0o600);
  } catch {
    // chmod puede fallar en algunos FS; config ya escrita
  }
}

function validateConfig(value: unknown): WidotConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigError('config.json inválido: se esperaba un objeto.');
  }

  const record = value as Record<string, unknown>;
  const serverUrl = readString(record, 'serverUrl');
  const syncToken = readString(record, 'syncToken');
  const apiToken = readString(record, 'apiToken');
  const passphrase = readString(record, 'passphrase');

  if (!/^https?:\/\/.+/i.test(serverUrl)) {
    throw new ConfigError('serverUrl debe ser una URL http(s) válida.');
  }

  if (!isUuid(syncToken)) {
    throw new ConfigError('syncToken debe ser un UUID de entorno válido.');
  }

  if (apiToken.length < 10) {
    throw new ConfigError('apiToken inválido o demasiado corto.');
  }

  if (passphrase.length < 8) {
    throw new ConfigError('passphrase debe tener al menos 8 caracteres.');
  }

  return { serverUrl, syncToken, apiToken, passphrase };
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new ConfigError(`Campo requerido ausente o inválido: ${key}.`);
  }

  return value.trim();
}

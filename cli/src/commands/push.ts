import { basename } from 'node:path';
import { loadConfig } from '../lib/config.js';
import { ApiClient, ApiError } from '../lib/api-client.js';
import { collectFiles, readTextFile, FileAccessError } from '../lib/fs-utils.js';
import { toOriginalPath, resolvePath } from '../lib/paths.js';
import { encryptDotfile } from '../crypto/e2e-crypto.js';

export async function runPush(inputPath: string): Promise<void> {
  const config = await loadConfig();
  const api = new ApiClient(config);

  let environmentId: number;

  try {
    environmentId = await api.resolveEnvironmentId();
  } catch (error) {
    handleApiFailure(error);
    return;
  }

  let files: string[];

  try {
    files = await collectFiles(inputPath);
  } catch (error) {
    handleFileFailure(error);
    return;
  }

  console.log(`Subiendo ${files.length} archivo(s) al entorno #${environmentId}...`);

  let uploaded = 0;
  let failed = 0;

  for (const absolutePath of files) {
    const originalPath = toOriginalPath(absolutePath);
    const filename = basename(absolutePath);

    try {
      const plaintext = await readTextFile(absolutePath);
      const payload = encryptDotfile(plaintext, config.passphrase);

      await api.uploadDotfile(environmentId, {
        original_path: originalPath,
        filename,
        content_hash: payload.content_hash,
        payload_hash: payload.payload_hash,
        encrypted_payload: payload.encrypted_payload,
      });

      console.log(`  ✓ ${originalPath}`);
      uploaded += 1;
    } catch (error) {
      failed += 1;
      logPushError(originalPath, error);
    }
  }

  console.log(`\nResumen: ${uploaded} subido(s), ${failed} error(es).`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

function logPushError(originalPath: string, error: unknown): void {
  if (error instanceof FileAccessError) {
    console.error(`  ✗ ${originalPath}: ${error.message}`);
    return;
  }

  if (error instanceof ApiError) {
    console.error(
      `  ✗ ${originalPath}: API ${error.status ?? '?'} — ${error.message}`,
    );
    return;
  }

  console.error(
    `  ✗ ${originalPath}: ${error instanceof Error ? error.message : String(error)}`,
  );
}

function handleApiFailure(error: unknown): never {
  if (error instanceof ApiError) {
    console.error(`Error API: ${error.message}`);
    process.exit(1);
  }

  throw error;
}

function handleFileFailure(error: unknown): never {
  if (error instanceof FileAccessError) {
    console.error(`Error de archivo: ${error.message}`);
    process.exit(1);
  }

  throw error;
}

/** Expone resolvePath para tests. */
export { resolvePath };

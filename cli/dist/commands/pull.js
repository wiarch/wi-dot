import { loadConfig } from '../lib/config.js';
import { ApiClient, ApiError } from '../lib/api-client.js';
import { hashLocalFile, writeFileSecurely, FileAccessError, } from '../lib/fs-utils.js';
import { expandTilde } from '../lib/paths.js';
import { decryptDotfile, verifyPayloadIntegrity, sha256Plaintext, } from '../crypto/e2e-crypto.js';
export async function runPull() {
    const config = await loadConfig();
    const api = new ApiClient(config);
    let environmentId;
    try {
        environmentId = await api.resolveEnvironmentId();
    }
    catch (error) {
        handleFatal(error);
        return;
    }
    let remoteFiles;
    try {
        remoteFiles = await api.listDotfiles(environmentId);
    }
    catch (error) {
        handleFatal(error);
        return;
    }
    if (remoteFiles.length === 0) {
        console.log('No hay dotfiles en el servidor para este entorno.');
        return;
    }
    console.log(`Comparando ${remoteFiles.length} archivo(s) del entorno #${environmentId}...`);
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    for (const remote of remoteFiles) {
        const localPath = expandTilde(remote.original_path);
        try {
            const localHash = await hashLocalFile(localPath);
            const remoteHash = remote.content_hash.toLowerCase();
            if (localHash !== null && localHash === remoteHash) {
                console.log(`  = ${remote.original_path} (sin cambios)`);
                skipped += 1;
                continue;
            }
            const download = await api.downloadDotfile(environmentId, remote.id);
            verifyPayloadIntegrity(download.encrypted_payload, download.payload_hash);
            const plaintext = decryptDotfile(download.encrypted_payload, config.passphrase);
            const decryptedHash = sha256Plaintext(plaintext);
            if (decryptedHash !== remoteHash) {
                throw new Error('content_hash no coincide tras descifrar: passphrase incorrecta o datos corruptos.');
            }
            await writeFileSecurely(localPath, plaintext);
            const action = localHash === null ? 'creado' : 'actualizado';
            console.log(`  ✓ ${remote.original_path} (${action})`);
            updated += 1;
        }
        catch (error) {
            failed += 1;
            logPullError(remote.original_path, error);
        }
    }
    console.log(`\nResumen: ${updated} actualizado(s), ${skipped} sin cambios, ${failed} error(es).`);
    if (failed > 0) {
        process.exitCode = 1;
    }
}
function logPullError(originalPath, error) {
    if (error instanceof FileAccessError) {
        console.error(`  ✗ ${originalPath}: ${error.message}`);
        return;
    }
    if (error instanceof ApiError) {
        console.error(`  ✗ ${originalPath}: API ${error.status ?? '?'} — ${error.message}`);
        return;
    }
    console.error(`  ✗ ${originalPath}: ${error instanceof Error ? error.message : String(error)}`);
}
function handleFatal(error) {
    if (error instanceof ApiError) {
        console.error(`Error API: ${error.message}`);
        process.exit(1);
    }
    throw error;
}

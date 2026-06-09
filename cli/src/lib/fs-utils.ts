import {
  access,
  constants,
  readdir,
  stat,
  writeFile,
  mkdir,
  rename,
  unlink,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolvePath } from './paths.js';
import { sha256Plaintext } from '../crypto/e2e-crypto.js';

export class FileAccessError extends Error {
  constructor(
    message: string,
    readonly path: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'FileAccessError';
  }
}

/** Comprueba lectura del path (archivo o directorio). */
export async function assertReadable(targetPath: string): Promise<void> {
  const absolute = resolvePath(targetPath);

  try {
    await access(absolute, constants.R_OK);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    throw new FileAccessError(
      formatAccessMessage('leer', absolute, nodeError),
      absolute,
      nodeError.code,
    );
  }
}

/** Recolecta archivos regulares de un path (archivo único o árbol de directorio). */
export async function collectFiles(targetPath: string): Promise<string[]> {
  const absolute = resolvePath(targetPath);

  await assertReadable(absolute);

  const info = await stat(absolute);

  if (info.isFile()) {
    return [absolute];
  }

  if (!info.isDirectory()) {
    throw new FileAccessError(
      `Ruta no soportada (no es archivo ni directorio): ${absolute}`,
      absolute,
    );
  }

  const files: string[] = [];
  await walkDirectory(absolute, files);

  if (files.length === 0) {
    throw new FileAccessError(
      `Directorio vacío o sin archivos legibles: ${absolute}`,
      absolute,
    );
  }

  return files.sort();
}

async function walkDirectory(dir: string, files: string[]): Promise<void> {
  let entries: string[];

  try {
    entries = await readdir(dir);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    throw new FileAccessError(
      formatAccessMessage('listar', dir, nodeError),
      dir,
      nodeError.code,
    );
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);

    let entryStat;

    try {
      entryStat = await stat(fullPath);
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;

      if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
        console.warn(`⚠ Omitido (sin permiso): ${fullPath}`);
        continue;
      }

      throw new FileAccessError(
        formatAccessMessage('acceder', fullPath, nodeError),
        fullPath,
        nodeError.code,
      );
    }

    if (entryStat.isDirectory()) {
      await walkDirectory(fullPath, files);
      continue;
    }

    if (!entryStat.isFile()) {
      continue;
    }

    try {
      await access(fullPath, constants.R_OK);
      files.push(fullPath);
    } catch {
      console.warn(`⚠ Omitido (sin permiso de lectura): ${fullPath}`);
    }
  }
}

/** Lee archivo de texto UTF-8 con errores descriptivos. */
export async function readTextFile(absolutePath: string): Promise<string> {
  try {
    const { readFile } = await import('node:fs/promises');
    return await readFile(absolutePath, 'utf8');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    throw new FileAccessError(
      formatAccessMessage('leer', absolutePath, nodeError),
      absolutePath,
      nodeError.code,
    );
  }
}

/** Hash SHA-256 de archivo local; null si no existe. */
export async function hashLocalFile(absolutePath: string): Promise<string | null> {
  try {
    await access(absolutePath, constants.R_OK);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === 'ENOENT') {
      return null;
    }

    throw new FileAccessError(
      formatAccessMessage('leer', absolutePath, nodeError),
      absolutePath,
      nodeError.code,
    );
  }

  const content = await readTextFile(absolutePath);
  return sha256Plaintext(content);
}

/** Hash SHA-256 streaming para archivos grandes. */
export async function hashFileStream(absolutePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(absolutePath, { encoding: 'utf8' });

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', (error) => {
      const nodeError = error as NodeJS.ErrnoException;
      reject(
        new FileAccessError(
          formatAccessMessage('leer', absolutePath, nodeError),
          absolutePath,
          nodeError.code,
        ),
      );
    });
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/**
 * Escritura atómica: temp + rename.
 * Evita configs corruptas si el proceso muere a mitad de escritura.
 */
export async function writeFileSecurely(
  absolutePath: string,
  content: string,
): Promise<void> {
  const absolute = resolvePath(absolutePath);
  const directory = dirname(absolute);
  const tempPath = `${absolute}.widot.tmp.${process.pid}`;

  await mkdir(directory, { recursive: true, mode: 0o700 });

  try {
    await writeFile(tempPath, content, { encoding: 'utf8', mode: 0o600 });
    await rename(tempPath, absolute);
  } catch (error) {
    await unlink(tempPath).catch(() => undefined);
    const nodeError = error as NodeJS.ErrnoException;
    throw new FileAccessError(
      formatAccessMessage('escribir', absolute, nodeError),
      absolute,
      nodeError.code,
    );
  }
}

function formatAccessMessage(
  action: string,
  path: string,
  error: NodeJS.ErrnoException,
): string {
  switch (error.code) {
    case 'EACCES':
    case 'EPERM':
      return `Sin permisos para ${action} ${path}.`;
    case 'ENOENT':
      return `Archivo no encontrado: ${path}.`;
    case 'EISDIR':
      return `${path} es un directorio, se esperaba un archivo.`;
    default:
      return `Error al ${action} ${path}: ${error.message}`;
  }
}

import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runPush } from './commands/push.js';
import { runPull } from './commands/pull.js';
import { ConfigError } from './lib/config.js';
import { ApiError } from './lib/api-client.js';
import { FileAccessError } from './lib/fs-utils.js';
export async function runCli(argv) {
    const program = new Command();
    program
        .name('widot')
        .description('Cliente CLI Zero-Knowledge para WI-Dot')
        .version('0.1.0');
    program
        .command('init')
        .description('Configura servidor, entorno, token API y passphrase')
        .option('-f, --force', 'Sobrescribir config existente sin preguntar')
        .action(async (options) => {
        await runInit(Boolean(options.force));
    });
    program
        .command('push')
        .description('Cifra y sube un archivo o directorio al servidor')
        .argument('[ruta]', 'Archivo o carpeta (ej. ~/.config/hypr/)')
        .action(async (ruta) => {
        if (!ruta) {
            throw new Error('Debes indicar una ruta. Ejemplo: widot push ~/.config/hypr/');
        }
        await runPush(ruta);
    });
    program
        .command('pull')
        .description('Descarga dotfiles modificados, descifra y escribe en disco')
        .action(async () => {
        await runPull();
    });
    try {
        await program.parseAsync(argv);
    }
    catch (error) {
        if (error instanceof ConfigError ||
            error instanceof ApiError ||
            error instanceof FileAccessError) {
            console.error(error.message);
            process.exit(1);
        }
        throw error;
    }
}

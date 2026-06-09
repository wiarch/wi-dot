import inquirer from 'inquirer';
import { saveConfig, configExists, type WidotConfig } from '../lib/config.js';
import { isUuid, normalizeServerUrl } from '../lib/paths.js';

export async function runInit(force = false): Promise<void> {
  if (!force && (await configExists())) {
    const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Ya existe ~/.config/widot/config.json. ¿Sobrescribir?',
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log('Init cancelado.');
      return;
    }
  }

  const answers = await inquirer.prompt<{
    serverUrl: string;
    syncToken: string;
    apiToken: string;
    passphrase: string;
    passphraseConfirm: string;
  }>([
    {
      type: 'input',
      name: 'serverUrl',
      message: 'URL del servidor Laravel (ej. https://widot.example.com):',
      validate: (value: string) =>
        /^https?:\/\/.+/i.test(value.trim()) || 'Introduce una URL http(s) válida.',
    },
    {
      type: 'input',
      name: 'syncToken',
      message: 'Token del entorno (UUID sync_token):',
      validate: (value: string) =>
        isUuid(value.trim()) || 'Debe ser un UUID válido del entorno.',
    },
    {
      type: 'password',
      name: 'apiToken',
      message: 'Token de acceso API (Sanctum Bearer):',
      mask: '*',
      validate: (value: string) =>
        value.trim().length >= 10 || 'Token API demasiado corto.',
    },
    {
      type: 'password',
      name: 'passphrase',
      message: 'Frase de paso criptográfica (Zero-Knowledge):',
      mask: '*',
      validate: (value: string) =>
        value.length >= 8 || 'Mínimo 8 caracteres.',
    },
    {
      type: 'password',
      name: 'passphraseConfirm',
      message: 'Confirmar frase de paso:',
      mask: '*',
      validate: (value: string, answers?: { passphrase?: string }) =>
        value === answers?.passphrase || 'Las frases no coinciden.',
    },
  ]);

  const config: WidotConfig = {
    serverUrl: normalizeServerUrl(answers.serverUrl.trim()),
    syncToken: answers.syncToken.trim(),
    apiToken: answers.apiToken.trim(),
    passphrase: answers.passphrase,
  };

  await saveConfig(config);

  console.log('✓ Configuración guardada en ~/.config/widot/config.json (permisos 600)');
  console.log('  La passphrase nunca se envía al servidor.');
}

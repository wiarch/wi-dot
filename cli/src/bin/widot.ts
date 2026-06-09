#!/usr/bin/env node

import { runCli } from '../cli.js';

runCli(process.argv).catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Error inesperado en widot.',
  );
  process.exit(1);
});

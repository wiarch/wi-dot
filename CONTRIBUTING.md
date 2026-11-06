# Contributing to WI Dot

Thank you for contributing to WI Dot.

## Before starting

Read:
- `README.md`
- `CLAUDE.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`

Keep changes aligned with Linux dotfiles management, encrypted backup and safe environment restore.

## Development setup

Backend:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run dev
```

CLI:

```bash
cd cli
npm install
npm run typecheck
npm run build
```

## Contribution rules

- Never add plaintext dotfile content to fixtures, logs or public test artifacts unless it is synthetic.
- Add tests for path handling, symlink behavior, payload validation and ownership checks.
- Keep TypeScript and PHP encryption payload definitions compatible.
- Do not alter cryptographic constants without a versioned migration.
- Do not add server-side decryption.
- Preserve existing file history and avoid destructive sync semantics.
- Keep `node_modules`, secrets, local config and caches out of Git.
- Update documentation when API behavior, payload format or CLI commands change.

## Validation

Run relevant checks:

```bash
php artisan test
vendor/bin/pint --test
npm run build
cd cli && npm run typecheck && npm run build
```

Report commands that could not be run. A pull request should include a summary, tests, security impact and known limitations.

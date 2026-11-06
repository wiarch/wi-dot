# WI Dot

**Linux environment backup, dotfiles management and encrypted restoration.**

WI Dot helps rebuild a Linux workstation after a reinstall, migrate a setup to another computer and keep important configuration backed up without configuring everything from scratch.

The long-term goal is to make a fresh Linux installation feel familiar again: restore shell, terminal, desktop preferences, editor settings, development tools and selected application configurations through a controlled plan.

> WI Dot is evolving. The current implementation provides an encrypted dotfiles CLI and Laravel API. Full system inventory, package restoration, desktop profiles and live dashboard integration are planned, not completed features.

## Product vision

WI Dot is more than a dotfiles uploader. It is intended to become a personal Linux environment recovery system.

- **Capture:** select configuration files, application settings and environment metadata.
- **Protect:** encrypt file contents locally before upload.
- **Organize:** separate backups into named environments such as Desktop, Laptop and Workstation.
- **Rebuild:** after reinstalling Linux, inspect what is missing and prepare a restoration plan.
- **Restore safely:** preview changes, request approval and recover files without silently overwriting unrelated data.

## What WI Dot aims to preserve

| Area | Examples |
|---|---|
| Desktop environment | KDE Plasma, GNOME, themes, icons, fonts, wallpapers and extensions |
| Terminal | Bash, Zsh, Fish, aliases, functions, Starship and terminal profiles |
| Developer workstation | Git, SSH configuration, editors, IDEs, Docker, PHP, Laravel and Node.js |
| Applications | Selected application preferences, Flatpak inventory and supported package lists |
| Personal configuration | Dotfiles, hidden files and selected paths under `~/.config` |
| Automation | Setup scripts, post-install tasks and reproducible environment manifests |

System packages, drivers, services, repositories and privileged settings require platform-aware handling. WI Dot should inventory and propose these operations first, then ask for approval before making system changes.

## Current implementation

- Laravel 13 API with Sanctum authentication.
- Named environments and encrypted dotfile records.
- TypeScript/Node.js CLI with `widot init`, `widot push` and `widot pull`.
- Client-side AES-256-GCM encryption with PBKDF2-SHA256.
- SHA-256 hashes for payload integrity and local change detection.
- Encrypted file storage and version-history records.
- React 19 + TypeScript dashboard foundation; current dashboard data is mocked.

## Planned recovery workflow

1. Create a backup profile for the current Linux machine.
2. Select configuration paths and supported environment inventory sources.
3. Review detected applications, package managers and desktop components.
4. Encrypt and back up selected configuration data.
5. On a fresh installation, install WI Dot and authenticate.
6. Compare the new machine with the saved profile.
7. Review a restore plan showing files, packages and actions.
8. Approve selected operations and restore in safe stages.
9. Verify the result and retain a recovery log.

## Security model

- File contents are encrypted locally before upload.
- The API stores encrypted payloads and metadata; it does not decrypt file contents.
- Restores must validate paths, reject traversal and avoid unsafe symlink behavior.
- System-level changes must be explicit and require user approval.
- Secrets such as private keys, tokens and credentials need opt-in handling and clear warnings.

The server can still observe metadata such as filenames, paths, timestamps, sizes and hashes. See [Security and Privacy](docs/SECURITY.md).

## Technology

- **Backend:** PHP 8.3+, Laravel 13, Laravel Sanctum.
- **CLI:** Node.js, TypeScript, Commander and Node Crypto.
- **Dashboard:** React 19, TypeScript, Vite and Tailwind CSS.
- **Encryption:** AES-256-GCM, PBKDF2-SHA256 and SHA-256.

## Repository documentation

- [Product definition](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security and privacy](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)
- [Development instructions for Claude](CLAUDE.md)
- [Master implementation prompt](PROMPT.md)
- [Contributing](CONTRIBUTING.md)

## Development

### Backend

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Dashboard

```bash
npm install
npm run dev
```

### CLI

```bash
cd cli
npm install
npm run build
node dist/bin/widot.js --help
```

Available CLI commands currently include:

```bash
widot init
widot push ~/.config
widot pull
```

Use a narrow, reviewed directory when backing up files. Do not upload your entire home directory without exclusions and a clear understanding of its contents.

## Project status

WI Dot is under active development. The roadmap prioritizes filesystem safety, restore previews, exclusions, package inventory, reproducible setup plans and real dashboard/API integration. Do not use unattended restore workflows until the security requirements are implemented and tested.

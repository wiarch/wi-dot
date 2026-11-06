# CLAUDE.md — WI Dot

## Product identity

WI Dot is a Linux environment backup and recovery platform. Its main purpose is to let a user reinstall Linux or move to another computer and restore their familiar workstation without manually rebuilding every preference and tool.

It is not merely a dotfiles uploader. The long-term product combines dotfiles and selected application configuration backup, desktop and shell profiles, installed application inventory, reproducible setup plans, and safe staged restoration.

Do not present planned features as implemented.

## Product scope

The intended backup categories include KDE Plasma and GNOME settings, themes, icons, fonts, wallpapers and extensions; Bash, Zsh and Fish; Git, SSH client configuration, editors, IDEs, Docker, PHP, Laravel and Node.js tooling; selected application settings; package inventories; and user-authored setup scripts.

System packages, drivers, services, repositories, kernel settings and privileged operations are not ordinary dotfiles. Model them as explicit, platform-specific actions. Never run privileged commands silently.

## Current stack and implementation

### Backend
- PHP 8.3+ and Laravel 13.
- Laravel Sanctum Bearer-token authentication.
- Environment, Dotfile and FileHistory models.
- API endpoints for environment listing/creation and encrypted dotfile upload/download.
- EncryptedPayloadValidator validates payload structure and hash without decrypting.
- DotfileStorageService stores encrypted payloads.

### CLI
- TypeScript and Node.js.
- Commands currently include `widot init`, `widot push` and `widot pull`.
- AES-256-GCM with PBKDF2-SHA256 (600,000 iterations).
- SHA-256 hashes for plaintext change detection and encrypted payload integrity.
- Local configuration at `~/.config/widot/config.json`; the passphrase is currently stored there in plaintext with restrictive filesystem permissions. Do not claim OS-keychain protection.

### Dashboard
- React 19, TypeScript, Vite and Tailwind.
- File tree and diff viewer foundation.
- Current content uses mock data; do not claim live API integration.

## Engineering priorities

1. Filesystem safety: canonicalize paths, confine restore to approved roots, reject traversal and unsafe absolute paths.
2. Symlink safety: use lstat/no-follow behavior and skip symlinks by default.
3. Restore safety: preview, conflict detection, explicit overwrite approval, backups and rollback.
4. Backup selection: include/exclude rules, dry-run, file count and size limits.
5. Environment inventory: detect distro, package managers, desktop environment, shells and supported tools without mutating the system.
6. Package restoration: generate reviewed commands/manifests; ask before installation, repository changes, service changes or privileged operations.
7. Secret handling: exclude credentials by default and require explicit opt-in for sensitive paths.
8. Credential storage: evaluate OS credential stores; do not silently change the crypto format or claim keychain support before implementation.
9. Dashboard: replace mock data with authenticated API-backed environments, inventory, history, restore plans and diffs.
10. Cross-platform architecture: keep Linux as the first supported target and isolate platform-specific adapters for future macOS/Windows support.

## Non-negotiable security rules

- Never send plaintext file contents or the passphrase to the API.
- Never add server-side decryption.
- Never trust remote paths before filesystem operations.
- Never write outside a user-approved restore root.
- Never recursively follow symlinks by default.
- Never execute downloaded scripts or package commands automatically.
- Never invoke sudo or modify system files without explicit user approval.
- Never log tokens, passphrases, private keys or configuration contents.
- Treat filenames, paths, hashes, timestamps and package inventory as potentially sensitive metadata.
- Enforce request and payload size limits.
- Preserve AES-GCM authentication and verify tags before writing plaintext.
- Any cryptographic payload change requires versioning, compatibility tests and a migration plan.
- Do not overwrite local files without a preview and clear approval.

## Implementation workflow

Before editing, inspect affected routes, policies, requests, models, services and CLI path flows. Identify current behavior, trust boundaries and failure modes.

For every change:
1. Implement the smallest safe increment.
2. Add regression tests for security boundaries.
3. Test TypeScript/PHP interoperability where payload handling changes.
4. Run relevant typecheck, build, lint and test commands when available.
5. Report exactly which commands ran and whether they passed.

## Documentation rules

Keep README, docs/PRODUCT.md, docs/ARCHITECTURE.md, docs/SECURITY.md and docs/ROADMAP.md consistent. Mark planned work as planned. Distinguish file backup from full machine provisioning. Explain metadata exposure honestly.

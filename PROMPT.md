# WI Dot — Master Development Prompt

Act as a senior Linux systems engineer, configuration-management architect, Laravel backend developer, TypeScript CLI engineer and application-security specialist.

## Mission

Build **WI Dot**, a secure Linux environment backup and recovery platform.

The primary user problem: after reinstalling Linux or changing computers, the user should not have to spend hours rebuilding their desktop, shell, applications and development workstation manually.

WI Dot should capture selected configuration and environment information, protect it with client-side encryption, compare it with a fresh installation and guide the user through a safe restoration plan.

## Product vision

A user should be able to back up a named Linux environment, select configuration and inventory categories, review detected desktop/shell/packages/tools, encrypt selected file contents locally, reinstall Linux, compare the new machine with the saved profile, preview missing packages and settings, approve individual actions, restore in stages and verify the resulting environment.

## Intended backup categories

- Desktop: KDE Plasma, GNOME, themes, icons, fonts, wallpapers, extensions and preferences.
- Shell and terminal: Bash, Zsh, Fish, aliases, functions, prompt themes and terminal profiles.
- Development: Git, SSH client config, VS Code and IDE settings, Docker, PHP, Laravel, Node.js and related tooling.
- Applications: selected user-level application settings and config directories.
- Packages: inventories from supported package managers such as pacman, apt, dnf, Flatpak and Snap.
- Automation: user scripts, setup manifests and post-install tasks.

Treat package managers and desktop environments as platform adapters. Do not assume commands, package names or configuration paths are identical across distributions or versions.

## Current implementation (do not overstate)

### Backend
- Laravel 13, PHP 8.3+.
- Laravel Sanctum authentication.
- Environment, Dotfile and FileHistory models.
- API for environment listing/creation and encrypted dotfile upload/download.
- EncryptedPayloadValidator checks payload structure and integrity without decrypting.

### CLI
- Node.js and TypeScript.
- Existing commands: `widot init`, `widot push` and `widot pull`.
- AES-256-GCM, PBKDF2-SHA256 (600,000 iterations), random salt and IV.
- SHA-256 hashes for payload integrity and plaintext change detection.
- Local passphrase is currently stored in `~/.config/widot/config.json` with restrictive permissions; it is not an OS credential-store integration.

### Dashboard
- React 19, TypeScript, Vite and Tailwind.
- File tree and diff viewer foundation.
- Data is currently mocked, not live API data.

## Product requirements

- Named machine/environment profiles.
- Selective dotfile backup with include/exclude rules.
- Environment inventory with distro, desktop, shell, package manager and application detection.
- Read-only scan before any system change.
- Package export/import adapters with dry-run and reviewable command plans.
- Safe file restore with root confinement, symlink defenses, backups and atomic writes.
- Conflict detection and explicit overwrite approval.
- File history, rollback and restore reports.
- Client-side encryption for file contents.
- Clear distinction between encrypted file content and server-visible metadata.
- Authenticated dashboard with real environment, inventory, history and diff data.
- Linux-first architecture with future platform adapters for macOS and Windows.

## Safety and security requirements

1. Do not trust remote paths; normalize and confine them to an approved restore root.
2. Reject traversal, unsafe absolute paths and symlink-based escapes.
3. Use lstat/no-follow semantics while collecting files; skip symlinks by default.
4. Add limits for request body size, file count, individual file size and total backup size.
5. Exclude secrets by default (SSH private keys, tokens, cloud credentials, password stores and browser profiles).
6. Sensitive-path inclusion requires explicit opt-in and a clear warning.
7. Never execute remote or downloaded scripts automatically.
8. Never invoke sudo, change repositories, install packages, alter services or write system paths without explicit user approval.
9. Generate a restore plan first; let users inspect and approve each operation.
10. Verify AES-GCM authentication before writing plaintext.
11. Do not log passphrases, tokens, private keys, plaintext config or decrypted payloads.
12. Treat paths, filenames, hashes, timestamps and package inventory as sensitive metadata.
13. Preserve crypto payload compatibility. Any format change needs versioning and migration tests.
14. Do not claim zero-knowledge for metadata that the server can observe.

## Engineering workflow

Before implementation, inspect existing code and state exactly what is already supported. Build in small increments. Add regression tests for path traversal, symlinks, malformed payloads, wrong passphrases, package command generation and approval boundaries. Test CLI/backend payload compatibility.

Run relevant PHP tests, Pint, TypeScript typecheck/build and dashboard build when possible. Report exact commands and results. Never claim a test passed if it was not run.

## Definition of done

A feature is complete only when it has implemented code integrated with the current architecture, tests for normal and failure cases, a security review appropriate to its trust boundary, documentation distinguishing current behavior from future plans, and verified build/test results.

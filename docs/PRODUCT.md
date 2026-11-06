# WI Dot — Product Definition

## Vision

WI Dot is a Linux environment backup and recovery platform. It helps users preserve the setup they have carefully built and reconstruct it after reinstalling Linux, migrating to a new computer or recovering from a damaged installation.

The intended experience is: back up a workstation profile once, reinstall Linux, install WI Dot, compare the new machine with the saved profile and restore selected parts through a clear and safe plan.

## Positioning

**Category:** Linux environment manager, encrypted dotfiles backup and workstation recovery.

**Primary value:** restore a familiar Linux environment without manually reconfiguring every application, shell, desktop preference and development tool.

**Initial platform:** Linux. The architecture should allow future macOS and Windows adapters without promising support before they exist.

## Users

- Linux users who reinstall distributions or switch machines.
- Developers who need a consistent workstation setup.
- Users who customize KDE Plasma, GNOME, terminals, shells and applications.
- Users who maintain multiple machines with different configuration profiles.
- Users who want encrypted backups and recoverable configuration history.

## Product pillars

### 1. Capture the environment
Discover and preserve selected configuration files, desktop preferences, shell settings, development tools and supported application inventories.

### 2. Protect user data
Encrypt file contents locally before upload. Keep the server unable to decrypt stored payloads. Explain which metadata remains visible.

### 3. Organize machine profiles
Separate Desktop, Laptop, Workstation, Testing and other environments. Profiles should allow shared baseline settings and machine-specific differences.

### 4. Rebuild instead of reconfigure
After a fresh installation, compare the new system with a saved profile. Identify missing packages, applications, configuration and tools. Produce a reviewable plan instead of executing everything immediately.

### 5. Restore safely
Preview file changes, detect conflicts, back up existing files, request approval and provide rollback. Package installation and system modifications must be explicit and auditable.

### 6. Manage visually
The dashboard should eventually expose real environments, inventory, file history, diffs and restore plans through authenticated API data.

## Intended coverage

| Category | Examples | Handling |
|---|---|---|
| Desktop environment | KDE Plasma, GNOME, themes, icons, fonts, wallpapers, extensions | User-level settings and supported adapters |
| Shell and terminal | Bash, Zsh, Fish, aliases, functions, Starship, terminal profiles | Selected dotfiles and directories |
| Developer workstation | Git, SSH client config, editors, IDEs, Docker, PHP, Laravel, Node.js | Config backup plus tool inventory |
| Applications | User-level preferences, selected `~/.config` directories | Opt-in selection and exclusions |
| Packages | pacman, apt, dnf, Flatpak, Snap | Inventory and generated install plan |
| Automation | Setup scripts, manifests, post-install tasks | Versioned, inspectable scripts; never auto-execute by default |

Drivers, kernel modules, system services, repositories, firewall rules and privileged configuration need separate system adapters. These are not ordinary dotfiles and must never be silently restored.

## Current implementation

- Laravel 13 API with Sanctum authentication.
- Named environment creation and listing.
- Encrypted dotfile upload and download.
- Encrypted payload validation and private storage.
- File-history records when existing dotfiles are updated.
- TypeScript CLI commands: `widot init`, `widot push` and `widot pull`.
- AES-256-GCM encryption and PBKDF2-SHA256 key derivation on the client.
- SHA-256 hashes for payload integrity and local change detection.
- React dashboard components for file navigation and diffs, currently powered by mock data.

## Planned capabilities

- Distribution, desktop environment, shell and package-manager detection.
- Package inventory export and restore adapters.
- KDE Plasma and GNOME configuration profiles.
- Application catalog and configuration discovery.
- Include/exclude rules, sensitive-file warnings and dry-run.
- Safe restore preview, path confinement, conflict resolution and rollback.
- OS credential-store integration for passphrases.
- Live dashboard/API integration.
- Scheduled backups and post-install recovery assistant.
- Future macOS and Windows adapters after Linux workflows are stable.

## Out of scope unless separately approved

- General-purpose cloud drive or arbitrary binary synchronization.
- Remote shell access or remote machine administration.
- Automatic execution of downloaded scripts.
- Silent package installation or privileged system modifications.
- Unattended destructive synchronization.
- Claims of complete machine imaging or bare-metal recovery.

## Product principles

1. The user decides what is captured and restored.
2. Inventory is read-only until the user approves an action.
3. File contents are encrypted before network transmission.
4. Secrets are excluded by default.
5. Restore operations are previewed, scoped and recoverable.
6. System-level actions require explicit approval.
7. Server-visible metadata is documented honestly.
8. Planned features are never represented as implemented.

## Success criteria

- A user can create named environment profiles.
- Selected dotfiles can be encrypted and synchronized.
- A fresh Linux installation can be compared with a saved environment inventory.
- WI Dot can generate a clear plan for missing packages and settings.
- The user can selectively approve and restore files safely.
- Existing files can be recovered after a failed or unwanted restore.
- Path traversal and symlink regression tests pass.
- Dashboard state comes from authenticated API data.

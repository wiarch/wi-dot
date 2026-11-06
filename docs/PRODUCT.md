# WI Dot — Product Definition

## Vision

WI Dot is a Linux configuration and dotfiles manager that helps users keep selected configuration files backed up and consistent across named environments, such as a desktop, laptop or workstation.

## Positioning

**Category:** dotfiles management, encrypted backup and environment synchronization.

**Primary value:** protect and restore selected Linux configuration files without exposing their plaintext contents to the storage server.

## Users

- Linux users who maintain personal dotfiles.
- Developers and system administrators with multiple machines.
- Users who customize desktop environments, shells, terminals and developer tools.
- Users who need version history and a safer recovery workflow for configuration changes.

## Product pillars

### 1. Local-first encryption
The CLI encrypts file contents before upload. The server stores opaque payloads and does not receive the passphrase.

### 2. Environment awareness
Users can separate configurations into named environments, for example Desktop, Laptop or Workstation.

### 3. Safe backup and restore
The product should detect changes, preserve prior versions and make restore operations explicit and recoverable.

### 4. Transparent synchronization
The CLI should clearly report uploaded, unchanged, restored, conflicting and failed files.

### 5. Useful visual management
The dashboard should eventually show real environments, files, history and diffs rather than demo data.

## Existing capabilities

- Laravel API with Sanctum authentication.
- Environment creation and listing.
- Dotfile upload and download endpoints.
- Encrypted payload storage and file-history records.
- CLI initialization, push and pull commands.
- AES-256-GCM encryption and PBKDF2-SHA256 key derivation.
- SHA-256 integrity and change hashes.
- React dashboard components for file navigation and diffs, currently powered by mock data.

## Planned capabilities

- Live API integration for the dashboard.
- Explicit file exclusions and safe directory selection.
- Dry-run and conflict resolution.
- Restore preview and rollback.
- Symlink-aware filesystem traversal and path confinement.
- OS credential-store integration.
- Better retention and history management.
- Linux desktop integration and optional scheduled backups.

## Out of scope unless separately approved

- General-purpose cloud drive.
- Arbitrary file synchronization for large binary data.
- Remote shell execution or machine administration.
- Automatic modification of system files.
- Unattended destructive synchronization.

## Product principles

1. The user controls which paths are backed up.
2. Encryption happens before network transmission.
3. Restoring a file must never silently write outside an approved directory.
4. Never follow symlinks during recursive collection without an explicit, safe policy.
5. Preserve history and provide a recovery path.
6. Make server-visible metadata clear to users.
7. Never label mock dashboard data as real account data.

## Success criteria

- A user can initialize a client and configure a named environment.
- Selected dotfiles can be encrypted and uploaded.
- The server cannot decrypt stored payloads.
- A user can detect unchanged files and restore a previous version safely.
- Path traversal and symlink regression tests pass.
- Dashboard data is sourced from authenticated API responses.

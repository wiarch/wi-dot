# WI Dot — Master Development Prompt

Act as a senior engineer specializing in Linux systems, secure configuration management, Laravel APIs, TypeScript CLI tooling and applied cryptography.

## Mission

Build **WI Dot**, a dependable tool for managing, backing up and restoring Linux dotfiles across named environments. The CLI encrypts configuration files locally before upload. The Laravel server stores opaque encrypted blobs and maintains environment and version metadata. A React dashboard will eventually provide a live view of files, environments and diffs.

The product should prioritize data safety, recoverability, transparency and a low-friction Linux workflow.

## Current implementation

### Backend
- Laravel 13, PHP 8.3+.
- Laravel Sanctum Bearer-token authentication.
- Environment, dotfile and file-history models.
- API endpoints to create/list environments, list dotfiles, upload and download encrypted payloads.
- Local filesystem storage disk named `dotfiles`.
- EncryptedPayloadValidator validates AES-GCM payload structure, cryptographic field lengths, fixed KDF parameters and payload hash without decrypting.

### CLI
- TypeScript and Node.js.
- Commands: `widot init`, `widot push <path>`, `widot pull`.
- AES-256-GCM with PBKDF2-SHA256 (600,000 iterations).
- SHA-256 plaintext and encrypted-payload hashes.
- Local config at `~/.config/widot/config.json`, currently protected by filesystem permissions 0600.
- Atomic file writes are used for restore, but path confinement and symlink-safe behavior need hardening.

### Dashboard
- React 19, TypeScript, Vite and Tailwind.
- File tree and diff viewer exist.
- Current content comes from mock data; do not claim API integration.

## Product requirements

- Manage multiple named Linux environments.
- Back up selected dotfiles and restore them safely.
- Preserve file content exactly, including UTF-8, newlines and tabs.
- Encrypt locally; server never receives plaintext or passphrase.
- Detect changes and preserve recoverable file history.
- Show clear progress, skipped files, conflicts and errors.
- Support safe exclusion patterns and dry-run before broad directory operations.
- Provide an API-backed dashboard with environment selection, file history and readable diffs.
- Keep recovery and rollback safer than destructive overwrite.

## Non-negotiable security work

1. Prevent remote path traversal and writes outside an approved root.
2. Reject symlinked directories during recursive traversal.
3. Validate all remote path metadata before filesystem operations.
4. Bound request body size, ciphertext length, file count and processing time.
5. Avoid logging secrets or file contents.
6. Migrate passphrase storage toward an OS credential store; do not silently claim current config is keychain-backed.
7. Use secure defaults for file permissions and atomic writes.
8. Preserve AES-GCM authentication and the payload versioning contract.
9. Test malformed Base64, incorrect hashes, wrong passphrases, truncated payloads and unsupported KDF parameters.
10. Review metadata exposure: paths, filenames, hashes, timestamps and environment identifiers.

## Implementation workflow

Before editing, inspect the relevant code and explain the current behavior. Implement in small changes, add regression tests, run PHP and TypeScript validation, and verify the encryption format remains compatible across CLI and backend.

Never silently overwrite user files, remove remote history or broaden filesystem access. Document every migration and report actual test results.

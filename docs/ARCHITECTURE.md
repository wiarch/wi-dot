# WI Dot — Architecture

## Architecture goals

WI Dot is Linux-first and designed around environment profiles, encrypted configuration backup and safe workstation recovery. Keep platform-specific behavior behind adapters so future macOS and Windows support does not leak into the core synchronization model.

Separate three types of data:
1. **Configuration content:** selected files, encrypted locally.
2. **Environment inventory:** distro, desktop, shell, package and application metadata.
3. **Restore actions:** explicit, reviewable operations generated from differences between a saved profile and the current machine.

Do not treat package installation or system provisioning as ordinary file synchronization.

## Current components

### Laravel backend
- PHP 8.3+ and Laravel 13.
- Laravel Sanctum protects API routes with Bearer-token authentication.
- Eloquent models: User, Environment, Dotfile and FileHistory.
- API controllers manage environment and dotfile operations.
- EncryptedPayloadValidator validates opaque payload structure and recomputes its payload hash.
- DotfileStorageService stores encrypted JSON on the private `dotfiles` filesystem disk.

### TypeScript CLI
- Node.js and TypeScript.
- Commander defines `init`, `push` and `pull`.
- Inquirer collects initial configuration.
- Node Crypto implements PBKDF2-SHA256 and AES-256-GCM.
- API client communicates with authenticated Laravel endpoints.
- Filesystem utilities collect, hash and write local files.

### React dashboard
- React 19, TypeScript, Vite and Tailwind CSS.
- Components include file tree, metadata header and diff viewer.
- Current dashboard state is populated from mock data; live API integration is not implemented.

## Intended logical modules

These are architectural targets, not a claim that each module currently exists.

### Environment detector

Read-only adapters identify Linux distribution and release, desktop environment and session, shell and terminal, available package managers, installed applications and developer tools.

Detection must be resilient when commands are missing and must not require root privileges.

### Configuration catalog

A versioned catalog maps supported applications and desktop components to display name, category, supported distributions/versions, candidate configuration paths, include/exclude defaults, sensitive-data warnings, restore dependencies and compatibility notes.

Never assume every application uses the same path on every distribution.

### Package inventory adapters

Each package manager adapter should expose a common interface to detect, export and compare installed packages. Initial candidates include pacman, apt, dnf, Flatpak and Snap.

Adapters generate a proposed restore plan. They do not install packages directly during inventory or comparison.

### Restore planner and executor

The planner compares a saved environment with the current machine and produces typed actions:
- Restore a selected configuration file.
- Install a package.
- Enable or disable an application-level setting.
- Run a reviewed user-provided setup task.

The executor requires explicit approval, validates preconditions and records outcomes. Privileged actions need a separate approval step and clear explanation.

## Current API routes

All listed API routes are inside the `auth:sanctum` middleware group.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/environments` | List authenticated user's environments |
| POST | `/api/environments` | Create an environment |
| GET | `/api/environments/{environment}/dotfiles` | List files for an owned environment |
| POST | `/api/environments/{environment}/dotfiles` | Create or update an encrypted dotfile |
| GET | `/api/environments/{environment}/dotfiles/{dotfile}` | Download encrypted payload |

## Encryption flow

1. CLI reads a local text file as UTF-8.
2. It creates a random 16-byte salt and 12-byte IV.
3. PBKDF2-SHA256 derives a 32-byte key using 600,000 iterations.
4. AES-256-GCM encrypts plaintext and produces a 16-byte authentication tag.
5. The client calculates SHA-256 of plaintext for change detection.
6. The client calculates SHA-256 of salt, IV, ciphertext and tag for payload integrity.
7. The backend validates version, algorithm, KDF, iteration count, Base64 encoding, binary lengths and payload hash.
8. The backend stores the JSON payload without decrypting it.

The payload format is versioned. Any format or KDF change must be coordinated between TypeScript and PHP and include compatibility fixtures and a migration strategy.

## Current push and pull flows

Push resolves the environment, collects files under the selected path, reads each as UTF-8, encrypts locally and sends encrypted payload plus metadata to the API. Updating an existing path archives its previous encrypted blob and creates a FileHistory record.

Pull resolves the environment, compares local plaintext hashes with server-provided hashes, downloads changed files, verifies encrypted payload integrity, decrypts locally, verifies plaintext hash and writes through a temporary file and rename.

**Security limitation:** the current pull implementation trusts `original_path` returned by the API and resolves it into a local filesystem path. Path confinement and symlink-safe parent validation are required before treating a remote server as untrusted or using unattended restore.

## Future environment recovery flow

1. **Scan:** collect read-only machine facts through platform adapters.
2. **Select:** user chooses categories and paths to preserve.
3. **Snapshot:** create a versioned environment manifest and encrypted file backup.
4. **Compare:** on a new installation, compare detected state with the saved manifest.
5. **Plan:** produce package and configuration actions with dependencies and risk labels.
6. **Review:** user approves or excludes individual actions.
7. **Execute:** perform approved actions in stages, with backups and rollback where possible.
8. **Verify:** re-scan and report completed, skipped and failed steps.

The manifest should include schema version, platform identifiers, package-manager type, application identifiers and references to encrypted file records. Avoid storing unnecessary personal or hardware identifiers.

## Storage and privacy

Encrypted payloads are stored under the Laravel private `dotfiles` disk, partitioned by environment sync token and dotfile ID. Historical versions are stored separately.

The server can still observe metadata such as paths, filenames, hashes, sizes, timestamps and account activity. Do not describe this metadata as end-to-end encrypted unless it actually is.

## Testing boundaries

- PHP: payload validation, ownership checks, storage and API behavior.
- CLI: crypto compatibility, path validation, filesystem traversal, push/pull decisions and safe writes.
- Environment adapters: deterministic parsing of command output and missing-tool behavior.
- Restore planner: stable plans, dependencies, approval requirements and no execution during dry-run.
- Dashboard: API state, file tree, inventory, restore preview and accessible errors.

The repository currently has limited product-specific regression coverage. Add tests before enabling broad backups or automated restoration.

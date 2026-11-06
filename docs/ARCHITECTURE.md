# WI Dot — Architecture

## Components

### Laravel backend

- PHP 8.3+ and Laravel 13.
- Laravel Sanctum protects API routes with Bearer-token authentication.
- Eloquent models: User, Environment, Dotfile and FileHistory.
- API controllers manage environment and dotfile operations.
- EncryptedPayloadValidator validates the opaque payload structure and recomputes its payload hash.
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
- Current dashboard state is populated from `resources/js/lib/mockData.ts`; live API integration is not implemented yet.

## API routes

All listed API routes are inside the `auth:sanctum` middleware group.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/environments` | List authenticated user's environments |
| POST | `/api/environments` | Create an environment |
| GET | `/api/environments/{environment}/dotfiles` | List files for an owned environment |
| POST | `/api/environments/{environment}/dotfiles` | Create or update an encrypted dotfile |
| GET | `/api/environments/{environment}/dotfiles/{dotfile}` | Download encrypted payload |

The controllers verify that the environment belongs to the authenticated user and that a requested dotfile belongs to the selected environment.

## Encryption flow

1. CLI reads a local text file as UTF-8.
2. It creates a random 16-byte salt and 12-byte IV.
3. PBKDF2-SHA256 derives a 32-byte key using 600,000 iterations.
4. AES-256-GCM encrypts the plaintext and produces a 16-byte authentication tag.
5. The client calculates SHA-256 of the plaintext for change detection.
6. The client calculates SHA-256 of salt, IV, ciphertext and tag for payload integrity.
7. The backend validates the version, algorithm, KDF, iteration count, Base64 encoding, binary lengths and payload hash.
8. The backend stores the JSON payload without decrypting it.

The payload format is versioned. Any format or KDF change must be coordinated between TypeScript and PHP and include a version/migration strategy.

## Push flow

- Resolve the environment using its sync token.
- Collect files under the selected path.
- Read each file as UTF-8.
- Encrypt locally.
- Send encrypted payload and metadata to the API.
- When an existing path is updated, the backend archives its previous encrypted blob and creates a FileHistory record.

The current collector recursively traverses directories and does not yet provide a complete exclusion/ignore policy. Symlink handling requires hardening before broad directory backups.

## Pull flow

- Resolve the environment and list remote file metadata.
- Compare local plaintext hashes with the server-provided content hashes.
- Download only files whose local hash differs or whose local copy is missing.
- Verify encrypted payload integrity.
- Decrypt locally and verify the plaintext hash.
- Write the restored file using a temporary file and rename.

**Security limitation:** the current pull implementation trusts `original_path` returned by the API and resolves it into a local filesystem path. Path confinement and symlink-safe parent validation are required before treating a remote server as untrusted or using unattended restore.

## Storage

Encrypted payloads are stored under the Laravel private `dotfiles` disk, partitioned by environment sync token and dotfile ID. Historical versions are stored separately.

## Testing boundaries

- PHP: payload validation, ownership checks, storage and API behavior.
- CLI: crypto compatibility, path validation, filesystem traversal, push/pull decisions and safe writes.
- Dashboard: component rendering, API state, file tree and diff behavior.

The repository currently contains only the default Laravel example tests; meaningful product and security regression coverage remains to be added.

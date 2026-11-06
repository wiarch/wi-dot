# CLAUDE.md — WI Dot

## Product identity

WI Dot is a Linux dotfiles and environment backup/synchronization project. Its CLI encrypts text configuration files locally and communicates with a Laravel API. The server stores encrypted payloads and metadata; it must never receive the user's encryption passphrase or plaintext file contents.

Read before substantial work:
- `README.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/ROADMAP.md`

## Stack

- Backend: PHP 8.3+, Laravel 13, Laravel Sanctum.
- CLI: Node.js 22+, TypeScript, Commander, Inquirer.
- Cryptography: Node.js Crypto, AES-256-GCM, PBKDF2-SHA256.
- Dashboard: React 19, TypeScript, Vite, Tailwind CSS.
- Storage: Laravel filesystem disk named `dotfiles`.

## Existing implementation

- `app/Http/Controllers/Api`: environment and dotfile API controllers.
- `app/Services/EncryptedPayloadValidator.php`: server-side opaque payload validation.
- `app/Services/DotfileStorageService.php`: encrypted payload storage.
- `cli/src/crypto/e2e-crypto.ts`: client-side encryption/decryption and integrity checks.
- `cli/src/commands`: CLI init, push and pull commands.
- `cli/src/lib`: configuration, API client, paths and filesystem utilities.
- `resources/js/components/dashboard`: React dashboard components.
- `resources/js/lib/mockData.ts`: current dashboard mock data; dashboard is not yet API-backed.

## Critical security rules

1. Treat remote paths and filenames as untrusted input. Never write a remote path to disk without canonicalization, home-directory policy checks and symlink-safe validation.
2. Do not allow directory traversal, absolute-path overwrite, symlink traversal or writes outside an explicitly approved root.
3. Use `lstat`/no-follow semantics when walking local directories. Do not recursively follow symlinks.
4. Add strict request and decoded-payload size limits before processing or storing encrypted payloads.
5. Keep encryption and decryption in the CLI. Never add server-side decryption or send the passphrase to the API.
6. Do not log tokens, passphrases, plaintext configuration files or decrypted payloads.
7. The CLI currently stores the passphrase in its local JSON config with mode 0600. Do not claim OS-keychain protection; design a secure migration before changing this behavior.
8. Treat content hashes, filenames, original paths, sync tokens and timestamps as metadata that may reveal information.
9. Validate ownership for every environment and dotfile access; never rely only on client-supplied IDs.
10. Preserve authenticated encryption and verify the GCM tag before writing restored content.
11. Do not weaken TLS verification or add insecure transport fallbacks.
12. Keep generated dependencies out of Git. Never commit `node_modules`, local secrets or build caches.

## Engineering rules

- Inspect routes, policies, requests, models, migrations, services and CLI path handling before modifying sync behavior.
- Add tests for every security boundary and malformed payload.
- Keep backend storage opaque; the server validates structure and payload integrity but does not decrypt.
- Preserve compatibility of the encrypted payload format. Any cryptographic format change requires a version bump and migration plan.
- Treat dashboard mock data as mock data. Do not describe it as live account data.
- Avoid automatic destructive sync or remote deletion without explicit product design and recovery semantics.
- Run PHP tests, Pint, CLI typecheck/build and dashboard build when possible. Report exactly which commands ran.

## Workflow

1. State current behavior and the threat model relevant to the task.
2. Implement the smallest safe change.
3. Add regression tests, especially for path traversal and symlinks.
4. Validate compatibility between PHP payload validation and TypeScript encryption.
5. Run relevant checks and report results and limitations.

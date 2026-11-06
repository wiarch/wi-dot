# WI Dot — Security and Privacy

## Security model

WI Dot is designed so that file contents are encrypted on the client before upload. The server validates and stores encrypted payloads but does not possess the passphrase required to decrypt them.

Current cryptographic format:
- AES-256-GCM.
- PBKDF2-SHA256.
- 600,000 PBKDF2 iterations.
- 16-byte random salt.
- 12-byte random IV.
- 16-byte GCM authentication tag.
- SHA-256 payload hash over salt, IV, ciphertext and tag.

Do not change these parameters or the payload structure without a coordinated versioned migration.

## Metadata exposure

The server still receives or can infer:
- Original paths and filenames.
- Environment identifiers and sync tokens.
- Plaintext SHA-256 hashes used for change detection.
- Ciphertext size, upload timing and update frequency.
- Account and API activity metadata.

A content hash can reveal whether a known file content is present. Do not claim that all metadata is hidden.

## Critical risks requiring remediation

### 1. Restore path trust

The current CLI pull flow expands the remote `original_path` and writes to the resulting local path. It does not yet enforce an approved root or reject traversal and arbitrary absolute paths. A malicious or compromised server response could cause writes outside the intended dotfiles directory.

**Required:** canonicalize and validate every remote path, enforce a configurable safe root, reject traversal, and verify parent directories without following symlinks.

### 2. Symlink traversal during collection

The recursive collector uses filesystem metadata operations that follow symlinks. A symlink to another directory can cause collection outside the selected tree or recursive loops.

**Required:** use `lstat`, skip symlinks by default, and add tests for symlinked files, directories and cycles.

### 3. Unbounded payloads and file collection

The upload request validates encrypted payload fields but does not establish a comprehensive decoded ciphertext/file-size limit. Recursive collection also lacks a mature file-count and size policy.

**Required:** define request body limits, ciphertext limits, maximum file size/count, timeouts and safe failure behavior.

### 4. Local passphrase storage

The CLI stores the passphrase in `~/.config/widot/config.json`. The application applies mode 0600 to the file and 0700 to its directory, but the passphrase remains plaintext at rest for users or processes that can read that file.

**Required:** evaluate Linux Secret Service/KWallet and other platform credential stores. Keep explicit warnings until keychain integration exists.

### 5. Dashboard mock data

The React dashboard currently uses static mock data and must not imply that its displayed files are live encrypted account data.

## Required controls

- Never transmit passphrases or plaintext file contents to the API.
- Never log tokens, passphrases or file contents.
- Enforce authenticated ownership checks for every environment and dotfile.
- Verify the GCM authentication tag before writing plaintext.
- Validate payload version, algorithm, KDF and iteration count.
- Use HTTPS for all production API communication.
- Use restrictive local permissions and atomic writes.
- Never follow symlinks by default during recursive collection.
- Never restore remote paths without canonicalization and confinement.
- Back up local files before restore until conflict and rollback controls are complete.
- Keep dependencies and generated files out of version control.

## Reporting

Do not publish exploitable vulnerabilities, tokens, passphrases or real dotfile contents in public issues. Use a private security reporting channel available to the repository maintainers.

# WI Dot — Roadmap

Items describe future work unless explicitly marked complete.

## Phase 0 — Repository and product foundation

- [x] Define WI Dot as a Linux dotfiles and environment manager.
- [x] Document the Laravel API, TypeScript CLI and React dashboard.
- [x] Remove tracked CLI node_modules from the working tree.
- [x] Add nested dependency/cache ignores.
- [ ] Establish automated PHP and CLI CI checks.
- [ ] Define an explicit project license.

## Phase 1 — Filesystem safety (highest priority)

- [ ] Reject remote path traversal and unsafe absolute paths during pull.
- [ ] Enforce an approved restore root.
- [ ] Validate existing parent directories without following symlinks.
- [ ] Use lstat and skip symlinks during recursive collection by default.
- [ ] Add tests for symlink loops, external symlinks and traversal payloads.
- [ ] Add file size, total upload size and file-count limits.
- [ ] Add exclusion patterns and dry-run support before broad uploads.

## Phase 2 — Cryptographic and credential hardening

- [ ] Add cross-language fixture tests for TypeScript encryption and PHP validation.
- [ ] Add malformed Base64, invalid tag, wrong hash and unsupported KDF regression tests.
- [ ] Evaluate Linux Secret Service/KWallet for passphrase storage.
- [ ] Define passphrase recovery and loss semantics clearly.
- [ ] Review metadata minimization and hash exposure.
- [ ] Add retention and secure deletion policy for file history.

## Phase 3 — Reliable synchronization

- [ ] Add restore preview and explicit overwrite confirmation.
- [ ] Add conflict detection when local and remote files both change.
- [ ] Add rollback to a previous encrypted version.
- [ ] Add safe retry/resume for interrupted uploads.
- [ ] Add ignore-file support and per-environment file selection.
- [ ] Clarify behavior for removed or renamed local files.

## Phase 4 — Live dashboard

- [ ] Replace mock data with authenticated API data.
- [ ] Add environment selection and account state.
- [ ] Display real file history and metadata.
- [ ] Show server/local diff and restore previews.
- [ ] Add responsive, accessible error and empty states.

## Phase 5 — Linux integration

- [ ] Provide package/install scripts for supported distributions.
- [ ] Add optional scheduled backup workflow.
- [ ] Evaluate desktop notifications and a tray application.
- [ ] Document tested distributions and supported shells/desktop environments.

## Release criteria

Do not recommend production or unattended restore until path confinement, symlink safety, payload limits, credential handling and automated regression tests are addressed.

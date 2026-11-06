# WI Dot — Roadmap

Items describe future work unless explicitly marked complete. The roadmap prioritizes a safe recovery workflow over broad automation.

## Phase 0 — Product and repository foundation
- [x] Define WI Dot as a Linux dotfiles and environment backup project.
- [x] Document the Laravel API, TypeScript CLI and React dashboard.
- [x] Define Linux environment recovery as the long-term product direction.
- [ ] Establish automated PHP, CLI and dashboard CI checks.
- [ ] Define and document a supported Linux distribution matrix.
- [ ] Publish an explicit license decision for the repository.

## Phase 1 — Filesystem safety (critical)
- [ ] Reject remote path traversal and unsafe absolute paths during pull.
- [ ] Enforce an approved restore root and validate canonical paths.
- [ ] Validate parent directories without following symlinks.
- [ ] Use lstat and skip symlinks during recursive collection by default.
- [ ] Add tests for symlink loops, external symlinks and traversal payloads.
- [ ] Add per-file, total payload, file-count and request-size limits.
- [ ] Add include/exclude patterns and dry-run for backup selection.
- [ ] Exclude credential and secret paths by default.
- [ ] Add restore preview, overwrite confirmation and local backups.

## Phase 2 — Reliable dotfile synchronization
- [ ] Add conflict detection when local and remote files both change.
- [ ] Add rollback to a previous encrypted version.
- [ ] Add safe retry/resume for interrupted uploads.
- [ ] Clarify behavior for removed or renamed local files.
- [ ] Add selective restore by file and category.
- [ ] Add cross-language crypto fixture tests between TypeScript and PHP.
- [ ] Add malformed Base64, invalid tag, wrong hash and unsupported KDF regression tests.
- [ ] Evaluate Linux Secret Service/KWallet for passphrase storage.

## Phase 3 — Linux environment inventory
- [ ] Detect distribution, version, architecture and package managers.
- [ ] Detect desktop environment and session (KDE Plasma, GNOME and others).
- [ ] Detect shell, terminal and key developer tools.
- [ ] Add read-only inventory adapters for pacman, apt, dnf, Flatpak and Snap.
- [ ] Define a versioned, portable environment manifest.
- [ ] Build a catalog of supported applications and configuration paths.
- [ ] Add inventory exclusions and privacy review.

## Phase 4 — Reinstallation and restore planner
- [ ] Compare a saved environment profile with a fresh Linux installation.
- [ ] Identify missing applications, packages and configuration files.
- [ ] Generate package-manager-specific install plans.
- [ ] Show dependencies, risks and required privileges.
- [ ] Add dry-run and per-action approval.
- [ ] Never execute downloaded scripts automatically.
- [ ] Add staged execution, logs, verification and rollback.
- [ ] Add post-install recovery reports.

## Phase 5 — Desktop and developer profiles
- [ ] Add KDE Plasma configuration profile.
- [ ] Add GNOME configuration profile.
- [ ] Add shell and terminal profiles for Bash, Zsh and Fish.
- [ ] Add Git, SSH client config and editor/IDE settings.
- [ ] Add Docker, PHP, Laravel and Node.js developer workstation profiles.
- [ ] Add user-level application settings with sensitive-path warnings.

## Phase 6 — Live dashboard
- [ ] Replace mock data with authenticated API data.
- [ ] Add environment selection and account state.
- [ ] Display inventory, file history and metadata.
- [ ] Show local/remote diffs and restore previews.
- [ ] Show package plan, approval states and execution report.
- [ ] Add responsive, accessible error and empty states.

## Phase 7 — Automation and platform expansion
- [ ] Add optional scheduled backups.
- [ ] Add Linux desktop notifications and optional tray app.
- [ ] Add tested install packages for supported distributions.
- [ ] Evaluate macOS and Windows platform adapters after Linux is stable.
- [ ] Document platform-specific gaps and restore compatibility.

## Release criteria

Do not recommend production or unattended restore until path confinement, symlink safety, payload limits, conflict handling, credential storage, package-plan approval and automated regression tests are addressed.

A machine restore must never silently install packages, alter repositories, enable services, overwrite files or run privileged commands.

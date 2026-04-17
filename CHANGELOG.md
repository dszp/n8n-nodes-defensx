# Changelog

All notable changes to the n8n-nodes-defensx project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Added ROADMAP.md documenting planned node improvements.
- Added workflow documentation for CHANGELOG.md update process.
- Added CLAUDE.md with commands, release flow, and architecture notes for Claude Code.

### Changed

- Updated GitHub Actions in release-publish workflow: `actions/checkout` v4 → v6.0.2, `actions/setup-node` v4 → v6.3.0, pinned to SHA hashes.
- Updated .gitignore to exclude `.claude/settings.local.json`.
- Added explicit `{ schema: 'core' }` option to YAML parsing in the OpenAPI code generator for defense-in-depth (no functional change).
- Consolidated keywords in package.json.

### Fixed

- All node output items now carry `pairedItem` linking back to their source input, so downstream nodes (e.g. Set/Edit Fields) can reference upstream DefensX results via `$('<node>').item` without "Paired item data is unavailable" errors. Applies to every operation — OpenAPI-driven, paginated (Usage, Users, Groups, Logs, Browser Extension Users), ID-enriched (Browser Extensions, Custom URLs), and Raw Request.
- Simplified the pagination UI to match the n8n verification pattern used across built-in nodes: the three-field `Return All` / `Max Results` / `Page Size` layout is replaced by a `Return All` toggle plus a conditional `Limit` field (hidden when Return All is enabled). The internal page size is now chosen automatically per endpoint, so users no longer see the implementation-detail "Page Size" knob. Applies to every paginated operation — Users, Groups, Browser Extension Users, all Logs endpoints, and Usage / Usage (Current). Saved workflows continue to work: the underlying parameter key (`maxResults`) is unchanged; only the display name and visibility rules changed.
- Hid the raw `page` and `limit` query-parameter fields on Usage → Get the current usage so they no longer duplicate the pagination UI (resolves a ROADMAP item).

## [1.0.3] - 2026-02-01

### Changed

- Improved DefensX 401/403 error handling for execution and load options, including guidance to check IP allowlist restrictions.

## [1.0.2] - 2025-12-21

### Added

- Added an SVG logo asset (`DefensX.svg`) for the DefensX node and credential.
- Added `.gitattributes` to normalize line endings and treat binary assets appropriately.
- Added an internal n8n node development guide under `.windsurf/rules/`.

### Changed

- Updated the DefensX node and credential icons to use the SVG logo (same asset for light and dark mode).
- Updated the build script to copy the SVG logo into `dist` and remove the old PNG icon from build output.
- Updated the GitHub Actions publish workflow to support manual runs (tag input) and improve Trusted Publishing diagnostics.

### Removed

- Removed the legacy PNG logo asset (`defensx-logo.png`).

## [1.0.1] - 2025-12-17

### Added

- Created CHANGELOG.md
- Automatic credential validation on save using the Status (health) endpoint (`GET /status`).
- DefensX API credential now displays the DefensX logo icon in n8n.
- Pagination controls for Users list operation.
- Pagination controls for Groups list operation.
- Pagination controls for Logs operations.
- Policy Group ID dropdown for the Policies "Show Policy" operation, scoped to the selected customer.

### Changed

- Improved query parameter display name formatting (including optional suffix for non-required `q`).
- Customer dropdown first option label updates based on whether `customerId` is required.
- README updated with a changelog reference, installation guidance, and notes about Create operations.

### Fixed

- Output enrichment for Custom URLs: inject `customUrlGroupId` into Items output mode.
- Browser Extensions Items output enrichment: inject `customerId` into Items output mode.
- Pagination execution correctness and output splitting for Users, Groups, and Logs operations.
- Hide raw `page`/`limit` parameters for paginated operations without runtime parameter access errors.

## [1.0.0] - 2025-12-16

### Added

- Initial release of the DefensX Partner API community node.

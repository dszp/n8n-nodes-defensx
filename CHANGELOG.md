# Changelog

All notable changes to the n8n-nodes-defensx project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.1] - 2025-12-17

### Added

- Created CHANGELOG.md
- Pagination controls for Users list operation.
- Pagination controls for Groups list operation.
- Pagination controls for Logs operations.
- Policy Group ID dropdown for the Policies "Show Policy" operation, scoped to the selected customer.

### Changed

- Improved query parameter display name formatting (including optional suffix for non-required `q`).
- Customer dropdown first option label updates based on whether `customerId` is required.

### Fixed

- Output enrichment for Custom URLs: inject `customUrlGroupId` into Items output mode.
- Browser Extensions Items output enrichment: inject `customerId` into Items output mode.
- Pagination execution correctness and output splitting for Users, Groups, and Logs operations.
- Hide raw `page`/`limit` parameters for paginated operations without runtime parameter access errors.

## [1.0.0] - 2025-12-16

### Added

- Initial release of the DefensX Partner API community node.

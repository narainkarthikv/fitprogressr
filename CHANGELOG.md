# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog
and this project adheres to Semantic Versioning.

## [Unreleased]

### Added
- Added a GitHub Actions CI workflow to run frontend lint, tests, and build checks.
- Added a standard root `LICENSE` file for clearer open-source compatibility tooling.

### Changed
- Added a CI status badge to `README.md`.
- Improved `CODE_OF_CONDUCT.md` contact guidance and moderator escalation path.
- Updated community template placement to `.github/PULL_REQUEST_TEMPLATE.md`.

### Fixed
- Corrected repository licensing metadata mismatch by setting backend package license to MIT.
- Replaced inaccurate `MIT-LICENSE.txt` copyright attribution.

## [1.2.0] - 2026-10-02

### Added
- Added API response schemas and backend route and validator tests.
- Added dashboard loading skeletons and a shared exercise dialog with workout and heatmap forms.

### Changed
- Modernized the dashboard, exercise table, streak, statistics, and activity heatmap, with tile intensity based on exercise count.
- Added frontend form validation, lazy-loaded routes, error boundaries, and clearer API configuration handling.
- Standardized authentication token naming and REST response status codes.

### Fixed
- Added consistent error handling around database operations and generic client-facing server errors.
- Corrected REST status codes and simplified profile form labeling.

### Security
- Validated and sanitized user input, strengthened password requirements, and rate limited authentication endpoints.

## [1.1.4] - 2026-06-21

### Fixed
- Corrected Docker build process to handle file permissions correctly when switching to a non-root user.
- Fixed npm install compatibility issues in containerized environments by running package installation before changing users.

### Security
- **Docker Security Hardening:**
  - Upgraded Docker base images from Node.js 18-alpine to Node.js 22-alpine (latest LTS with security updates).
  - Implemented non-root user execution for both backend and frontend containers (user: nodejs, group: nodejs, UID: 1001).
  - Optimized file ownership handling using `chown -R` after installation for better compatibility and reliability.
  - Improved npm install commands with `--prefer-offline --no-audit` flags and cache clearing for safer dependency installation.
- Updated Node.js engine requirements in package.json files from `>=18.0.0` to `>=20.0.0` for both frontend and backend.

## [1.1.3] - 2026-06-21

### Changed
- Refactored backend utility functions for better code organization and maintainability:
  - Extracted password hashing, validation, and user sanitization functions to `backend/utils/helpers.js`.
  - Extracted exercise validation functions to `backend/utils/validators.js`.
  - Consolidated MongoDB ObjectId conversion and date normalization utilities.
- Updated import statements in `routes/exercises.js` and `routes/user.js` to use centralized utility functions.
- Reduced route-handler duplication and improved error-response consistency and separation of concerns.
- Bumped package versions for patch release:
  - `frontend/package.json` -> `1.1.3`
  - `backend/package.json` -> `1.1.3`

### Fixed
- Fixed react-refresh ESLint warnings by extracting `AppRoot` into separate files (`main.jsx`, `CTA.jsx`).
- Standardized API error responses to use the `error` key.
- Removed the unused React import from `AppRoot.jsx`.

## [1.1.2] - 2026-05-25

### Changed
- Bumped package versions for patched release:
  - `frontend/package.json` -> `1.1.2`
  - `backend/package.json` -> `1.1.2`
- Updated frontend lint policy to disable noisy `react/prop-types` and `react/no-unescaped-entities` checks.
- Upgraded the frontend toolchain, including Vite, and backend dependencies.

### Fixed
- Resolved frontend linting errors caused by missing React hook imports, stale namespace usage, and unused imports/variables.

### Security
- Removed the deprecated, vulnerable backend dependency `request` and upgraded dependencies to address reported advisories.

## [1.1.1] - 2026-03-11

### Added
- Introduced initial design system improvements for consistent UI components.
- Updated project documentation for better developer onboarding.

### Fixed
- Resolved refresh token error affecting authentication flow.

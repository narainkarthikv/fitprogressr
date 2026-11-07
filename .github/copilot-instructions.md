# GitHub Copilot Coding Agent Instructions

## Purpose

These instructions onboard GitHub Copilot Coding Agent to the Fit-Track repository.
Follow this document as the single source of truth. Only search the repository if
information here is missing or incorrect.

---

## Repository Summary

**Fit-Track** is an open-source fitness tracking web application built using the
**MERN stack** (MongoDB, Express, React, Node.js).

It allows users to:

- Log exercises and workouts
- View activity heatmaps
- Track fitness progress via analytics
- Manage workout routines
- Authenticate securely using JWT

The repository contains **two primary applications**:

- A React + Vite frontend
- A Node.js + Express backend API

The project supports **local development** and **Docker-based development**.

---

## High-Level Repository Information

- **Repository Size**: Medium (frontend + backend, no monorepo tooling)
- **Languages**:
  - JavaScript (ES2022)
- **Frontend Stack**:
  - React 18
  - Vite
  - Redux Toolkit
  - Material UI (MUI)
  - Emotion
  - Vitest
- **Backend Stack**:
  - Node.js 18+
  - Express
  - MongoDB + Mongoose
  - JWT authentication
- **DevOps**:
  - Docker
  - Docker Compose
  - GitHub Actions (CI)

---

## Environment Requirements (Always Required)

### Runtime Versions

- **Node.js**: 18.x or newer (required)
- **npm**: 9.x or newer
- **Docker**: Optional but recommended
- **MongoDB**:
  - MongoDB Atlas (preferred)
  - OR local MongoDB instance

### Environment Files

- Root `.env` is required for Docker
- `backend/.env` is required for backend runtime
- `frontend/.env` is required for frontend runtime

⚠️ Missing environment variables will cause runtime failures.

---

## Build & Validation Instructions

### Docker (Recommended, Most Reliable)

**Always prefer Docker when possible.**

```bash
docker-compose up -d --build
```

Validated:

- Builds frontend and backend successfully
- Correctly wires environment variables
- Avoids local Node/Mongo version conflicts

Useful commands:

```bash
docker-compose logs -f
docker-compose down -v
docker-compose restart
```

---

### Local Development (Manual)

#### Backend (Always run first)

```bash
cd backend
npm install
npm run dev
```

- Requires `backend/.env`
- Runs on port `5000`
- MongoDB connection must succeed or server will crash

⚠️ `npm install` must always be run before `npm run dev`.

---

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Runs on port `5173`
- Requires `VITE_API_URL` to point to backend
- Frontend will fail silently if backend is unreachable

---

### Linting

```bash
cd frontend
npm run lint
```

- ESLint + Prettier
- Lint failures should be fixed before PR submission

---

### Tests

- Frontend tests use **Vitest**
- Backend tests are not fully implemented yet

```bash
cd frontend
npm test
```

⚠️ Do not assume backend test coverage exists.

---

## Common Build & Runtime Issues

### Node Version Mismatch

- Node <18 will cause Vite and dependency failures
- Always verify:

```bash
node --version
```

---

### MongoDB Issues

- `ATLAS_URI` must be valid
- MongoDB Atlas IP whitelist must allow access
- Database user must have read/write permissions

---

### Port Conflicts

- Backend: `5000`
- Frontend: `5173`

If ports are busy:

```bash
lsof -i :5000
lsof -i :5173
```

---

## Project Architecture & Layout

### Repository Root

```
/
├── backend/
├── frontend/
├── docker-compose.yml
├── .env.example
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── MIT-LICENSE.txt
```

---

### Backend Architecture (`/backend`)

- `server.js` – Express app entry point
- `models/` – Mongoose schemas
- `routes/` – API endpoints
- `middleware/jwtAuth.js` – JWT authentication

API routes are mounted under `/api/*`.

Health check:

```
GET /api/health
```

---

### Frontend Architecture (`/frontend`)

- `src/App.jsx` – Root component
- `src/main.jsx` – Entry point
- `src/pages/` – Route-level components
- `src/components/` – UI components grouped by feature
- `src/slices/` – Redux Toolkit slices
- `src/store/store.js` – Redux store configuration
- `src/theme/theme.js` – MUI theme

Frontend uses:

- Functional components only
- React hooks
- Redux Toolkit for state

---

## CI & Validation Expectations

Before submitting changes:

- Frontend must build without errors
- ESLint must pass
- App must run locally or via Docker
- API routes must not break authentication
- No breaking changes to environment variable names

---

## Design System & UI Guidelines

Refer to `design-system.md` for detailed design tokens, color palette, typography, and component patterns. When implementing UI components, always reference the design system for consistency.

---

## Coding Standards (Strict)

- Use **async/await**, not `.then()`
- Use **functional React components**
- No class components
- Follow existing file structure
- Do not introduce new state libraries
- Respect Material-UI theming system
- Max line length: **100 characters**

---

## Agent Guidance

- Trust this document first
- Avoid repository-wide searching unless required
- Prefer Docker for validation
- Do not refactor architecture unless explicitly requested
- Keep PRs focused and minimal
- Never change environment variable names without updating documentation

---

## End of Instructions

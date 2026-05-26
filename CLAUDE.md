# Thoughtful — Personal Relationship Manager

A full-stack CRM for managing personal/professional contacts, notes, tags, action items, milestones, and email outreach.

## Quick Commands

```bash
# Start both backend (:3001) and frontend (:3000) together
./thoughtful

# Or run individually
cd backend && npm start          # Express server on :3001
cd frontend && npm start         # React dev server on :3000
cd frontend && npm test          # Jest tests (react-scripts)
cd frontend && npm run build     # Production build
```

The backend auto-initializes the SQLite schema on startup from `backend/schema.sql`. The DB file is `backend/db.sqlite` and is committed to the repo (intentional — see `65fd531`).

## Architecture

**Backend** (`backend/`)
- Express 5 + `better-sqlite3` (synchronous SQLite).
- **All routes live in `backend/index.js`** (~774 lines). The `backend/routes/` directory exists but only contains `contacts.js`; the active pattern is one monolithic `index.js`.
- Schema in `backend/schema.sql` defines: `contacts`, `tags`, `notes`, `views`, `activity`, `email_templates`, `tag_definitions`, `quick_notes`. Triggers auto-write to `activity` on contact/note/tag inserts and updates.
- Hard-coded port `3001`, no env vars.

**Frontend** (`frontend/`)
- React 19 + React Router 7 + Axios.
- API modules in `frontend/src/api/` (one file per resource) all use the shared base URL `export const API = "http://localhost:3001"` from `frontend/src/api/contacts.js`.
- Components in `frontend/src/components/`. Routes wired in `frontend/src/App.js`. The top bar is `TitleBar.js`, which hosts global actions (Quick Add, Bulk Email, Add Contact) and a hamburger menu for secondary nav.
- Styling is inline-style objects (no CSS framework, no CSS modules).
- Global keyboard shortcuts handled in `App.js` (`Cmd+/` shortcuts modal, `Cmd+K` search, `g` then `h/a/m/e/s` for nav).

**Data flow conventions**
- Most list endpoints accept query-param filters (e.g. `GET /contacts?tags=&created_after=`); see `backend/index.js` for parsing patterns.
- Activity rows are written by SQL triggers, not application code — when adding a new tracked event type, prefer a trigger.
- Template variables in email bodies use bracket syntax: `[FIRSTNAME]`, `[COMPANY]`, `[TOPIC]`, `[SENDER]`. They're replaced client-side before opening Gmail compose URLs.

## Gmail Compose Integration

Bulk email opens `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1` with URL-encoded `to` / `bcc` / `su` / `body` params — no Gmail API, no auth. Each click opens a new tab.

## Coding Conventions

- **No CSS files** — use inline `style={{}}` objects matching the existing palette: primary `#4B0082` (indigo), accents `#FFB6C1` (rose), `#00BFFF` (sky blue).
- **Inline styles over components for now** — there is no design system. Match the surrounding component's style patterns.
- **Avoid premature abstraction** — match the rest of the repo: one big `index.js` for backend routes, one file per page in components.
- **Keep API base URL imports from `contacts.js`** rather than redeclaring `http://localhost:3001` in new modules.
- **New tables**: add to `schema.sql` only (no migrations system) — schema is `CREATE TABLE IF NOT EXISTS`.

## Things to Avoid

- Don't introduce env-var config or a build step for the backend — the project is intentionally single-machine / local-first.
- Don't add a CSS framework or refactor inline styles into modules without discussing — it would touch every component.
- Don't add Gmail API auth — the compose-URL approach is the design.

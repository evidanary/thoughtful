# Thoughtful — Personal Relationship Manager

User-facing docs live in `README.md` (overview), `DEPLOY.md` (Fly.io setup) and `BACKUP.md` (recovery). Keep them in sync when behaviour changes.

A full-stack CRM for managing personal/professional contacts, notes, tags, action items, milestones, and email outreach.

## Quick Commands

```bash
# Start both backend (:3002) and frontend (:3000) together
./thoughtful

# Or run individually
cd backend && npm start          # Express server on :3002
cd frontend && npm start         # React dev server on :3000
cd frontend && npm test          # Jest tests (react-scripts)
cd frontend && npm run build     # Production build
```

The backend auto-initializes the SQLite schema on startup from `backend/schema.sql`. The DB file is `backend/db.sqlite` and is committed to the repo (intentional — see `65fd531`).

## Architecture

**Backend** (`backend/`)
- Express 5 + `better-sqlite3` (synchronous SQLite).
- **All routes live in `backend/index.js`** (~1300 lines). The `backend/routes/` directory exists but only contains `contacts.js`; the active pattern is one monolithic `index.js`.
- Schema in `backend/schema.sql` defines: `contacts`, `tags`, `notes`, `views`, `activity`, `email_templates`, `tag_definitions`, `quick_notes`, `milestone_notes`, `campaigns`, `campaign_stages`, `campaign_contacts`, `stage_templates`. Triggers auto-write to `activity` on contact/note/tag inserts and updates, and on campaign membership and stage moves.
- Port `3002` by default via `PORT` (3001 is avoided — it collides with another local dev server). Config is env-var driven for deployment only; see `DEPLOY.md`.
- `schema.sql` is `CREATE TABLE IF NOT EXISTS`, so it cannot add columns to existing tables. `index.js` has an idempotent `addColumnIfMissing()` block that runs every boot — put new columns on existing tables there **and** in `schema.sql`.

**Frontend** (`frontend/`)
- React 19 + React Router 7 + Axios.
- API modules in `frontend/src/api/` (one file per resource) all use the shared base URL `export const API = "http://localhost:3002"` from `frontend/src/api/contacts.js`.
- Components in `frontend/src/components/`. Routes wired in `frontend/src/App.js`. Navigation is a fixed left sidebar, `SideBar.js`, which hosts the brand, search, global actions (Add Contact, Quick Add, Bulk Email) and every nav link. `App.js` renders it beside a scrollable content column.
- Styling is inline-style objects (no CSS framework, no CSS modules).
- Global keyboard shortcuts handled in `App.js` (`Cmd+/` shortcuts modal, `Cmd+K` search, `g` then `h/a/m/e/s/c` for nav). `ShortcutsModal.js` lists them — keep it in sync.

**Data flow conventions**
- Most list endpoints accept query-param filters (e.g. `GET /contacts?tags=&created_after=`); see `backend/index.js` for parsing patterns.
- Activity rows are written by SQL triggers, not application code — when adding a new tracked event type, prefer a trigger.
- Template variables in email bodies use bracket syntax: `[FIRSTNAME]`, `[COMPANY]`, `[TOPIC]`, `[SENDER]`. They're replaced client-side before opening Gmail compose URLs.

## Campaigns

Time-bound outreach pushes. **Every campaign owns its own ordered stage list** — never assume a shared set of stages.

- `campaigns` → `campaign_stages` (ordered by `position`) → `campaign_contacts` (one row per person per campaign, pointing at a `stage_id`).
- `stage_templates` holds the default progression copied into each new campaign (seeded once in `index.js` when the table is empty: Reached out → Follow-up → Last email → Engaged → Actively engaged → Closed). Editing the template does not touch existing campaigns.
- `PUT /campaigns/:id/stages` and `PUT /stage-templates` both **replace the whole list**. Stages sent with an `id` are updated in place and keep their contacts; stages dropped from the payload are deleted and their contacts fall into the first remaining stage.
- `GET /campaigns/combined?ids=1,2` rolls several campaigns into one person-per-row matrix. It is registered **before** `/campaigns/:id` — keep it there or Express will treat "combined" as an id.
- Frontend: `CampaignsPage.js` (list + stage counts + combine picker), `CampaignBoard.js` (kanban at `/campaigns/:id`, HTML5 drag-and-drop, no DnD library), `CampaignsCombinedPage.js`, `StageEditorModal.js` (reused for both a campaign's stages and the default template), `ContactCampaigns.js` (the section on a contact's profile).

## Auth & attribution

- Access is a hard-coded allow list in `backend/allowed-users.js`. Google Identity Services issues an ID token, `backend/auth.js` verifies it and mints an HttpOnly session cookie; sessions expire after `SESSION_TTL_HOURS` (default 12) so people re-authenticate periodically.
- **Locally auth is off** when `GOOGLE_CLIENT_ID` is unset — the server reports a fixed dev user, so `./thoughtful` works exactly as before. Production refuses to boot without `GOOGLE_CLIENT_ID` and `SESSION_SECRET`.
- Only paths whose first segment is in `API_SEGMENTS` (in `index.js`) require a session. Add new API prefixes to that set or they will be public.
- `req.user.email` is written to `created_by` / `updated_by` on contacts, notes, and campaigns via the `actor(req)` helper. The UI resolves emails to first names client-side with `displayName()` from `frontend/src/api/auth.js` — attribution shows on note headers, the contact profile, and the campaign board header only.
- `frontend/src/api/contacts.js` sets `axios.defaults.withCredentials` and an interceptor that fires a `thoughtful:signed-out` event on any 401, which drops the app back to `AuthGate`.

## Deployment

Fly.io, one machine, mirroring the porpoise app: `Dockerfile` builds the React app and copies it to `backend/public`, which Express serves alongside the API (same origin, so cookies just work). SQLite lives on a volume at `/data/db.sqlite`, seeded on first boot from the committed `backend/db.sqlite`. Full runbook in `DEPLOY.md`.

## Backups

The production database is one SQLite file on a Fly volume, so backups matter.
`./scripts/backup.sh` snapshots it (via SQLite's online backup API, never `cat`),
downloads it to `backups/`, verifies it, keeps the newest 5, and commits to Git.
`./scripts/deploy.sh` wraps `fly deploy` with that backup. Recovery runbook:
`BACKUP.md`. The scripts under `backend/scripts/` run **on the machine** and are
in the image because the Dockerfile copies all of `backend/`.

## Gmail Compose Integration

Bulk email opens `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1` with URL-encoded `to` / `bcc` / `su` / `body` params — no Gmail API, no auth. Each click opens a new tab.

## Coding Conventions

- **No CSS files** — use inline `style={{}}` objects matching the existing palette: primary `#4B0082` (indigo), accents `#FFB6C1` (rose), `#00BFFF` (sky blue).
- **Inline styles over components for now** — there is no design system. Match the surrounding component's style patterns.
- **Avoid premature abstraction** — match the rest of the repo: one big `index.js` for backend routes, one file per page in components.
- **Keep API base URL imports from `contacts.js`** rather than redeclaring the base URL in new modules.
- **New tables**: add to `schema.sql` only (no migrations system) — schema is `CREATE TABLE IF NOT EXISTS`.

## Things to Avoid

- Don't add env-var config for *local* behaviour — local-first defaults must keep working with no environment set. Deployment-only config (auth, DB path, port) is the exception and lives in `DEPLOY.md`.
- Don't add a CSS framework or refactor inline styles into modules without discussing — it would touch every component.
- Don't add Gmail API auth — the compose-URL approach is the design.

# Thoughtful

A personal relationship manager: contacts, notes, tags, action items, campaigns
and email outreach, built for one small team rather than for scale.

Local-first by default — clone it, run one script, and it works with no
accounts or configuration. The same codebase deploys to Fly.io behind Google
sign-in when you want it shared.

```bash
./thoughtful          # backend on :3002, frontend on :3000
```

---

## Contents

- [Running it locally](#running-it-locally)
- [What's in it](#whats-in-it)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [Access control](#access-control)
- [Deployment](#deployment)
- [Backups](#backups)
- [Documentation map](#documentation-map)

---

## Running it locally

```bash
./thoughtful                     # both servers together
```

Or separately:

```bash
cd backend  && npm start         # Express on :3002
cd frontend && npm start         # React dev server on :3000
cd frontend && npm run build     # production build
```

The backend creates and migrates its own SQLite schema on startup, so there is
no setup step. The database is `backend/db.sqlite` and is **committed to the
repo on purpose** — it doubles as the seed for a fresh deployment.

Locally there is **no sign-in**: with no `GOOGLE_CLIENT_ID` set, the server
reports a fixed dev user and everything works as it always has. The sidebar
shows a small `dev` chip instead of a sign-out button, because there is no
session to end.

## What's in it

**Contacts** — the core record: name, company, email, LinkedIn, free-form notes,
and tags. Filterable saved views, full-text search (`⌘K`), CSV export, and bulk
email that opens pre-filled Gmail compose tabs (no Gmail API, no OAuth).

**Campaigns** — time-bound outreach pushes. **Every campaign owns its own stage
progression**; there is no global set of stages. New campaigns copy an editable
default template (Reached out → Follow-up → Last email → Engaged → Actively
engaged → Closed), then diverge freely.

- `/campaigns` lists them newest first with a headcount per stage
- `/campaigns/:id` is a kanban board — drag people between stages, or use the
  ◀ ▶ steppers. Description, dates, days remaining and creator sit above it.
- `/campaigns/combined?ids=1,2` puts several campaigns side by side. Since
  their stages differ, the roll-up is a matrix: one row per person, one column
  per campaign, each cell their stage there.
- A contact's profile lists the campaigns they are in and their stage in each.

**Tags** — a tag library with descriptions at `/tags`. Click any tag to expand
the row and see everyone carrying it.

**Action items & inbox** — `@action` and `@ask` lines inside notes are tracked
separately. Quick Add captures a note before you know who it belongs to;
`/quick-notes` is where you file them against a contact later.

**Milestones** — GTM and Product goals with per-milestone notes, as a list or
a calendar.

**Stamina Viz** — contacts as characters in a 3D space (Babylon.js, loaded from
CDN at runtime). Distance from the centre is days since last activity, a yellow
glow means the relationship has gone stale. Hover for details; `T` pins a label
on everyone at once.

**Attribution** — notes, contacts and campaigns record who created and last
edited them, shown on note headers, the contact profile, and the campaign board.

## Keyboard shortcuts

| Keys | Does |
| --- | --- |
| `⌘K` | search |
| `⌘/` | shortcuts and syntax help |
| `g` `h` | contacts |
| `g` `c` | campaigns |
| `g` `a` | action items |
| `g` `m` | milestones |
| `g` `e` | email templates |
| `g` `s` | social media |
| `T` | toggle all labels (Stamina Viz only) |

## Architecture

```
backend/     Express 5 + better-sqlite3. All routes in index.js.
  schema.sql       tables and the triggers that write the activity feed
  auth.js          Google ID-token verification and session cookies
  allowed-users.js the hard-coded access list
  scripts/         snapshot / verify / restore, run on the Fly machine
frontend/    React 19 + React Router 7 + Axios, inline styles only
  src/api/         one module per resource, sharing one base URL
  src/components/  one file per page or modal
scripts/     backup.sh and deploy.sh, run on your laptop
backups/     the newest 5 production snapshots, committed to Git
```

Deliberate choices worth knowing before you change things:

- **One monolithic `backend/index.js`.** Not an accident; don't split it up.
- **Inline styles, no CSS framework.** Palette is indigo `#4B0082`, rose
  `#FFB6C1`, sky `#00BFFF`.
- **Activity rows come from SQL triggers**, not application code.
- **`schema.sql` is `CREATE TABLE IF NOT EXISTS`**, so it cannot add a column to
  a table that already exists. `index.js` has an idempotent `addColumnIfMissing`
  block for that — new columns go in both places.
- **In production Express serves the built React app**, so the API and UI share
  one origin and the session cookie needs no cross-site handling.

`CLAUDE.md` has the full set of conventions.

## Access control

Access is a **hard-coded list** in `backend/allowed-users.js` — no sign-up, no
invites. Add or remove someone and redeploy:

```js
const ALLOWED_USERS = [
  { email: "yash@realityshop.io", name: "Yash" },
  { email: "xavier@videoselz.com", name: "Xavier" },
];
```

Google Identity Services issues an ID token, the server verifies it and checks
the list, then mints an HttpOnly session cookie. Sessions expire after
`SESSION_TTL_HOURS` (default 12) so people re-authenticate periodically; change
it with `fly secrets set SESSION_TTL_HOURS=8`. A valid Google account that is
not on the list is rejected with a clear message.

Production **refuses to boot** without `GOOGLE_CLIENT_ID` and `SESSION_SECRET`,
so a misconfigured deploy fails loudly instead of quietly serving an open app.

## Deployment

One Fly.io machine runs everything: the Dockerfile builds the React app and
copies it into `backend/public`, which Express serves alongside the API. SQLite
lives on a mounted volume at `/data/db.sqlite`, seeded on first boot from the
committed `backend/db.sqlite`.

```bash
./scripts/deploy.sh              # backs up first, then deploys
```

First-time setup — creating the Google OAuth client, the Fly app, the volume
and the secrets — is in **[DEPLOY.md](DEPLOY.md)**.

## Backups

The database is a single file on a single volume, so losing the volume loses
everything. Backups therefore live in Git.

```bash
./scripts/backup.sh              # snapshot, download, verify, rotate, push
```

It wakes the machine, takes a **consistent** snapshot using SQLite's online
backup API (a plain `cat` can capture a torn page mid-write), downloads it to
`backups/`, verifies it with `integrity_check` and a row count, keeps the newest
5, and commits. A failed download or verification is discarded **without**
rotating away good backups.

`.github/workflows/backup.yml` does the same nightly, which matters more than
the pre-deploy hook — data changes on days you don't ship.

Restoring is in **[BACKUP.md](BACKUP.md)**, including "I restored the wrong
file" and "the volume is gone".

## Documentation map

| File | For |
| --- | --- |
| `README.md` | this — what it is and how to run it |
| [`DEPLOY.md`](DEPLOY.md) | first-time Fly.io setup, every config variable |
| [`BACKUP.md`](BACKUP.md) | how backups work, step-by-step recovery |
| `CLAUDE.md` | conventions and gotchas for anyone (human or AI) editing the code |

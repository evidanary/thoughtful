# Deploying Thoughtful to Fly.io

One Fly machine runs everything: Express serves the API *and* the built React
app from the same origin, with the SQLite database on a persistent volume.

Access is restricted to the Google accounts hard-coded in
[`backend/allowed-users.js`](backend/allowed-users.js). To add or remove someone,
edit that file and redeploy — there is no invite flow and no self sign-up.

```js
const ALLOWED_USERS = [
  { email: "yash@realityshop.io", name: "Yash" },
  { email: "xavier@videoselz.com", name: "Xavier" },
];
```

## 1. Create the Google OAuth client

This is the only step I could not do for you — it needs your Google account.

1. Go to <https://console.cloud.google.com/apis/credentials>.
2. Create (or pick) a project, then **Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. **Authorized JavaScript origins** — add both:
   - `https://thoughtful-crm.fly.dev`
   - `http://localhost:3000` (so you can test sign-in locally)
5. Leave *Authorized redirect URIs* empty — this uses Google Identity Services
   (the ID-token flow), not a redirect flow.
6. Copy the **Client ID** (it looks like `1234-abcd.apps.googleusercontent.com`).

On the OAuth consent screen, set the publishing status to **In production** (or
add both emails as test users) so sign-in isn't blocked.

## 2. Create the app and volume

```bash
cd ~/thoughtful
fly launch --no-deploy --name thoughtful-crm --region yyz   # reuses fly.toml
fly volumes create thoughtful_data --region yyz --size 1
```

## 3. Set the secrets

```bash
fly secrets set \
  GOOGLE_CLIENT_ID="<the client id from step 1>" \
  SESSION_SECRET="$(openssl rand -hex 32)" \
  APP_ORIGIN="https://thoughtful-crm.fly.dev"
```

The server **refuses to boot in production** without `GOOGLE_CLIENT_ID` and
`SESSION_SECRET`, so a misconfigured deploy fails loudly instead of quietly
serving an unauthenticated app.

## 4. Deploy

```bash
fly deploy
```

On the first boot the volume is empty, so the committed `backend/db.sqlite` is
copied to `/data/db.sqlite`. After that the volume is the source of truth and
the committed file is ignored.

## Configuration

| Variable | Where | Default | What it does |
| --- | --- | --- | --- |
| `GOOGLE_CLIENT_ID` | secret | — | Enables Google sign-in. Unset locally = auth off. |
| `SESSION_SECRET` | secret | dev value | Signs the session cookie. Rotating it signs everyone out. |
| `SESSION_TTL_HOURS` | `fly.toml` `[env]` | `12` | **How often people re-authenticate.** |
| `APP_ORIGIN` | secret | — | Extra allowed CORS origin. |
| `DB_PATH` | `fly.toml` `[env]` | `backend/db.sqlite` | Where SQLite lives. |
| `PORT` | `fly.toml` `[env]` | `3002` | Server port. |
| `DEV_USER_EMAIL` | local only | `yash@realityshop.io` | Who local writes are attributed to when auth is off. |

To change how often people sign in again:

```bash
fly secrets set SESSION_TTL_HOURS=8   # or edit fly.toml and redeploy
```

## Local development is unchanged

With no `GOOGLE_CLIENT_ID` set, auth is **off**: the backend reports a fixed
local user and `./thoughtful` behaves exactly as before. Writes are attributed
to `DEV_USER_EMAIL`. To exercise the real sign-in flow locally:

```bash
cd backend
GOOGLE_CLIENT_ID="<client id>" SESSION_SECRET=whatever npm start
```

## Backing up the database

```bash
fly ssh console -C "cat /data/db.sqlite" > backup-$(date +%F).sqlite
```

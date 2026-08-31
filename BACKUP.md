# Backup & recovery

The production database is a single SQLite file on a Fly volume at
`/data/db.sqlite`. If that volume is destroyed, the data is gone — so backups
live somewhere else entirely: in `backups/`, committed to GitHub.

| | |
| --- | --- |
| Take a backup now | `./scripts/backup.sh` |
| Deploy (backs up first) | `./scripts/deploy.sh` |
| Restore | see [Recovery](#recovery) below |
| Retained | newest **5**, rotated automatically |

## How a backup is taken

`scripts/backup.sh` does five things, and stops at the first sign of trouble:

1. **Wakes the machine.** With `auto_stop_machines`, it may be asleep; an HTTP
   request starts it so `fly ssh` has something to reach.
2. **Snapshots on the machine** with `node scripts/snapshot.js`, which uses
   SQLite's online backup API. A plain `cat /data/db.sqlite` can copy a torn
   page if a write lands mid-read; this cannot.
3. **Downloads** it to `backups/thoughtful-<UTC>.db`.
4. **Verifies** the downloaded file — `integrity_check`, plus a row count, so a
   truncated or empty file is rejected rather than counted as a backup. **A
   failed verification deletes the bad download and leaves older backups
   untouched**, so a broken run can never rotate away a good backup.
5. **Rotates and commits.** Keeps the 5 newest, `git commit`s, and pushes.

Escape hatches: `BACKUP_NO_PUSH=1` commits without pushing, `BACKUP_NO_GIT=1`
just leaves the file on disk.

## Backing up before a production push

Use `./scripts/deploy.sh` in place of `fly deploy`. It runs `backup.sh` first,
then `fly deploy --remote-only`. If the app is not deployed yet it notices and
skips the backup instead of failing.

```bash
./scripts/deploy.sh
```

Make it the habit and the "I forgot to back up" case disappears. If you want a
hard guarantee, add a Git pre-push hook:

```bash
cat > .git/hooks/pre-push <<'HOOK'
#!/bin/sh
# Not committed to the repo — hooks are per-clone
exec ./scripts/backup.sh
HOOK
chmod +x .git/hooks/pre-push
```

### Optional: a nightly backup in GitHub Actions

Deploys are manual from your laptop, so the pre-deploy hook covers pushes. What
it does *not* cover is a quiet week where data changes but nothing ships. A
scheduled job does:

1. Create a deploy token: `fly tokens create deploy --name backup-bot`
2. Add it to the repo as the secret `FLY_API_TOKEN`
   (Settings → Secrets and variables → Actions)
3. The workflow at `.github/workflows/backup.yml` then runs daily at 07:00 UTC
   and commits any new snapshot. Trigger it by hand from the Actions tab too.

## Recovery

You have a good backup file (either from `backups/` or an older Git revision)
and want it live.

**1. Pick the backup and check it.**

```bash
ls -lt backups/
cd backend && node scripts/verify.js ../backups/thoughtful-2026-08-31T07-00-00Z.db && cd ..
```

To pull one that rotation already dropped, take it out of Git history:

```bash
git log --oneline -- backups/
git checkout <commit> -- backups/thoughtful-<stamp>.db
```

**2. Upload it to the machine.**

```bash
fly ssh sftp shell --app thoughtful-crm
# at the prompt:
put backups/thoughtful-2026-08-31T07-00-00Z.db /data/incoming.db
exit
```

**3. Restore it.**

```bash
fly ssh console --app thoughtful-crm -C "node scripts/restore.js /data/incoming.db"
```

The script verifies the incoming file *before* touching anything, then saves the
current database to `/data/pre-restore-<timestamp>.db` — that is your undo if
you restored the wrong file — and only then overwrites the live database.

**4. Restart so every connection reopens the file.**

```bash
fly apps restart thoughtful-crm
```

**5. Confirm.**

```bash
fly ssh console --app thoughtful-crm -C "node scripts/verify.js /data/db.sqlite"
```

Then open the app and spot-check a contact and a note.

### If you restored the wrong file

The undo copy is still on the volume:

```bash
fly ssh console --app thoughtful-crm -C "ls -la /data"
fly ssh console --app thoughtful-crm -C "node scripts/restore.js /data/pre-restore-<timestamp>.db"
fly apps restart thoughtful-crm
```

### If the volume itself is gone

Recreate it, redeploy, and restore:

```bash
fly volumes create thoughtful_data --region yyz --size 1
fly deploy --remote-only
# then steps 2-5 above
```

On first boot with an empty volume the app seeds `/data/db.sqlite` from the
`backend/db.sqlite` committed in the repo, so even a total loss leaves you at
that checkpoint rather than at zero.

### Reading a backup without restoring it

They are ordinary SQLite files:

```bash
sqlite3 backups/thoughtful-2026-08-31T07-00-00Z.db "SELECT name, company FROM contacts LIMIT 10;"
```

## What this does not protect against

- **Slow corruption you don't notice for a week.** Only 5 backups are kept, so a
  problem older than the oldest one is only recoverable from Git history — which
  does keep every snapshot ever committed. `git log -- backups/` is the deeper
  archive.
- **Losing GitHub and Fly at once.** If that matters, copy `backups/` somewhere
  else occasionally.

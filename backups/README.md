# Database backups

Snapshots of the production SQLite database, newest 5 kept, committed to Git so
there is always an off-machine copy.

- Take one: `./scripts/backup.sh`
- Deploy with a backup first: `./scripts/deploy.sh`
- Restore one: see [`../BACKUP.md`](../BACKUP.md)

Files are named `thoughtful-<UTC timestamp>.db`. They are real SQLite
databases — `sqlite3 backups/thoughtful-….db` opens one directly, and
`cd backend && node scripts/verify.js ../backups/thoughtful-….db` checks it.

Do not edit or reorder these by hand; `scripts/backup.sh` rotates them by
filename order.

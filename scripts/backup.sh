#!/usr/bin/env bash
#
# Takes a consistent snapshot of the production database, downloads it into
# backups/, keeps the newest 5, and commits them to Git.
#
#   ./scripts/backup.sh              # snapshot, rotate, commit and push
#   BACKUP_NO_PUSH=1 ./scripts/backup.sh   # commit locally, don't push
#   BACKUP_NO_GIT=1  ./scripts/backup.sh   # just download the file
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BACKUP_DIR="backups"
KEEP=5
REMOTE_SNAPSHOT="/tmp/thoughtful-snapshot.db"

# App name comes from fly.toml so renaming the app needs no edit here
APP="$(grep -E '^app *= *' fly.toml | head -1 | sed -E 's/.*"(.*)".*/\1/')"
if [ -z "$APP" ]; then
  echo "Could not read the app name from fly.toml" >&2
  exit 1
fi

STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
LOCAL_FILE="${BACKUP_DIR}/thoughtful-${STAMP}.db"

mkdir -p "$BACKUP_DIR"

echo "==> Backing up ${APP}"

# The machine may be asleep (auto_stop_machines). A plain HTTP request wakes it;
# fly ssh has nothing to connect to until it is up.
echo "--> Waking the machine"
curl -s -o /dev/null --max-time 90 "https://${APP}.fly.dev/auth/config" || true

# 1. Consistent snapshot on the machine, using SQLite's backup API
echo "--> Snapshotting the live database"
attempt=1
until fly ssh console --app "$APP" -C "node scripts/snapshot.js ${REMOTE_SNAPSHOT}"; do
  if [ "$attempt" -ge 3 ]; then
    echo >&2
    echo "Could not reach ${APP} over SSH after ${attempt} attempts." >&2
    echo "If the app is not deployed yet, run 'fly deploy --remote-only' first." >&2
    echo "Otherwise check 'fly status --app ${APP}'." >&2
    exit 1
  fi
  echo "    ssh attempt ${attempt} failed, retrying in 10s…"
  attempt=$((attempt + 1))
  sleep 10
done

# 2. Pull it down
echo "--> Downloading to ${LOCAL_FILE}"
fly ssh sftp get "$REMOTE_SNAPSHOT" "$LOCAL_FILE" --app "$APP"

# fly sftp exits 0 even when it writes nothing useful, so check the file itself
if [ ! -s "$LOCAL_FILE" ]; then
  echo "Downloaded file is empty — aborting without touching existing backups." >&2
  rm -f "$LOCAL_FILE"
  exit 1
fi

# 3. Verify locally before it is allowed to count as a backup
echo "--> Verifying"
if ! (cd backend && node scripts/verify.js "../${LOCAL_FILE}"); then
  echo "Verification failed — discarding this download, older backups untouched." >&2
  rm -f "$LOCAL_FILE"
  exit 1
fi

# Tidy the machine's temp copy
fly ssh console --app "$APP" -C "rm -f ${REMOTE_SNAPSHOT}" >/dev/null 2>&1 || true

# 4. Rotate: keep the newest $KEEP. Filenames are UTC timestamps, so a plain
#    lexicographic sort is chronological.
# (macOS ships bash 3.2, so no mapfile and no GNU `head -n -5`)
echo "--> Rotating (keeping ${KEEP})"
ALL_FILES="$(find "$BACKUP_DIR" -name 'thoughtful-*.db' | sort)"
COUNT="$(printf '%s\n' "$ALL_FILES" | grep -c . || true)"
if [ "$COUNT" -gt "$KEEP" ]; then
  printf '%s\n' "$ALL_FILES" | head -n "$((COUNT - KEEP))" | while IFS= read -r old; do
    [ -n "$old" ] || continue
    echo "    removing $(basename "$old")"
    rm -f "$old"
  done
fi

ls -1 "$BACKUP_DIR"/thoughtful-*.db | sed 's/^/    /'

# 5. Commit and push
if [ "${BACKUP_NO_GIT:-0}" = "1" ]; then
  echo "==> Done (BACKUP_NO_GIT=1, nothing committed)"
  exit 0
fi

echo "--> Committing"
git add -A "$BACKUP_DIR"
if git diff --cached --quiet; then
  echo "    nothing changed"
else
  SIZE="$(du -h "$LOCAL_FILE" | cut -f1)"
  git commit -q -m "Back up production database ${STAMP} (${SIZE})"
  if [ "${BACKUP_NO_PUSH:-0}" = "1" ]; then
    echo "    committed locally (BACKUP_NO_PUSH=1)"
  else
    BRANCH="$(git rev-parse --abbrev-ref HEAD)"
    echo "--> Pushing to origin/${BRANCH}"
    git push origin "$BRANCH"
  fi
fi

echo "==> Backup complete: ${LOCAL_FILE}"

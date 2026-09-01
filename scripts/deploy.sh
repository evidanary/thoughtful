#!/usr/bin/env bash
#
# Back up production, then deploy. Use this instead of bare `fly deploy` so
# there is always a fresh snapshot from *before* whatever you are about to ship.
#
#   ./scripts/deploy.sh
#   SKIP_BACKUP=1 ./scripts/deploy.sh    # first deploy, or when the app is down
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

APP="$(grep -E '^app *= *' fly.toml | head -1 | sed -E 's/.*"(.*)".*/\1/')"

# `fly status` succeeds as soon as the app exists, which it does from
# `fly apps create` — long before anything is deployed. Count machines instead.
MACHINES="$(fly machines list --app "$APP" --json 2>/dev/null \
  | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))' 2>/dev/null \
  || echo 0)"

if [ "${SKIP_BACKUP:-0}" = "1" ]; then
  echo "==> Skipping pre-deploy backup (SKIP_BACKUP=1)"
elif [ "$MACHINES" = "0" ]; then
  # Nothing to back up before the very first deploy
  echo "==> ${APP} has no machines yet — skipping the pre-deploy backup"
else
  echo "==> Pre-deploy backup"
  ./scripts/backup.sh
fi

echo "==> Deploying ${APP}"
# --remote-only: Docker is not installed on this machine, so Fly builds it
fly deploy --remote-only --app "$APP"

echo "==> Deployed. Watch it come up with: fly logs --app ${APP}"

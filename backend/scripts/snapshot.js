#!/usr/bin/env node
/**
 * Writes a consistent copy of the live database to <destination>.
 *
 * Runs *on the Fly machine*. A plain `cp` or `cat /data/db.sqlite` can capture
 * a torn page if a write lands mid-read, so this uses SQLite's own online
 * backup API, which is safe against a database that is being written to.
 *
 *   node scripts/snapshot.js /tmp/snapshot.db
 */
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const source = process.env.DB_PATH || path.join(__dirname, "..", "db.sqlite");
const destination = process.argv[2];

if (!destination) {
  console.error("usage: node scripts/snapshot.js <destination>");
  process.exit(1);
}

if (!fs.existsSync(source)) {
  console.error(`No database at ${source}`);
  process.exit(1);
}

const db = new Database(source, { readonly: true });

db.backup(destination)
  .then(() => {
    const { size } = fs.statSync(destination);
    console.log(`SNAPSHOT_OK ${destination} ${size}`);
    db.close();
  })
  .catch((error) => {
    console.error(`Snapshot failed: ${error.message}`);
    process.exit(1);
  });

#!/usr/bin/env node
/**
 * Restores an uploaded backup over the live database. Runs *on the Fly machine*.
 *
 *   node scripts/restore.js /data/incoming.db
 *
 * Order of operations is deliberate:
 *   1. verify the incoming file before touching anything
 *   2. snapshot the current live DB to /data/pre-restore-<ts>.db (the undo)
 *   3. copy the incoming file over the live DB via SQLite's backup API
 *
 * Restart the app afterwards so every connection reopens the new file.
 */
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const incoming = process.argv[2];
const live = process.env.DB_PATH || path.join(__dirname, "..", "db.sqlite");

if (!incoming) {
  console.error("usage: node scripts/restore.js <uploaded backup>");
  process.exit(1);
}
if (!fs.existsSync(incoming)) {
  console.error(`No such file: ${incoming}`);
  process.exit(1);
}

// 1. Verify before we put anything at risk
let source;
try {
  source = new Database(incoming, { readonly: true });
  const integrity = source.pragma("integrity_check", { simple: true });
  if (integrity !== "ok") throw new Error(`integrity_check said: ${integrity}`);
  const contacts = source.prepare("SELECT COUNT(*) AS n FROM contacts").get().n;
  if (!contacts) throw new Error("backup contains no contacts");
  console.log(`Incoming backup looks good (${contacts} contacts)`);
} catch (error) {
  console.error(`Refusing to restore: ${error.message}`);
  process.exit(1);
}

const run = async () => {
  // 2. Keep an undo copy of whatever is live right now
  if (fs.existsSync(live)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const undo = path.join(path.dirname(live), `pre-restore-${stamp}.db`);
    const current = new Database(live, { readonly: true });
    await current.backup(undo);
    current.close();
    console.log(`Current database saved to ${undo}`);
  }

  // 3. Overwrite the live database at the SQLite level
  await source.backup(live);
  source.close();
  console.log(`RESTORE_OK ${live}`);
  console.log("Now restart the app so open connections reopen the file.");
};

run().catch((error) => {
  console.error(`Restore failed: ${error.message}`);
  process.exit(1);
});

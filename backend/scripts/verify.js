#!/usr/bin/env node
/**
 * Confirms a backup file is a readable, uncorrupted Thoughtful database.
 * Used locally after every download, and on the machine before a restore.
 *
 *   node scripts/verify.js backups/thoughtful-2026-08-31T12-00-00Z.db
 */
const fs = require("fs");
const Database = require("better-sqlite3");

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/verify.js <backup file>");
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`No such file: ${file}`);
  process.exit(1);
}

let db;
try {
  db = new Database(file, { readonly: true });
} catch (error) {
  console.error(`Not a readable SQLite database: ${error.message}`);
  process.exit(1);
}

try {
  const integrity = db.pragma("integrity_check", { simple: true });
  if (integrity !== "ok") {
    console.error(`Integrity check failed: ${integrity}`);
    process.exit(1);
  }

  // A structurally valid but empty file is not a usable backup — count the
  // tables that actually matter so a silent truncation cannot pass.
  const counts = {};
  for (const table of ["contacts", "notes", "tags", "campaigns"]) {
    const exists = db
      .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?")
      .get(table);
    counts[table] = exists
      ? db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n
      : "missing";
  }

  if (counts.contacts === "missing" || counts.contacts === 0) {
    console.error(`Refusing to trust a backup with no contacts: ${JSON.stringify(counts)}`);
    process.exit(1);
  }

  const summary = Object.entries(counts)
    .map(([table, n]) => `${table}=${n}`)
    .join(" ");
  console.log(`VERIFY_OK ${summary}`);
} finally {
  if (db) db.close();
}

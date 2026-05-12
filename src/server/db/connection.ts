import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = process.env.DB_DIR || path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'family-os.db');

let db: Database.Database | null = null;

/**
 * Returns the singleton better-sqlite3 connection.
 * Creates the DB directory if needed, enables WAL + foreign keys.
 */
export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * Runs pending schema migrations.
 * Tracks applied versions in the `_schema_version` table.
 */
export function runMigrations(): void {
  const database = getDb();

  // Ensure the version tracking table exists
  database.exec(`
    CREATE TABLE IF NOT EXISTS _schema_version (
      version   INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const row = database
    .prepare('SELECT COALESCE(MAX(version), 0) AS v FROM _schema_version')
    .get() as { v: number };

  const currentVersion = row.v;

  if (currentVersion < 1) {
    const migrationPath = path.join(__dirname, 'migrations/001_init.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    database.exec(sql);
    database.prepare('INSERT INTO _schema_version (version) VALUES (1)').run();
    console.log('  ✅ Migration 001 applied');
  }

  console.log(`  📦 DB schema version: ${currentVersion < 1 ? 1 : currentVersion}`);
}

/**
 * Closes the database connection gracefully.
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

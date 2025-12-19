import Database from "better-sqlite3";
import path from "path";
import { runMigrations } from "./migrations";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath =
      process.env.DATABASE_PATH || path.join(process.cwd(), "data", "app.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDb();
  runMigrations(database);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export function runMigrations(db: Database.Database): void {
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  const migrationsDir = path.join(process.cwd(), "db", "migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.warn(`Migrations directory not found: ${migrationsDir}`);
    return;
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const appliedMigrations = db
    .prepare("SELECT name FROM _migrations")
    .all() as { name: string }[];
  const appliedNames = new Set(appliedMigrations.map((m) => m.name));

  for (const file of migrationFiles) {
    if (!appliedNames.has(file)) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      try {
        db.transaction(() => {
          db.exec(sql);
          db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
        })();
        console.log(`Successfully applied migration: ${file}`);
      } catch (error) {
        console.error(`Failed to apply migration: ${file}`, error);
        throw error; // Stop if a migration fails
      }
    }
  }
}

import { initializeDatabase } from "./db";
import { seedWorkouts } from "./seed-workouts";
import fs from "fs";
import path from "path";

export function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function initDb() {
  console.log("Initializing database...");
  ensureDataDirectory();
  initializeDatabase();
  console.log("Database initialized");

  console.log("Seeding workouts...");
  seedWorkouts();
  console.log("Database setup complete");
}

import { initializeDatabase } from "./db";
import { seedWorkouts } from "./seed-workouts";
import fs from "fs";
import path from "path";
import { logger } from "./logger";

export function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function initDb() {
  logger.info("Initializing database...");
  ensureDataDirectory();
  initializeDatabase();
  logger.info("Database initialized");

  logger.info("Seeding workouts...");
  seedWorkouts();
  logger.info("Database setup complete");
}

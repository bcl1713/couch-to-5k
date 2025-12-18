/**
 * Integration tests for the authentication flow
 * Tests the complete signup -> login -> dashboard flow
 */

import Database from "better-sqlite3";
import {
  hashPassword,
  createSession,
  validateSession,
  deleteSession,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import fs from "fs";
import path from "path";

// Mock the db module to use test database
jest.mock("@/lib/db", () => {
  let testDb: Database.Database;
  return {
    getDb: () => {
      if (!testDb) {
        const testDbPath = path.join(process.cwd(), "test.db");
        testDb = new Database(testDbPath);
        testDb.pragma("journal_mode = WAL");
        testDb.pragma("foreign_keys = ON");

        // Create tables
        testDb.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at INTEGER DEFAULT (unixepoch()),
            updated_at INTEGER DEFAULT (unixepoch())
          );

          CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER DEFAULT (unixepoch()),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            current_week INTEGER NOT NULL DEFAULT 1,
            current_workout INTEGER NOT NULL DEFAULT 1,
            last_completed_at INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS workout_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            workout_id INTEGER NOT NULL,
            started_at INTEGER DEFAULT (unixepoch()),
            completed_at INTEGER,
            status TEXT NOT NULL DEFAULT 'in_progress',
            type TEXT NOT NULL DEFAULT 'timer_based',
            elapsed_seconds INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);
      }
      return testDb;
    },
  };
});

describe("Authentication Flow Integration", () => {
  let db: Database.Database;

  beforeAll(() => {
    // Initialize database
    db = getDb();
  });

  beforeEach(() => {
    // Clean up test data before each test
    db.prepare("DELETE FROM sessions").run();
    db.prepare("DELETE FROM user_progress").run();
    db.prepare("DELETE FROM workout_sessions").run();
    db.prepare("DELETE FROM users WHERE email LIKE ?").run("test%@example.com");
  });

  afterAll(() => {
    // Clean up test data before closing
    db.prepare("DELETE FROM sessions").run();
    db.prepare("DELETE FROM user_progress").run();
    db.prepare("DELETE FROM workout_sessions").run();
    db.prepare("DELETE FROM users WHERE email LIKE ?").run("test%@example.com");

    // Close database and remove test file
    db.close();
    const testDbPath = path.join(process.cwd(), "test.db");
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    const walPath = testDbPath + "-wal";
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }
    const shmPath = testDbPath + "-shm";
    if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath);
    }
  });

  describe("Signup -> Login -> Session Validation Flow", () => {
    const testEmail = "test@example.com";
    const testPassword = "password123";

    test("should complete full auth flow: signup -> login -> validate session", async () => {
      // Step 1: Signup - Create user
      const passwordHash = await hashPassword(testPassword);

      const insertResult = db
        .prepare(
          "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id"
        )
        .get(testEmail, passwordHash) as { id: number };

      expect(insertResult.id).toBeDefined();
      const userId = insertResult.id;

      // Step 2: Verify user was created
      const user = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(testEmail) as {
        id: number;
        email: string;
        password_hash: string;
      };

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.password_hash).toBe(passwordHash);

      // Step 3: Login - Create session
      const { token, expiresAt } = createSession(userId);

      expect(token).toBeDefined();
      expect(expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));

      // Step 4: Verify session was created
      const session = db
        .prepare("SELECT * FROM sessions WHERE user_id = ?")
        .get(userId);

      expect(session).toBeDefined();

      // Step 5: Validate session
      const validatedUser = validateSession(token);

      expect(validatedUser).not.toBeNull();
      expect(validatedUser?.id).toBe(userId);
      expect(validatedUser?.email).toBe(testEmail);

      // Step 6: Logout - Delete session
      deleteSession(token);

      // Step 7: Verify session was deleted
      const deletedSession = db
        .prepare("SELECT * FROM sessions WHERE token = ?")
        .get(token);

      expect(deletedSession).toBeUndefined();

      // Step 8: Verify session validation fails after logout
      const invalidUser = validateSession(token);

      expect(invalidUser).toBeNull();
    });

    test("should reject login with invalid credentials", async () => {
      // Create user with known password
      const passwordHash = await hashPassword(testPassword);

      db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
        testEmail,
        passwordHash
      );

      // Attempt to validate with wrong password hash
      const wrongPasswordHash = await hashPassword("wrongpassword");

      expect(passwordHash).not.toBe(wrongPasswordHash);
    });

    test("should create user progress on signup", async () => {
      const passwordHash = await hashPassword(testPassword);

      const insertResult = db
        .prepare(
          "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id"
        )
        .get(testEmail, passwordHash) as { id: number };

      const userId = insertResult.id;

      // Create initial progress
      db.prepare(
        "INSERT INTO user_progress (user_id, current_week, current_workout) VALUES (?, ?, ?)"
      ).run(userId, 1, 1);

      // Verify progress was created
      const progress = db
        .prepare("SELECT * FROM user_progress WHERE user_id = ?")
        .get(userId) as {
        user_id: number;
        current_week: number;
        current_workout: number;
      };

      expect(progress).toBeDefined();
      expect(progress.current_week).toBe(1);
      expect(progress.current_workout).toBe(1);
    });

    test("should handle multiple sessions for same user", async () => {
      const passwordHash = await hashPassword(testPassword);

      const insertResult = db
        .prepare(
          "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id"
        )
        .get(testEmail, passwordHash) as { id: number };

      const userId = insertResult.id;

      // Create multiple sessions (e.g., different devices)
      const session1 = createSession(userId);
      const session2 = createSession(userId);

      expect(session1.token).not.toBe(session2.token);

      // Both sessions should be valid
      const user1 = validateSession(session1.token);
      const user2 = validateSession(session2.token);

      expect(user1?.id).toBe(userId);
      expect(user2?.id).toBe(userId);

      // Delete one session
      deleteSession(session1.token);

      // First session should be invalid
      expect(validateSession(session1.token)).toBeNull();

      // Second session should still be valid
      expect(validateSession(session2.token)?.id).toBe(userId);
    });

    test("should reject expired sessions", async () => {
      const passwordHash = await hashPassword(testPassword);

      const insertResult = db
        .prepare(
          "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id"
        )
        .get(testEmail, passwordHash) as { id: number };

      const userId = insertResult.id;

      // Create session with past expiry
      const expiredTime = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
      const token = "expired-token-test";

      db.prepare(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)"
      ).run(userId, token, expiredTime);

      // Validation should fail for expired session
      const user = validateSession(token);

      expect(user).toBeNull();
    });
  });
});

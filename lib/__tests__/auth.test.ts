import {
  hashPassword,
  verifyPassword,
  validateEmail,
  validatePassword,
  setSessionCookie,
  getSessionToken,
  clearSessionCookie,
  getCurrentUser,
} from "../auth";
import * as authModule from "../auth";

const cookieStore = new Map<string, string>();
const headerStore = new Map<string, string>();

jest.mock("../db", () => {
  const prepare = jest.fn(() => ({
    run: jest.fn(),
    get: jest.fn(() => ({
      token: "token-abc",
      user_id: 1,
      email: "user@example.com",
      user_created_at: 0,
      user_updated_at: 0,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    })),
  }));

  return {
    getDb: () => ({
      prepare,
    }),
  };
});

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    set: (name: string, value: string) => {
      cookieStore.set(name, value);
    },
    get: (name: string) =>
      cookieStore.has(name)
        ? { name, value: cookieStore.get(name) as string }
        : undefined,
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  })),
  headers: jest.fn(() => ({
    get: (name: string) =>
      headerStore.has(name) ? (headerStore.get(name) as string) : null,
  })),
}));

describe("Authentication Logic", () => {
  afterEach(() => {
    cookieStore.clear();
    jest.restoreAllMocks();
  });

  describe("Password Hashing", () => {
    test("should hash a password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test("should generate different hashes for the same password", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Password Verification", () => {
    test("should verify correct password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    test("should reject incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword456";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    test("should reject empty password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("", hash);

      expect(isValid).toBe(false);
    });
  });

  describe("Email Validation", () => {
    test("should validate correct email formats", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@example.co.uk")).toBe(true);
      expect(validateEmail("user+tag@example.com")).toBe(true);
    });

    test("should reject invalid email formats", () => {
      expect(validateEmail("notanemail")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user@.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("user @example.com")).toBe(false);
    });
  });

  describe("Password Validation", () => {
    test("should accept passwords with 8 or more characters", () => {
      expect(validatePassword("12345678")).toBe(true);
      expect(validatePassword("password123")).toBe(true);
      expect(validatePassword("verylongpassword")).toBe(true);
    });

    test("should reject passwords with less than 8 characters", () => {
      expect(validatePassword("1234567")).toBe(false);
      expect(validatePassword("short")).toBe(false);
      expect(validatePassword("")).toBe(false);
    });
  });

  describe("Session Cookies", () => {
    test("should set and read the session cookie", async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      await setSessionCookie("token-123", expiresAt);

      const token = await getSessionToken();
      expect(token).toBe("token-123");
    });

    test("should clear the session cookie", async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      await setSessionCookie("token-123", expiresAt);
      await clearSessionCookie();

      const token = await getSessionToken();
      expect(token).toBeNull();
    });

    test("getCurrentUser returns validated user when token present", async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      await setSessionCookie("token-abc", expiresAt);

      const user = await getCurrentUser();
      expect(user?.email).toBe("user@example.com");
    });
  });
});

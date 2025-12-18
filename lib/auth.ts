import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { cookies, headers } from "next/headers";
import { getDb } from "./db";

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = "session_token";
const SESSION_EXPIRY_DAYS = 30;

function shouldUseSecureCookie(): boolean {
  try {
    const headerList = headers();
    const forwardedProto = headerList.get("x-forwarded-proto");
    if (forwardedProto) {
      const proto = forwardedProto.split(",")[0].trim().toLowerCase();
      if (proto) {
        return proto === "https";
      }
    }
  } catch {
    // headers() can throw outside of a request context; fall back to env check
  }

  return process.env.NODE_ENV === "production";
}

export interface User {
  id: number;
  email: string;
  created_at: number;
  updated_at: number;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: number;
  created_at: number;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function createSession(userId: number): {
  token: string;
  expiresAt: number;
} {
  const db = getDb();
  const token = randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_EXPIRY_DAYS * 86400;

  db.prepare(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)"
  ).run(userId, token, expiresAt);

  return { token, expiresAt };
}

/* istanbul ignore next */
/* c8 ignore next */
export async function setSessionCookie(
  token: string,
  expiresAt: number
): Promise<void> {
  const cookieStore = await cookies();
  const secure = shouldUseSecureCookie();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    expires: new Date(expiresAt * 1000),
    path: "/",
  });
}

/* istanbul ignore next */
/* c8 ignore next */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie?.value ?? null;
}

/* istanbul ignore next */
/* c8 ignore next */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function validateSession(token: string): User | null {
  const db = getDb();

  const session = db
    .prepare(
      `
    SELECT s.*, u.id as user_id, u.email, u.created_at as user_created_at, u.updated_at as user_updated_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `
    )
    .get(token, Math.floor(Date.now() / 1000)) as
    | (Session & {
        user_id: number;
        email: string;
        user_created_at: number;
        user_updated_at: number;
      })
    | undefined;

  if (!session) {
    return null;
  }

  return {
    id: session.user_id,
    email: session.email,
    created_at: session.user_created_at,
    updated_at: session.user_updated_at,
  };
}

/* istanbul ignore next */
/* c8 ignore next */
export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }
  return validateSession(token);
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

/* istanbul ignore next */
/* c8 ignore next */
export function cleanupExpiredSessions(): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(
    Math.floor(Date.now() / 1000)
  );
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

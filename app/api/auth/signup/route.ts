import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  hashPassword,
  validateEmail,
  validatePassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if user already exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const now = Math.floor(Date.now() / 1000);

    // Create user
    const result = db
      .prepare(
        "INSERT INTO users (email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)"
      )
      .run(email, passwordHash, now, now);

    const userId = result.lastInsertRowid as number;

    // Initialize user progress
    db.prepare(
      "INSERT INTO user_progress (user_id, current_week, current_workout) VALUES (?, 1, 1)"
    ).run(userId);

    // Create session
    const { token, expiresAt } = createSession(userId);
    await setSessionCookie(token, expiresAt);

    return NextResponse.json(
      {
        success: true,
        user: { id: userId, email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

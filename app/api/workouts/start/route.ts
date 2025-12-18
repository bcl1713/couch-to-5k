import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Get current progress
    const progress = db
      .prepare(
        "SELECT current_week, current_workout FROM user_progress WHERE user_id = ?"
      )
      .get(user.id) as
      | { current_week: number; current_workout: number }
      | undefined;

    if (!progress) {
      return NextResponse.json(
        { error: "User progress not found" },
        {
          status: 404,
        }
      );
    }

    // Get workout details
    const workout = db
      .prepare("SELECT * FROM workouts WHERE week = ? AND number = ?")
      .get(progress.current_week, progress.current_workout) as
      | {
          id: number;
          week: number;
          number: number;
          intervals_json: string;
          duration_seconds: number;
        }
      | undefined;

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    // Create session
    const now = Math.floor(Date.now() / 1000);
    const result = db
      .prepare(
        `INSERT INTO workout_sessions (user_id, workout_id, started_at, status, type)
         VALUES (?, ?, ?, 'active', 'timer_based')`
      )
      .run(user.id, workout.id, now);

    const sessionId = result.lastInsertRowid as number;

    return NextResponse.json({
      sessionId,
      workout: {
        id: workout.id,
        week: workout.week,
        number: workout.number,
        intervals: JSON.parse(workout.intervals_json),
        duration_seconds: workout.duration_seconds,
      },
      startedAt: now,
    });
  } catch (error) {
    console.error("Start workout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

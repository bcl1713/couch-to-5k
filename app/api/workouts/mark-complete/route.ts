import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { calculateNextWorkout } from "@/lib/progress-utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { completion_date?: number } = {};
    try {
      body = (await request.json()) as { completion_date?: number };
    } catch {
      body = {};
    }

    const completionDate = Number.isFinite(Number(body.completion_date))
      ? Number(body.completion_date)
      : Math.floor(Date.now() / 1000);

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
      .prepare("SELECT id FROM workouts WHERE week = ? AND number = ?")
      .get(progress.current_week, progress.current_workout) as
      | { id: number }
      | undefined;

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    // Create manual completion session
    db.prepare(
      `INSERT INTO workout_sessions (user_id, workout_id, started_at, completed_at, status, type)
       VALUES (?, ?, ?, ?, 'completed', 'manual_completion')`
    ).run(user.id, workout.id, completionDate, completionDate);

    // Advance progress using shared utility
    const { nextWeek, nextWorkout } = calculateNextWorkout(
      progress.current_week,
      progress.current_workout
    );

    db.prepare(
      "UPDATE user_progress SET current_week = ?, current_workout = ?, last_completed_at = ? WHERE user_id = ?"
    ).run(nextWeek, nextWorkout, completionDate, user.id);

    return NextResponse.json({
      success: true,
      progress: {
        currentWeek: nextWeek,
        currentWorkout: nextWorkout,
      },
    });
  } catch (error) {
    console.error("Mark complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

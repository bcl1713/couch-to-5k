import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Get progress
    const progress = db
      .prepare(
        "SELECT current_week, current_workout, last_completed_at FROM user_progress WHERE user_id = ?"
      )
      .get(user.id) as
      | {
          current_week: number;
          current_workout: number;
          last_completed_at: number | null;
        }
      | undefined;

    if (!progress) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    // Get next workout details
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

    return NextResponse.json({
      currentWeek: progress.current_week,
      currentWorkout: progress.current_workout,
      lastCompletedAt: progress.last_completed_at,
      nextWorkout: workout
        ? {
            id: workout.id,
            week: workout.week,
            number: workout.number,
            intervals: JSON.parse(workout.intervals_json),
            durationSeconds: workout.duration_seconds,
          }
        : null,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

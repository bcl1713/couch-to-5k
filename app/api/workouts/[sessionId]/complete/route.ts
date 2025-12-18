import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Request object is unused but required for Next.js handler signature
    void request;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await context.params;
    const db = getDb();

    // Get session
    const session = db
      .prepare(
        "SELECT * FROM workout_sessions WHERE id = ? AND user_id = ? AND status = ?"
      )
      .get(parseInt(sessionId), user.id, "active") as
      | {
          id: number;
          workout_id: number;
          started_at: number;
          status: string;
        }
      | undefined;

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found or already completed" },
        { status: 404 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const elapsedSeconds = now - session.started_at;

    // Mark session as completed
    db.prepare(
      "UPDATE workout_sessions SET status = ?, completed_at = ?, elapsed_seconds = ? WHERE id = ?"
    ).run("completed", now, elapsedSeconds, session.id);

    // Get current progress
    const progress = db
      .prepare(
        "SELECT current_week, current_workout FROM user_progress WHERE user_id = ?"
      )
      .get(user.id) as
      | { current_week: number; current_workout: number }
      | undefined;

    if (progress) {
      // Advance progress
      let nextWeek = progress.current_week;
      let nextWorkout = progress.current_workout + 1;

      if (nextWorkout > 3) {
        nextWeek += 1;
        nextWorkout = 1;
      }

      // Cap at week 9, workout 3
      if (nextWeek > 9) {
        nextWeek = 9;
        nextWorkout = 3;
      }

      db.prepare(
        "UPDATE user_progress SET current_week = ?, current_workout = ?, last_completed_at = ? WHERE user_id = ?"
      ).run(nextWeek, nextWorkout, now, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete workout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

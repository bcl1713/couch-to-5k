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
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    const fromWeek = progress.current_week;
    const fromWorkout = progress.current_workout;
    const toWeek = progress.current_week;
    const toWorkout = 1;

    // Record adjustment
    db.prepare(
      `INSERT INTO progress_adjustments (user_id, adjustment_type, from_week, from_workout, to_week, to_workout)
       VALUES (?, 'repeat_week', ?, ?, ?, ?)`
    ).run(user.id, fromWeek, fromWorkout, toWeek, toWorkout);

    // Update progress
    db.prepare(
      "UPDATE user_progress SET current_workout = ? WHERE user_id = ?"
    ).run(1, user.id);

    return NextResponse.json({
      success: true,
      progress: {
        currentWeek: toWeek,
        currentWorkout: toWorkout,
      },
    });
  } catch (error) {
    console.error("Repeat week error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

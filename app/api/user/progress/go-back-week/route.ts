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

    if (progress.current_week === 1) {
      return NextResponse.json({ error: "Already at Week 1" }, { status: 400 });
    }

    const fromWeek = progress.current_week;
    const fromWorkout = progress.current_workout;
    const toWeek = progress.current_week - 1;
    const toWorkout = 1;

    // Record adjustment
    db.prepare(
      `INSERT INTO progress_adjustments (user_id, adjustment_type, from_week, from_workout, to_week, to_workout)
       VALUES (?, 'go_back_week', ?, ?, ?, ?)`
    ).run(user.id, fromWeek, fromWorkout, toWeek, toWorkout);

    // Update progress
    db.prepare(
      "UPDATE user_progress SET current_week = ?, current_workout = ? WHERE user_id = ?"
    ).run(toWeek, toWorkout, user.id);

    return NextResponse.json({
      success: true,
      progress: {
        currentWeek: toWeek,
        currentWorkout: toWorkout,
      },
    });
  } catch (error) {
    console.error("Go back week error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

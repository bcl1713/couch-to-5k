import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { week, workout_number } = body;

    if (!week || !workout_number) {
      return NextResponse.json(
        { error: "Week and workout_number are required" },
        { status: 400 }
      );
    }

    if (week < 1 || week > 9 || workout_number < 1 || workout_number > 3) {
      return NextResponse.json(
        { error: "Invalid week (1-9) or workout number (1-3)" },
        { status: 400 }
      );
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

    // Record adjustment
    db.prepare(
      `INSERT INTO progress_adjustments (user_id, adjustment_type, from_week, from_workout, to_week, to_workout)
       VALUES (?, 'jump_to', ?, ?, ?, ?)`
    ).run(user.id, fromWeek, fromWorkout, week, workout_number);

    // Update progress
    db.prepare(
      "UPDATE user_progress SET current_week = ?, current_workout = ? WHERE user_id = ?"
    ).run(week, workout_number, user.id);

    return NextResponse.json({
      success: true,
      progress: {
        currentWeek: week,
        currentWorkout: workout_number,
      },
    });
  } catch (error) {
    console.error("Jump to error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

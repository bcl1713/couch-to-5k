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

    // Get last 10 completed workouts
    const sessions = db
      .prepare(
        `SELECT ws.*, w.week, w.number, w.intervals_json
         FROM workout_sessions ws
         JOIN workouts w ON ws.workout_id = w.id
         WHERE ws.user_id = ? AND ws.status = 'completed'
         ORDER BY ws.completed_at DESC
         LIMIT 10`
      )
      .all(user.id) as Array<{
      id: number;
      workout_id: number;
      started_at: number;
      completed_at: number;
      elapsed_seconds: number | null;
      type: string;
      week: number;
      number: number;
      intervals_json: string;
    }>;

    return NextResponse.json({
      history: sessions.map((session) => ({
        id: session.id,
        workoutId: session.workout_id,
        week: session.week,
        workoutNumber: session.number,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        elapsedSeconds: session.elapsed_seconds,
        type: session.type,
      })),
    });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

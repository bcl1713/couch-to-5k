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

    // Get progress adjustments
    const adjustments = db
      .prepare(
        `SELECT * FROM progress_adjustments
         WHERE user_id = ?
         ORDER BY timestamp DESC`
      )
      .all(user.id) as Array<{
      id: number;
      user_id: number;
      adjustment_type: string;
      from_week: number;
      from_workout: number;
      to_week: number;
      to_workout: number;
      timestamp: number;
      reason: string | null;
    }>;

    return NextResponse.json({
      adjustments: adjustments.map((adj) => ({
        id: adj.id,
        type: adj.adjustment_type,
        fromWeek: adj.from_week,
        fromWorkout: adj.from_workout,
        toWeek: adj.to_week,
        toWorkout: adj.to_workout,
        timestamp: adj.timestamp,
        reason: adj.reason,
      })),
    });
  } catch (error) {
    console.error("Get progress log error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

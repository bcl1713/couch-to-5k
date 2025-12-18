import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Request object is unused but required for handler signature
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
          started_at: number;
          paused_elapsed_seconds: number | null;
        }
      | undefined;

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found or not active" },
        { status: 404 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const currentElapsed = now - session.started_at;
    const totalElapsed = (session.paused_elapsed_seconds || 0) + currentElapsed;

    // Update session to paused
    db.prepare(
      "UPDATE workout_sessions SET status = ?, paused_at = ?, paused_elapsed_seconds = ? WHERE id = ?"
    ).run("paused", now, totalElapsed, session.id);

    return NextResponse.json({ success: true, elapsedSeconds: totalElapsed });
  } catch (error) {
    console.error("Pause workout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

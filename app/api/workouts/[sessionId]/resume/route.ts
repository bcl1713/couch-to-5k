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
      .get(parseInt(sessionId), user.id, "paused") as
      | { id: number; paused_elapsed_seconds: number }
      | undefined;

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found or not paused" },
        { status: 404 }
      );
    }

    const now = Math.floor(Date.now() / 1000);

    // Update session to active with new started_at to account for pause duration
    db.prepare(
      "UPDATE workout_sessions SET status = ?, started_at = ? WHERE id = ?"
    ).run("active", now - session.paused_elapsed_seconds, session.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resume workout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

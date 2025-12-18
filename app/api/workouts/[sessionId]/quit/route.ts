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
        "SELECT * FROM workout_sessions WHERE id = ? AND user_id = ? AND status IN (?, ?)"
      )
      .get(parseInt(sessionId), user.id, "active", "paused") as
      | { id: number }
      | undefined;

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    // Mark session as abandoned
    db.prepare("UPDATE workout_sessions SET status = ? WHERE id = ?").run(
      "abandoned",
      session.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quit workout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

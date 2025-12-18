"use client";

import Link from "next/link";

export default function WorkoutCompletePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-4">Great Job!</h1>
        <p className="text-xl mb-8">You&apos;ve completed your workout</p>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block bg-white text-green-600 py-3 px-6 rounded-lg font-semibold hover:bg-green-50 transition min-h-[44px] flex items-center justify-center"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/history"
            className="block bg-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-800 transition min-h-[44px] flex items-center justify-center"
          >
            View History
          </Link>
        </div>
      </div>
    </div>
  );
}

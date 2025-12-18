"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HistoryItem {
  id: number;
  week: number;
  workoutNumber: number;
  startedAt: number;
  completedAt: number;
  elapsedSeconds: number | null;
  type: string;
}

interface Progress {
  currentWeek: number;
  currentWorkout: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, progressRes] = await Promise.all([
          fetch("/api/user/history"),
          fetch("/api/user/progress"),
        ]);

        if (!historyRes.ok || !progressRes.ok) {
          router.push("/login");
          return;
        }

        const historyData = await historyRes.json();
        const progressData = await progressRes.json();

        setHistory(historyData.history || []);
        setProgress({
          currentWeek: progressData.currentWeek,
          currentWorkout: progressData.currentWorkout,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Workout History</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/settings/progress"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Current Progress Summary */}
        {progress && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Current Progress</h2>
            <p className="text-2xl font-bold text-indigo-600">
              Week {progress.currentWeek}, Workout {progress.currentWorkout}
            </p>
          </div>
        )}

        {/* History List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Completed Workouts</h2>
            {history.length === 0 ? (
              <p className="text-gray-500">No completed workouts yet</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        Week {item.week}, Workout {item.workoutNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(item.completedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {item.type === "manual_completion"
                          ? "Manual Completion"
                          : `Duration: ${formatDuration(item.elapsedSeconds)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getIntervalSummary } from "@/lib/workout-utils";
import { Alert } from "@/components/Alert";
import { useWorkoutCompletion } from "@/hooks/useWorkoutCompletion";

interface WorkoutInterval {
  type: "walk" | "jog";
  seconds: number;
  repeat_with_next?: boolean;
  repeat_count?: number;
}

interface WorkoutData {
  week: number;
  number: number;
  warmup_seconds: number;
  intervals: WorkoutInterval[];
  total_duration_seconds: number;
  is_final_workout: boolean;
}

interface Progress {
  currentWeek: number;
  currentWorkout: number;
  lastCompletedAt: number | null;
  nextWorkout: {
    id: number;
    week: number;
    number: number;
    intervals: WorkoutData;
    durationSeconds: number;
  } | null;
}

interface HistoryItem {
  id: number;
  week: number;
  workoutNumber: number;
  completedAt: number;
  type: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMarkCompleteDialog, setShowMarkCompleteDialog] = useState(false);

  const {
    markComplete,
    isLoading: markingComplete,
    error: markCompleteError,
    clearError: clearMarkCompleteError,
  } = useWorkoutCompletion({
    progress,
    history,
    onProgressUpdate: setProgress,
    onHistoryUpdate: setHistory,
    onSuccess: () => {
      setShowMarkCompleteDialog(false);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, progressRes, historyRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/user/progress"),
          fetch("/api/user/history"),
        ]);

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        const progressData = await progressRes.json();
        const historyData = await historyRes.json();

        setUser(userData.user);
        setProgress(progressData);
        setHistory(historyData.history || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleStartWorkout = async () => {
    router.push("/workout/active");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
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
          <h1 className="text-2xl font-bold text-gray-900">Couch to 5K</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/history"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              History
            </Link>
            <Link
              href="/settings/progress"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Settings
            </Link>
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Current Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="mb-4">
            <p className="text-3xl font-bold text-indigo-600">
              Week {progress?.currentWeek} - Workout {progress?.currentWorkout}
            </p>
            {progress?.nextWorkout && (
              <>
                <p className="text-gray-600 mt-2">
                  Duration:{" "}
                  {formatDuration(progress.nextWorkout.durationSeconds)}
                </p>
                <p className="text-gray-700 mt-1 text-sm">
                  Intervals:{" "}
                  {getIntervalSummary(progress.nextWorkout.intervals.intervals)}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleStartWorkout}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition min-h-[44px]"
            >
              Start Workout
            </button>
            <button
              onClick={() => {
                setShowMarkCompleteDialog(true);
                clearMarkCompleteError();
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition min-h-[44px]"
            >
              Mark Complete
            </button>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Workouts</h2>
            <Link
              href="/history"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View All
            </Link>
          </div>
          {history.length === 0 ? (
            <p className="text-gray-500">No completed workouts yet</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">
                      Week {item.week}, Workout {item.workoutNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.type === "manual_completion" ? "Manual" : "Timer"} -{" "}
                      {formatDate(item.completedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mark Complete Dialog */}
      {showMarkCompleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Mark Workout Complete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark Week {progress?.currentWeek},
              Workout {progress?.currentWorkout} as complete?
            </p>
            {markCompleteError && (
              <Alert variant="warning">{markCompleteError}</Alert>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMarkCompleteDialog(false);
                  clearMarkCompleteError();
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded hover:bg-gray-300 min-h-[44px]"
                disabled={markingComplete}
              >
                Cancel
              </button>
              <button
                onClick={markComplete}
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
                disabled={markingComplete}
              >
                {markingComplete ? "Marking..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

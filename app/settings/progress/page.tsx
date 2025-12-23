"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost, apiGet } from "@/lib/api-client";

interface Progress {
  currentWeek: number;
  currentWorkout: number;
}

interface Adjustment {
  id: number;
  type: string;
  fromWeek: number;
  fromWorkout: number;
  toWeek: number;
  toWorkout: number;
  timestamp: number;
  reason: string | null;
}

export default function ProgressSettingsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(
    null
  );
  const [jumpWeek, setJumpWeek] = useState(1);
  const [jumpWorkout, setJumpWorkout] = useState(1);
  const [processing, setProcessing] = useState(false);
  const fetchData = useCallback(async () => {
    try {
      const [progressRes, logRes] = await Promise.all([
        apiGet<Progress>("/api/user/progress"),
        apiGet<{ adjustments: Adjustment[] }>("/api/user/progress-log"),
      ]);

      if (!progressRes.ok) {
        router.push("/login");
        return;
      }

      if (progressRes.data) {
        setProgress({
          currentWeek: progressRes.data.currentWeek,
          currentWorkout: progressRes.data.currentWorkout,
        });
      }

      if (logRes.data) {
        setAdjustments(logRes.data.adjustments || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRepeatWeek = async () => {
    setProcessing(true);
    try {
      const res = await apiPost("/api/user/progress/repeat-week");
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error repeating week:", error);
    } finally {
      setProcessing(false);
      setShowConfirmDialog(null);
    }
  };

  const handleGoBackWeek = async () => {
    setProcessing(true);
    try {
      const res = await apiPost("/api/user/progress/go-back-week");
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error going back week:", error);
    } finally {
      setProcessing(false);
      setShowConfirmDialog(null);
    }
  };

  const handleJumpTo = async () => {
    setProcessing(true);
    try {
      const res = await apiPost("/api/user/progress/jump-to", {
        week: jumpWeek,
        workout_number: jumpWorkout,
      });
      if (res.ok) {
        await fetchData();
        setShowJumpDialog(false);
      }
    } catch (error) {
      console.error("Error jumping to week:", error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getAdjustmentLabel = (type: string) => {
    switch (type) {
      case "repeat_week":
        return "Repeated Week";
      case "go_back_week":
        return "Went Back Week";
      case "jump_to":
        return "Jumped To";
      default:
        return type;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">
            Progress Settings
          </h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/history"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              History
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Current Progress */}
        {progress && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Current Progress</h2>
            <p className="text-2xl font-bold text-indigo-600 mb-6">
              Week {progress.currentWeek}, Workout {progress.currentWorkout}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setShowConfirmDialog("repeat")}
                className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition min-h-[44px]"
                disabled={processing}
              >
                Repeat Current Week
              </button>

              <button
                onClick={() => setShowConfirmDialog("back")}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 min-h-[44px]"
                disabled={processing || progress.currentWeek === 1}
              >
                Go Back One Week
              </button>

              <button
                onClick={() => setShowJumpDialog(true)}
                className="w-full bg-indigo-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-600 transition min-h-[44px]"
                disabled={processing}
              >
                Jump to Week...
              </button>
            </div>
          </div>
        )}

        {/* Adjustment Log */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Progress Adjustments</h2>
          {adjustments.length === 0 ? (
            <p className="text-gray-500">No adjustments yet</p>
          ) : (
            <div className="space-y-3">
              {adjustments.map((adj) => (
                <div key={adj.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{getAdjustmentLabel(adj.type)}</p>
                  <p className="text-sm text-gray-600">
                    From Week {adj.fromWeek}, Workout {adj.fromWorkout} → Week{" "}
                    {adj.toWeek}, Workout {adj.toWorkout}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(adj.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialogs */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              {showConfirmDialog === "repeat"
                ? `Reset to Workout 1 of Week ${progress?.currentWeek}?`
                : `Go back to Workout 1 of Week ${(progress?.currentWeek || 1) - 1}?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded hover:bg-gray-300 min-h-[44px]"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={
                  showConfirmDialog === "repeat"
                    ? handleRepeatWeek
                    : handleGoBackWeek
                }
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
                disabled={processing}
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jump Dialog */}
      {showJumpDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Jump to Week</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week (1-9)
                </label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={jumpWeek || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setJumpWeek(isNaN(val) ? 1 : val);
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workout (1-3)
                </label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={jumpWorkout || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setJumpWorkout(isNaN(val) ? 1 : val);
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJumpDialog(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded hover:bg-gray-300 min-h-[44px]"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleJumpTo}
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
                disabled={processing}
              >
                {processing ? "Jumping..." : "Jump"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

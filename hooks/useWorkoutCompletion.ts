import { useState } from "react";
import {
  apiPost,
  apiGet,
  formatApiError,
  type ApiError,
} from "@/lib/api-client";
import { calculateNextWorkout } from "@/lib/progress-utils";

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

interface UseWorkoutCompletionResult {
  /**
   * Whether the mutation is in progress
   */
  isLoading: boolean;

  /**
   * Error from the most recent completion attempt
   */
  error: string | null;

  /**
   * Mark the current workout as complete
   */
  markComplete: () => Promise<void>;

  /**
   * Clear the current error
   */
  clearError: () => void;
}

interface UseWorkoutCompletionOptions {
  /**
   * Current progress state
   */
  progress: Progress | null;

  /**
   * Current history state
   */
  history: HistoryItem[];

  /**
   * Callback to update progress after successful completion
   */
  onProgressUpdate: (progress: Progress) => void;

  /**
   * Callback to update history after successful completion
   */
  onHistoryUpdate: (history: HistoryItem[]) => void;

  /**
   * Optional callback after successful completion
   */
  onSuccess?: () => void;
}

/**
 * Custom hook for marking workouts as complete with optimistic UI updates
 *
 * @example
 * ```tsx
 * const { markComplete, isLoading, error, clearError } = useWorkoutCompletion({
 *   progress,
 *   history,
 *   onProgressUpdate: setProgress,
 *   onHistoryUpdate: setHistory,
 *   onSuccess: () => setShowDialog(false),
 * });
 * ```
 */
export function useWorkoutCompletion(
  options: UseWorkoutCompletionOptions
): UseWorkoutCompletionResult {
  const { progress, history, onProgressUpdate, onHistoryUpdate, onSuccess } =
    options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markComplete = async () => {
    if (!progress?.nextWorkout) return;

    setIsLoading(true);
    setError(null);

    // Store snapshots for rollback
    const previousProgress = progress;
    const previousHistory = history;

    // Helper function to rollback state
    const performRollback = () => {
      onProgressUpdate(previousProgress);
      onHistoryUpdate(previousHistory);
    };

    // Helper function to get error message based on scenario
    const getRollbackErrorMessage = (
      scenario: "api-error" | "fetch-failed" | "network-error",
      apiError?: ApiError
    ): string => {
      switch (scenario) {
        case "api-error":
          return formatApiError(apiError);
        case "fetch-failed":
          return "Failed to update progress. Please try again.";
        case "network-error":
          return "Unable to connect. Please check your internet connection.";
      }
    };

    try {
      // Calculate next workout optimistically
      const { nextWeek, nextWorkout } = calculateNextWorkout(
        progress.currentWeek,
        progress.currentWorkout
      );

      // Create optimistic history item
      const newHistoryItem: HistoryItem = {
        id: Date.now(), // Temporary ID
        week: progress.currentWeek,
        workoutNumber: progress.currentWorkout,
        completedAt: Math.floor(Date.now() / 1000),
        type: "manual_completion",
      };

      // Optimistically update state
      onHistoryUpdate([newHistoryItem, ...previousHistory]);
      onProgressUpdate({
        ...previousProgress,
        currentWeek: nextWeek,
        currentWorkout: nextWorkout,
        lastCompletedAt: newHistoryItem.completedAt,
        // Set nextWorkout to null temporarily - will be updated from API
        nextWorkout: null,
      });

      // Make API request
      const response = await apiPost("/api/workouts/mark-complete", {});

      if (response.ok) {
        // Fetch updated progress to get the full nextWorkout data
        const progressResponse = await apiGet<Progress>("/api/user/progress");

        if (progressResponse.ok && progressResponse.data) {
          onProgressUpdate(progressResponse.data);
          setError(null);
          onSuccess?.();
        } else {
          // If progress fetch fails, rollback
          performRollback();
          setError(getRollbackErrorMessage("fetch-failed"));
        }
      } else {
        // Rollback on error
        performRollback();
        setError(getRollbackErrorMessage("api-error", response.error));
      }
    } catch (err) {
      // Rollback on network error
      performRollback();
      console.error("Error marking complete:", err);
      setError(getRollbackErrorMessage("network-error"));
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isLoading,
    error,
    markComplete,
    clearError,
  };
}

export interface WorkoutInterval {
  type: "walk" | "jog";
  seconds: number;
  repeat_with_next?: boolean;
  repeat_count?: number;
}

export interface WorkoutData {
  week: number;
  number: number;
  warmup_seconds: number;
  intervals: WorkoutInterval[];
  total_duration_seconds: number;
  is_final_workout: boolean;
}

export interface IntervalState {
  phase: "warmup" | "interval" | "complete";
  currentIntervalIndex: number;
  intervalElapsed: number;
  currentInterval: WorkoutInterval | null;
}

/**
 * Flattens workout intervals by expanding repeat patterns
 */
export function getFlattenedIntervals(
  intervals: WorkoutInterval[]
): WorkoutInterval[] {
  const flattened: WorkoutInterval[] = [];

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    if (interval.repeat_with_next && intervals[i + 1]) {
      const next = intervals[i + 1];
      const repeatCount = next.repeat_count || 1;
      for (let r = 0; r < repeatCount; r++) {
        flattened.push({ type: interval.type, seconds: interval.seconds });
        flattened.push({ type: next.type, seconds: next.seconds });
      }
      i++; // Skip the next interval as it's already processed
    } else if (!interval.repeat_count) {
      flattened.push({ type: interval.type, seconds: interval.seconds });
    }
  }

  return flattened;
}

/**
 * Calculates the current interval state based on elapsed seconds
 */
export function calculateIntervalState(
  elapsedSeconds: number,
  warmupSeconds: number,
  intervals: WorkoutInterval[]
): IntervalState {
  const flatIntervals = getFlattenedIntervals(intervals);

  // Warmup phase
  if (elapsedSeconds < warmupSeconds) {
    return {
      phase: "warmup",
      currentIntervalIndex: 0,
      intervalElapsed: elapsedSeconds,
      currentInterval: null,
    };
  }

  // Interval phase
  const intervalElapsed = elapsedSeconds - warmupSeconds;
  let accumulated = 0;
  let currentIdx = 0;

  for (let i = 0; i < flatIntervals.length; i++) {
    if (intervalElapsed < accumulated + flatIntervals[i].seconds) {
      currentIdx = i;
      break;
    }
    accumulated += flatIntervals[i].seconds;
  }

  // Check if workout complete
  const totalIntervalDuration = flatIntervals.reduce(
    (sum, int) => sum + int.seconds,
    0
  );

  if (intervalElapsed >= totalIntervalDuration) {
    return {
      phase: "complete",
      currentIntervalIndex: flatIntervals.length - 1,
      intervalElapsed: intervalElapsed - accumulated,
      currentInterval: null,
    };
  }

  return {
    phase: "interval",
    currentIntervalIndex: currentIdx,
    intervalElapsed: intervalElapsed - accumulated,
    currentInterval: flatIntervals[currentIdx],
  };
}

/**
 * Formats time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

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

/**
 * Formats seconds into a readable duration (e.g., "60s", "3 min", "2.5 min")
 */
function formatDuration(seconds: number): string {
  if (seconds < 120) {
    return `${seconds}s`;
  }
  const mins = seconds / 60;
  if (mins % 1 === 0) {
    return `${mins} min`;
  }
  return `${mins.toFixed(1)} min`;
}

/**
 * Generates a human-readable summary of workout intervals
 */
export function getIntervalSummary(intervals: WorkoutInterval[]): string {
  const flattened = getFlattenedIntervals(intervals);

  if (flattened.length === 0) {
    return "No intervals";
  }

  // Check if it's a single continuous interval
  if (flattened.length === 1) {
    return `${formatDuration(flattened[0].seconds)} ${flattened[0].type}`;
  }

  // Check if it's a repeating pattern (all pairs are identical)
  // Only show as repeating if there are 2 or more pairs
  if (flattened.length % 2 === 0 && flattened.length >= 4) {
    const pairSize = 2;
    const numPairs = flattened.length / pairSize;
    let isRepeating = true;

    for (let i = 0; i < flattened.length; i += pairSize) {
      const first = flattened[i];
      const second = flattened[i + 1];
      const refFirst = flattened[0];
      const refSecond = flattened[1];

      if (
        first.type !== refFirst.type ||
        first.seconds !== refFirst.seconds ||
        second.type !== refSecond.type ||
        second.seconds !== refSecond.seconds
      ) {
        isRepeating = false;
        break;
      }
    }

    if (isRepeating) {
      const first = flattened[0];
      const second = flattened[1];
      return `${numPairs}x (${formatDuration(first.seconds)} ${first.type}, ${formatDuration(second.seconds)} ${second.type})`;
    }
  }

  // Complex pattern: list all intervals
  return flattened
    .map((interval) => `${formatDuration(interval.seconds)} ${interval.type}`)
    .join(", ");
}

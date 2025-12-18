import {
  getFlattenedIntervals,
  calculateIntervalState,
  formatTime,
  WorkoutInterval,
} from "../workout-utils";

describe("Workout Interval Utilities", () => {
  describe("getFlattenedIntervals", () => {
    test("should flatten simple intervals without repeats", () => {
      const intervals: WorkoutInterval[] = [
        { type: "jog", seconds: 60 },
        { type: "walk", seconds: 90 },
        { type: "jog", seconds: 60 },
      ];

      const flattened = getFlattenedIntervals(intervals);
      expect(flattened).toHaveLength(3);
      expect(flattened[0]).toEqual({ type: "jog", seconds: 60 });
      expect(flattened[1]).toEqual({ type: "walk", seconds: 90 });
      expect(flattened[2]).toEqual({ type: "jog", seconds: 60 });
    });

    test("should expand repeat patterns (Week 1 example: 8 repeats of jog/walk)", () => {
      const intervals: WorkoutInterval[] = [
        { type: "jog", seconds: 60, repeat_with_next: true },
        { type: "walk", seconds: 90, repeat_count: 8 },
      ];

      const flattened = getFlattenedIntervals(intervals);
      expect(flattened).toHaveLength(16); // 8 repeats * 2 intervals

      // Check first repeat
      expect(flattened[0]).toEqual({ type: "jog", seconds: 60 });
      expect(flattened[1]).toEqual({ type: "walk", seconds: 90 });

      // Check last repeat
      expect(flattened[14]).toEqual({ type: "jog", seconds: 60 });
      expect(flattened[15]).toEqual({ type: "walk", seconds: 90 });
    });

    test("should handle mixed intervals with and without repeats", () => {
      const intervals: WorkoutInterval[] = [
        { type: "jog", seconds: 90, repeat_with_next: true },
        { type: "walk", seconds: 120, repeat_count: 3 },
        { type: "jog", seconds: 180 },
      ];

      const flattened = getFlattenedIntervals(intervals);
      expect(flattened).toHaveLength(7); // 3 repeats * 2 + 1 single

      expect(flattened[0]).toEqual({ type: "jog", seconds: 90 });
      expect(flattened[1]).toEqual({ type: "walk", seconds: 120 });
      expect(flattened[6]).toEqual({ type: "jog", seconds: 180 });
    });

    test("should handle empty intervals array", () => {
      const flattened = getFlattenedIntervals([]);
      expect(flattened).toHaveLength(0);
    });
  });

  describe("calculateIntervalState", () => {
    const warmupSeconds = 300; // 5 minutes
    const intervals: WorkoutInterval[] = [
      { type: "jog", seconds: 60, repeat_with_next: true },
      { type: "walk", seconds: 90, repeat_count: 2 },
    ];

    test("should return warmup phase when elapsed time is less than warmup duration", () => {
      const state = calculateIntervalState(150, warmupSeconds, intervals);

      expect(state.phase).toBe("warmup");
      expect(state.intervalElapsed).toBe(150);
      expect(state.currentInterval).toBeNull();
    });

    test("should return first interval when warmup completes", () => {
      const state = calculateIntervalState(300, warmupSeconds, intervals);

      expect(state.phase).toBe("interval");
      expect(state.currentIntervalIndex).toBe(0);
      expect(state.intervalElapsed).toBe(0);
      expect(state.currentInterval?.type).toBe("jog");
    });

    test("should transition to walk interval after jog", () => {
      // 300s warmup + 60s jog = 360s
      const state = calculateIntervalState(360, warmupSeconds, intervals);

      expect(state.phase).toBe("interval");
      expect(state.currentIntervalIndex).toBe(1);
      expect(state.intervalElapsed).toBe(0);
      expect(state.currentInterval?.type).toBe("walk");
    });

    test("should handle second repeat cycle", () => {
      // 300s warmup + 60s jog + 90s walk + 60s jog = 510s
      // Flattened: [jog, walk, jog, walk] so index 3 is the second walk
      const state = calculateIntervalState(510, warmupSeconds, intervals);

      expect(state.phase).toBe("interval");
      expect(state.currentIntervalIndex).toBe(3);
      expect(state.intervalElapsed).toBe(0);
      expect(state.currentInterval?.type).toBe("walk");
    });

    test("should calculate elapsed time within an interval", () => {
      // 300s warmup + 30s into first jog = 330s
      const state = calculateIntervalState(330, warmupSeconds, intervals);

      expect(state.phase).toBe("interval");
      expect(state.currentIntervalIndex).toBe(0);
      expect(state.intervalElapsed).toBe(30);
      expect(state.currentInterval?.type).toBe("jog");
    });

    test("should return complete phase when workout finishes", () => {
      // Total: 300s warmup + (60s + 90s) * 2 repeats = 600s
      const state = calculateIntervalState(600, warmupSeconds, intervals);

      expect(state.phase).toBe("complete");
    });

    test("should handle workout with no repeats", () => {
      const simpleIntervals: WorkoutInterval[] = [
        { type: "jog", seconds: 1500 }, // 25 minutes continuous jog
      ];

      const state = calculateIntervalState(1200, 300, simpleIntervals);

      expect(state.phase).toBe("interval");
      expect(state.currentIntervalIndex).toBe(0);
      expect(state.intervalElapsed).toBe(900); // 15 minutes into the jog
      expect(state.currentInterval?.type).toBe("jog");
    });
  });

  describe("formatTime", () => {
    test("should format seconds correctly", () => {
      expect(formatTime(0)).toBe("0:00");
      expect(formatTime(5)).toBe("0:05");
      expect(formatTime(59)).toBe("0:59");
    });

    test("should format minutes and seconds correctly", () => {
      expect(formatTime(60)).toBe("1:00");
      expect(formatTime(90)).toBe("1:30");
      expect(formatTime(125)).toBe("2:05");
    });

    test("should format larger durations correctly", () => {
      expect(formatTime(600)).toBe("10:00");
      expect(formatTime(1800)).toBe("30:00");
      expect(formatTime(3661)).toBe("61:01");
    });

    test("should pad single-digit seconds with zero", () => {
      expect(formatTime(61)).toBe("1:01");
      expect(formatTime(121)).toBe("2:01");
      expect(formatTime(605)).toBe("10:05");
    });
  });
});

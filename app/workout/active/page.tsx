"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";

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

interface WorkoutSession {
  sessionId: number;
  workout: {
    id: number;
    week: number;
    number: number;
    intervals: WorkoutData;
    duration_seconds: number;
  };
  startedAt: number;
}

type Phase = "warmup" | "interval" | "complete";

export default function WorkoutActivePage() {
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousPhaseRef = useRef<Phase | null>(null);
  const previousIntervalIndexRef = useRef<number | null>(null);

  const flatIntervals = useMemo((): WorkoutInterval[] => {
    if (!session) return [];
    const intervals = session.workout.intervals.intervals;
    const flattened: WorkoutInterval[] = [];

    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      if (interval.repeat_with_next && intervals[i + 1]) {
        const next = intervals[i + 1];
        const repeatCount = next.repeat_count || 1;
        for (let r = 0; r < repeatCount; r++) {
          flattened.push({ ...interval });
          flattened.push({ ...next });
        }
        i++; // Skip the next interval as it's already processed
      } else if (!interval.repeat_count) {
        flattened.push({ ...interval });
      }
    }

    return flattened;
  }, [session]);

  // Fetch session on mount
  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await apiPost<WorkoutSession>("/api/workouts/start");
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }
        if (res.data) {
          setSession(res.data);
        }
      } catch (error) {
        console.error("Error starting workout:", error);
        router.push("/dashboard");
      }
    };

    startSession();
  }, [router]);

  // Audio beep function
  const playBeep = useCallback((message: string) => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = message.toLowerCase().includes("jog")
      ? 880
      : 440;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    console.log("Audio cue (beep):", message);
  }, []);

  const { phase, currentIntervalIndex, intervalElapsed } = useMemo(() => {
    if (!session) {
      return {
        phase: "warmup" as Phase,
        currentIntervalIndex: 0,
        intervalElapsed: 0,
      };
    }

    const warmupSeconds = session.workout.intervals.warmup_seconds;

    if (elapsedSeconds < warmupSeconds) {
      return {
        phase: "warmup" as Phase,
        currentIntervalIndex: 0,
        intervalElapsed: elapsedSeconds,
      };
    }

    const intervalElapsedValue = elapsedSeconds - warmupSeconds;
    let accumulated = 0;
    let currentIdx = 0;

    for (let i = 0; i < flatIntervals.length; i++) {
      if (intervalElapsedValue < accumulated + flatIntervals[i].seconds) {
        currentIdx = i;
        break;
      }
      accumulated += flatIntervals[i].seconds;
    }

    const totalIntervalDuration = flatIntervals.reduce(
      (sum, int) => sum + int.seconds,
      0
    );

    if (
      !flatIntervals.length ||
      intervalElapsedValue >= totalIntervalDuration
    ) {
      return {
        phase: "complete" as Phase,
        currentIntervalIndex: Math.max(flatIntervals.length - 1, 0),
        intervalElapsed: Math.max(intervalElapsedValue - accumulated, 0),
      };
    }

    return {
      phase: "interval" as Phase,
      currentIntervalIndex: currentIdx,
      intervalElapsed: intervalElapsedValue - accumulated,
    };
  }, [elapsedSeconds, flatIntervals, session]);

  // Trigger audio cues on phase or interval transitions
  useEffect(() => {
    if (!session) return;

    const previousPhase = previousPhaseRef.current;
    const previousIntervalIndex = previousIntervalIndexRef.current;

    if (phase === "warmup" && previousPhase !== "warmup") {
      playBeep("Warm up - brisk walk");
    } else if (
      phase === "interval" &&
      (previousPhase !== "interval" ||
        currentIntervalIndex !== previousIntervalIndex)
    ) {
      const currentInterval = flatIntervals[currentIntervalIndex];
      if (currentInterval) {
        const activity =
          currentInterval.type === "jog" ? "Start jogging" : "Start walking";
        playBeep(activity);
      }
    }

    previousPhaseRef.current = phase;
    previousIntervalIndexRef.current =
      phase === "interval" ? currentIntervalIndex : null;
  }, [phase, currentIntervalIndex, flatIntervals, playBeep, session]);

  // Timer
  useEffect(() => {
    if (!session || isPaused || phase === "complete") {
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session, isPaused, phase]);

  const handlePause = async () => {
    if (!session) return;
    setIsPaused(true);
    try {
      await apiPost(`/api/workouts/${session.sessionId}/pause`);
    } catch (error) {
      console.error("Error pausing workout:", error);
    }
  };

  const handleResume = async () => {
    if (!session) return;
    setIsPaused(false);
    try {
      await apiPost(`/api/workouts/${session.sessionId}/resume`);
    } catch (error) {
      console.error("Error resuming workout:", error);
    }
  };

  const handleComplete = useCallback(async () => {
    if (!session) return;
    try {
      await apiPost(`/api/workouts/${session.sessionId}/complete`);
      router.push("/workout/complete");
    } catch (error) {
      console.error("Error completing workout:", error);
    }
  }, [router, session]);

  const handleQuit = async () => {
    if (!session) return;
    try {
      await apiPost(`/api/workouts/${session.sessionId}/quit`);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error quitting workout:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (phase === "complete") {
      handleComplete();
    }
  }, [phase, handleComplete]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading workout...</div>
      </div>
    );
  }

  const currentInterval =
    phase === "interval" ? flatIntervals[currentIntervalIndex] : null;

  // Calculate time remaining based on current phase
  let timeRemaining = 0;
  if (phase === "warmup") {
    timeRemaining = session.workout.intervals.warmup_seconds - intervalElapsed;
  } else if (phase === "interval" && currentInterval) {
    timeRemaining = currentInterval.seconds - intervalElapsed;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-xl font-semibold">
          Week {session.workout.week}, Workout {session.workout.number}
        </h1>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-6xl sm:text-7xl md:text-8xl font-bold mb-8">
          {formatTime(timeRemaining)}
        </div>

        {phase === "warmup" && (
          <>
            <div className="text-3xl font-semibold mb-2">Warm Up</div>
            <div className="text-xl text-indigo-200">Brisk Walk</div>
          </>
        )}

        {phase === "interval" && currentInterval && (
          <>
            <div
              className={`text-3xl font-semibold mb-2 ${
                currentInterval.type === "jog"
                  ? "text-yellow-300"
                  : "text-green-300"
              }`}
            >
              {currentInterval.type === "jog" ? "Jogging" : "Walking"}
            </div>
            <div className="text-xl text-indigo-200">
              Interval {currentIntervalIndex + 1} of {flatIntervals.length}
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          {!isPaused ? (
            <button
              onClick={handlePause}
              className="flex-1 bg-yellow-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-yellow-600 min-h-[44px]"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="flex-1 bg-green-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-600 min-h-[44px]"
            >
              Resume
            </button>
          )}
          <button
            onClick={() => setShowQuitDialog(true)}
            className="flex-1 bg-red-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-red-600 min-h-[44px]"
          >
            Quit
          </button>
        </div>
      </div>

      {/* Quit Dialog */}
      {showQuitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Quit Workout?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to quit? Your progress will not be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitDialog(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleQuit}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Quit Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

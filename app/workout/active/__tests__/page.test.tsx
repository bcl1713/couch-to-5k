import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useRouter } from "next/navigation";
import WorkoutActivePage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useWakeLock", () => ({
  useWakeLock: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

let nowMs = 0;

const createJsonResponse = (data: unknown): Response =>
  ({
    ok: true,
    status: 200,
    headers: {
      get: (header: string) =>
        header.toLowerCase() === "content-type" ? "application/json" : null,
    },
    json: () => Promise.resolve(data),
  }) as Response;

const mockWorkoutSession = {
  sessionId: 42,
  startedAt: 0,
  workout: {
    id: 7,
    week: 1,
    number: 1,
    duration_seconds: 17,
    intervals: {
      week: 1,
      number: 1,
      warmup_seconds: 5,
      intervals: [
        { type: "walk", seconds: 5 },
        { type: "jog", seconds: 7 },
      ],
      total_duration_seconds: 17,
      is_final_workout: false,
    },
  },
};

describe("WorkoutActivePage timer", () => {
  const mockPush = jest.fn();
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    nowMs = 1_000_000;
    jest.spyOn(Date, "now").mockImplementation(() => nowMs);
    consoleInfoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);

    global.fetch = jest.fn((url) => {
      if (url === "/api/workouts/start") {
        return Promise.resolve(createJsonResponse(mockWorkoutSession));
      }
      if (
        url === "/api/workouts/42/pause" ||
        url === "/api/workouts/42/resume" ||
        url === "/api/workouts/42/complete"
      ) {
        return Promise.resolve(createJsonResponse({}));
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
    }) as jest.Mock;

    class MockAudioContext {
      currentTime = 0;
      destination = {};
      createOscillator() {
        return {
          frequency: { value: 0 },
          type: "sine",
          connect: jest.fn(),
          start: jest.fn(),
          stop: jest.fn(),
        };
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn(),
          },
          connect: jest.fn(),
        };
      }
    }

    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: MockAudioContext,
    });
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const renderStartedWorkout = async () => {
    render(<WorkoutActivePage />);
    await waitFor(() => {
      expect(screen.getByText("Warm Up")).toBeInTheDocument();
    });
  };

  const advanceWallClockAndRunOneTick = async (milliseconds: number) => {
    nowMs += milliseconds;
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  };

  it("catches up from wall-clock time after timer callbacks are delayed", async () => {
    await renderStartedWorkout();

    await advanceWallClockAndRunOneTick(7000);

    expect(screen.getByText("Walking")).toBeInTheDocument();
    expect(screen.getByText("0:03")).toBeInTheDocument();
  });

  it("excludes paused wall-clock duration from elapsed workout time", async () => {
    await renderStartedWorkout();
    await advanceWallClockAndRunOneTick(2000);

    fireEvent.click(screen.getByText("Pause"));
    await waitFor(() => {
      expect(screen.getByText("Resume")).toBeInTheDocument();
    });

    nowMs += 10_000;
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });

    fireEvent.click(screen.getByText("Resume"));
    await waitFor(() => {
      expect(screen.getByText("Pause")).toBeInTheDocument();
    });

    await advanceWallClockAndRunOneTick(1000);

    expect(screen.getByText("Warm Up")).toBeInTheDocument();
    expect(screen.getByText("0:02")).toBeInTheDocument();
  });

  it("does not replay every missed transition cue after a throttled background tick", async () => {
    await renderStartedWorkout();
    consoleInfoSpy.mockClear();

    await advanceWallClockAndRunOneTick(11_000);

    const audioCueMessages = consoleInfoSpy.mock.calls
      .map((call) => String(call[0]))
      .filter((message) => message.startsWith("Audio cue"));

    expect(screen.getByText("Jogging")).toBeInTheDocument();
    expect(audioCueMessages).toHaveLength(1);
    expect(consoleInfoSpy).not.toHaveBeenCalledWith(
      "Audio cue (beep):",
      "Start walking"
    );
  });
});

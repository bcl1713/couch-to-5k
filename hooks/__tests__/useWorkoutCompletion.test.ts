import { renderHook, act, waitFor } from "@testing-library/react";
import { useWorkoutCompletion } from "../useWorkoutCompletion";
import * as apiClient from "@/lib/api-client";

// Mock the API client
jest.mock("@/lib/api-client");

const mockApiPost = apiClient.apiPost as jest.MockedFunction<
  typeof apiClient.apiPost
>;
const mockApiGet = apiClient.apiGet as jest.MockedFunction<
  typeof apiClient.apiGet
>;
const mockFormatApiError = apiClient.formatApiError as jest.MockedFunction<
  typeof apiClient.formatApiError
>;

describe("useWorkoutCompletion", () => {
  const mockProgress = {
    currentWeek: 1,
    currentWorkout: 1,
    lastCompletedAt: null,
    nextWorkout: {
      id: 1,
      week: 1,
      number: 1,
      intervals: {
        week: 1,
        number: 1,
        warmup_seconds: 300,
        intervals: [],
        total_duration_seconds: 1200,
        is_final_workout: false,
      },
      durationSeconds: 1200,
    },
  };

  const mockHistory = [
    {
      id: 1,
      week: 1,
      workoutNumber: 1,
      completedAt: 1000,
      type: "timer_completion",
    },
  ];

  const mockOnProgressUpdate = jest.fn();
  const mockOnHistoryUpdate = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatApiError.mockImplementation((error) => error?.error || "Error");
  });

  it("should initialize with no loading or error state", () => {
    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: mockProgress,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should return early if progress or nextWorkout is null", async () => {
    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: null,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    await act(async () => {
      await result.current.markComplete();
    });

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(mockOnProgressUpdate).not.toHaveBeenCalled();
  });

  it("should optimistically update state before API call", async () => {
    mockApiPost.mockResolvedValue({
      ok: true,
      status: 200,
      data: {},
    });

    mockApiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...mockProgress,
        currentWeek: 1,
        currentWorkout: 2,
      },
    });

    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: mockProgress,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    act(() => {
      result.current.markComplete();
    });

    // Should immediately update with optimistic values
    await waitFor(() => {
      expect(mockOnHistoryUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            week: 1,
            workoutNumber: 1,
            type: "manual_completion",
          }),
        ])
      );
    });

    expect(mockOnProgressUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        currentWeek: 1,
        currentWorkout: 2,
        nextWorkout: null,
      })
    );
  });

  it("should fetch updated progress on successful completion", async () => {
    const updatedProgress = {
      ...mockProgress,
      currentWeek: 1,
      currentWorkout: 2,
    };

    mockApiPost.mockResolvedValue({
      ok: true,
      status: 200,
      data: {},
    });

    mockApiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: updatedProgress,
    });

    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: mockProgress,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
        onSuccess: mockOnSuccess,
      })
    );

    await act(async () => {
      await result.current.markComplete();
    });

    expect(mockApiPost).toHaveBeenCalledWith("/api/workouts/mark-complete", {});
    expect(mockApiGet).toHaveBeenCalledWith("/api/user/progress");
    expect(mockOnProgressUpdate).toHaveBeenLastCalledWith(updatedProgress);
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it("should rollback on API error", async () => {
    mockApiPost.mockResolvedValue({
      ok: false,
      status: 500,
      error: { error: "Server error" },
    });

    mockFormatApiError.mockReturnValue("Server error");

    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: mockProgress,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    await act(async () => {
      await result.current.markComplete();
    });

    // Should rollback to original state
    expect(mockOnProgressUpdate).toHaveBeenLastCalledWith(mockProgress);
    expect(mockOnHistoryUpdate).toHaveBeenLastCalledWith(mockHistory);
    expect(result.current.error).toBe("Server error");
  });

  it("should rollback if progress fetch fails", async () => {
    mockApiPost.mockResolvedValue({
      ok: true,
      status: 200,
      data: {},
    });

    mockApiGet.mockResolvedValue({
      ok: false,
      status: 500,
      error: { error: "Failed to fetch" },
    });

    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: mockProgress,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    await act(async () => {
      await result.current.markComplete();
    });

    // Should rollback
    expect(mockOnProgressUpdate).toHaveBeenLastCalledWith(mockProgress);
    expect(mockOnHistoryUpdate).toHaveBeenLastCalledWith(mockHistory);
    expect(result.current.error).toBe(
      "Failed to update progress. Please try again."
    );
  });

  it("should handle network errors", async () => {
    mockApiPost.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: mockProgress,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    await act(async () => {
      await result.current.markComplete();
    });

    expect(mockOnProgressUpdate).toHaveBeenLastCalledWith(mockProgress);
    expect(mockOnHistoryUpdate).toHaveBeenLastCalledWith(mockHistory);
    expect(result.current.error).toBe(
      "Unable to connect. Please check your internet connection."
    );
  });

  it("should handle offline queue scenarios", async () => {
    mockApiPost.mockResolvedValue({
      ok: false,
      status: 503,
      error: {
        error: "Service unavailable",
        offline: true,
        queued: true,
      },
    });

    mockFormatApiError.mockReturnValue(
      "You're offline. Your action has been saved and will sync when you're back online."
    );

    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: mockProgress,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    await act(async () => {
      await result.current.markComplete();
    });

    expect(result.current.error).toBe(
      "You're offline. Your action has been saved and will sync when you're back online."
    );
  });

  it("should clear error when clearError is called", async () => {
    mockApiPost.mockResolvedValue({
      ok: false,
      status: 500,
      error: { error: "Test error" },
    });

    mockFormatApiError.mockReturnValue("Test error");

    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: mockProgress,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    await act(async () => {
      await result.current.markComplete();
    });

    expect(result.current.error).toBe("Test error");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it("should calculate next workout correctly for week transitions", async () => {
    const progressWeek1Workout3 = {
      ...mockProgress,
      currentWeek: 1,
      currentWorkout: 3,
    };

    mockApiPost.mockResolvedValue({
      ok: true,
      status: 200,
      data: {},
    });

    mockApiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...progressWeek1Workout3,
        currentWeek: 2,
        currentWorkout: 1,
      },
    });

    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: progressWeek1Workout3,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    await act(async () => {
      await result.current.markComplete();
    });

    // Check optimistic update used correct calculation
    expect(mockOnProgressUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        currentWeek: 2,
        currentWorkout: 1,
      })
    );
  });

  it("should set loading state correctly during mutation", async () => {
    mockApiPost.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 200,
                data: {},
              }),
            100
          );
        })
    );

    mockApiGet.mockResolvedValue({
      ok: true,
      status: 200,
      data: mockProgress,
    });

    const { result } = renderHook(() =>
      useWorkoutCompletion({
        progress: mockProgress,
        history: mockHistory,
        onProgressUpdate: mockOnProgressUpdate,
        onHistoryUpdate: mockOnHistoryUpdate,
      })
    );

    act(() => {
      result.current.markComplete();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

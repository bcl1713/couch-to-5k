import { renderHook, act, waitFor } from "@testing-library/react";
import { useOptimisticMutation } from "../useOptimisticMutation";

interface TestState {
  count: number;
  message: string;
}

describe("useOptimisticMutation", () => {
  const initialState: TestState = {
    count: 0,
    message: "initial",
  };

  it("should initialize with the provided initial state", () => {
    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn: async () => {},
          optimisticUpdate: (state) => state,
        },
        initialState
      )
    );

    expect(result.current.state).toEqual(initialState);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should apply optimistic update immediately", async () => {
    const mutationFn = jest.fn().mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn,
          optimisticUpdate: (state) => ({
            ...state,
            count: state.count + 1,
            message: "optimistic",
          }),
        },
        initialState
      )
    );

    act(() => {
      result.current.mutate();
    });

    // Should update immediately (before promise resolves)
    expect(result.current.state).toEqual({
      count: 1,
      message: "optimistic",
    });
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("should keep optimistic state on success when onSuccess returns undefined", async () => {
    const mutationFn = jest.fn().mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn,
          optimisticUpdate: (state) => ({
            ...state,
            count: state.count + 1,
          }),
          onSuccess: () => undefined, // Keep optimistic state
        },
        initialState
      )
    );

    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.state.count).toBe(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should replace optimistic state with server response on success", async () => {
    const serverResponse: TestState = {
      count: 5,
      message: "from server",
    };

    const mutationFn = jest.fn().mockResolvedValue(serverResponse);

    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn,
          optimisticUpdate: (state) => ({
            ...state,
            count: state.count + 1,
            message: "optimistic",
          }),
          onSuccess: (response) => response as TestState,
        },
        initialState
      )
    );

    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.state).toEqual(serverResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should rollback to previous state on error", async () => {
    const mutationFn = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn,
          optimisticUpdate: (state) => ({
            ...state,
            count: state.count + 1,
          }),
        },
        initialState
      )
    );

    await act(async () => {
      await result.current.mutate();
    });

    // Should rollback to initial state
    expect(result.current.state).toEqual(initialState);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("should use custom onError handler for rollback", async () => {
    const mutationFn = jest.fn().mockRejectedValue(new Error("Custom error"));

    const customErrorState: TestState = {
      count: -1,
      message: "error state",
    };

    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn,
          optimisticUpdate: (state) => ({
            ...state,
            count: state.count + 1,
          }),
          onError: () => customErrorState,
        },
        initialState
      )
    );

    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.state).toEqual(customErrorState);
    expect(result.current.error).toBe("Custom error");
  });

  it("should handle non-Error exceptions", async () => {
    const mutationFn = jest.fn().mockRejectedValue("String error");

    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn,
          optimisticUpdate: (state) => state,
        },
        initialState
      )
    );

    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.error).toBe("Unknown error");
  });

  it("should clear error when clearError is called", async () => {
    const mutationFn = jest.fn().mockRejectedValue(new Error("Test error"));

    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn,
          optimisticUpdate: (state) => state,
        },
        initialState
      )
    );

    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.error).toBe("Test error");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it("should allow manual state updates via setState", () => {
    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn: async () => {},
          optimisticUpdate: (state) => state,
        },
        initialState
      )
    );

    const newState: TestState = {
      count: 42,
      message: "manual update",
    };

    act(() => {
      result.current.setState(newState);
    });

    expect(result.current.state).toEqual(newState);
  });

  it("should handle multiple successive mutations", async () => {
    let callCount = 0;
    const mutationFn = jest.fn().mockImplementation(async () => {
      callCount++;
      return { count: callCount };
    });

    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn,
          optimisticUpdate: (state) => ({
            ...state,
            count: state.count + 1,
          }),
          onSuccess: (response) =>
            ({
              count: (response as { count: number }).count,
              message: "success",
            }) as TestState,
        },
        initialState
      )
    );

    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.state.count).toBe(1);

    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.state.count).toBe(2);
    expect(mutationFn).toHaveBeenCalledTimes(2);
  });

  it("should clear error on successful mutation after previous error", async () => {
    const mutationFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("First error"))
      .mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() =>
      useOptimisticMutation(
        {
          mutationFn,
          optimisticUpdate: (state) => ({
            ...state,
            count: state.count + 1,
          }),
        },
        initialState
      )
    );

    // First mutation fails
    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.error).toBe("First error");

    // Second mutation succeeds
    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.state.count).toBe(1);
  });
});

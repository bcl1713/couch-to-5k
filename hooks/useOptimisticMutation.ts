import { useState, useCallback } from "react";

/**
 * Configuration for optimistic mutations
 */
export interface OptimisticMutationConfig<TState, TResult> {
  /**
   * Function that performs the mutation (API call)
   */
  mutationFn: () => Promise<TResult>;

  /**
   * Function that returns the optimistic state update
   */
  optimisticUpdate: (currentState: TState) => TState;

  /**
   * Function that handles successful mutation
   * Can return updated state or undefined to keep optimistic state
   */
  onSuccess?: (result: TResult, currentState: TState) => TState | undefined;

  /**
   * Function that handles failed mutation
   * Returns the state to rollback to (usually the previous state)
   */
  onError?: (error: unknown, previousState: TState) => TState;
}

/**
 * Result of the optimistic mutation hook
 */
export interface OptimisticMutationResult<TState> {
  /**
   * Current state value
   */
  state: TState;

  /**
   * Whether the mutation is in progress
   */
  isLoading: boolean;

  /**
   * Error from the most recent mutation attempt
   */
  error: string | null;

  /**
   * Trigger the mutation with optimistic updates
   */
  mutate: () => Promise<void>;

  /**
   * Manually update the state
   */
  setState: (state: TState) => void;

  /**
   * Clear the current error
   */
  clearError: () => void;
}

/**
 * Custom hook for handling mutations with optimistic UI updates and automatic rollback
 *
 * @example
 * ```tsx
 * const { state, mutate, isLoading, error } = useOptimisticMutation({
 *   mutationFn: async () => {
 *     return await fetch('/api/data', { method: 'POST' });
 *   },
 *   optimisticUpdate: (current) => ({
 *     ...current,
 *     count: current.count + 1,
 *   }),
 *   onSuccess: (result) => ({
 *     // Return server state
 *     ...result.data
 *   }),
 *   onError: (error, previous) => previous, // Rollback to previous state
 * }, initialState);
 * ```
 */
export function useOptimisticMutation<TState, TResult = unknown>(
  config: OptimisticMutationConfig<TState, TResult>,
  initialState: TState
): OptimisticMutationResult<TState> {
  const [state, setState] = useState<TState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Store previous state for potential rollback
    const previousState = state;

    // Apply optimistic update immediately
    const optimisticState = config.optimisticUpdate(state);
    setState(optimisticState);

    try {
      // Perform the actual mutation
      const result = await config.mutationFn();

      // Handle success - allow overriding optimistic state with server response
      if (config.onSuccess) {
        const successState = config.onSuccess(result, optimisticState);
        if (successState !== undefined) {
          setState(successState);
        }
      }
    } catch (err) {
      // Handle error - rollback to previous state
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);

      if (config.onError) {
        const errorState = config.onError(err, previousState);
        setState(errorState);
      } else {
        // Default: rollback to previous state
        setState(previousState);
      }
    } finally {
      setIsLoading(false);
    }
  }, [state, config]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state,
    isLoading,
    error,
    mutate,
    setState,
    clearError,
  };
}

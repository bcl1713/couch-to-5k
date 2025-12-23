/**
 * Utilities for calculating and managing workout progress
 */

export interface NextWorkout {
  nextWeek: number;
  nextWorkout: number;
}

/**
 * Calculates the next workout number and week after completing a workout
 *
 * @param currentWeek - The current week number (1-9)
 * @param currentWorkout - The current workout number (1-3)
 * @returns Object containing nextWeek and nextWorkout
 *
 * @example
 * // Complete workout 1 of week 1
 * calculateNextWorkout(1, 1) // { nextWeek: 1, nextWorkout: 2 }
 *
 * @example
 * // Complete workout 3 of week 1 (advance to next week)
 * calculateNextWorkout(1, 3) // { nextWeek: 2, nextWorkout: 1 }
 *
 * @example
 * // Complete workout 3 of week 9 (program complete)
 * calculateNextWorkout(9, 3) // { nextWeek: 9, nextWorkout: 3 }
 */
export function calculateNextWorkout(
  currentWeek: number,
  currentWorkout: number
): NextWorkout {
  let nextWeek = currentWeek;
  let nextWorkout = currentWorkout + 1;

  // Handle week transitions (after workout 3)
  if (currentWorkout === 3) {
    if (currentWeek < 9) {
      // Advance to next week
      nextWeek = currentWeek + 1;
      nextWorkout = 1;
    } else {
      // Program complete - stay at week 9, workout 3
      nextWeek = 9;
      nextWorkout = 3;
    }
  }

  return { nextWeek, nextWorkout };
}

/**
 * Checks if the program has been completed
 *
 * @param week - The week number
 * @param workout - The workout number
 * @returns true if the user has completed the program
 */
export function isProgramComplete(week: number, workout: number): boolean {
  return week === 9 && workout === 3;
}

/**
 * Validates that week and workout numbers are within valid ranges
 *
 * @param week - The week number to validate
 * @param workout - The workout number to validate
 * @returns true if both values are valid
 */
export function isValidProgress(week: number, workout: number): boolean {
  return week >= 1 && week <= 9 && workout >= 1 && workout <= 3;
}

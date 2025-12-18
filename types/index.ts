/**
 * Global TypeScript type definitions for the Couch to 5K application
 */

// Workout-related types
export interface WorkoutSession {
  id: string;
  userId: string;
  week: number;
  workoutNumber: 1 | 2 | 3;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  intervals: WorkoutInterval[];
}

export interface WorkoutInterval {
  type: "warmup" | "jog" | "walk" | "cooldown";
  durationSeconds: number;
  startTimeSeconds: number;
  completed: boolean;
}

// User-related types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  currentWeek: number;
  currentWorkout: 1 | 2 | 3;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Component prop types
export interface TimerProps {
  totalSeconds: number;
  isRunning: boolean;
  onComplete: () => void;
}

export interface WorkoutDisplayProps {
  week: number;
  workoutNumber: 1 | 2 | 3;
  currentInterval: WorkoutInterval | null;
  totalProgress: number;
}

# Change: Add Workout Interval Summary to Dashboard

## Why

Users starting a workout should be able to preview what intervals they're
about to perform before beginning. Currently, the dashboard shows only the
total duration, leaving users uncertain about the workout structure (e.g., how
many jog/walk intervals, duration of each). This visibility helps users
mentally prepare and decide if they're ready to start.

## What Changes

- Add an interval breakdown/summary to the workout card on the dashboard
  (app/dashboard/page.tsx)
- Display flattened interval structure in a user-friendly format (e.g., "8x
  (60s jog, 90s walk)")
- Reuse existing `getFlattenedIntervals` utility from lib/workout-utils.ts
- Add tests for new interval summary formatting logic
- Update linting to ensure code quality

## Impact

- **Affected specs**: dashboard (new capability)
- **Affected code**:
  - app/dashboard/page.tsx (add interval summary display)
  - lib/workout-utils.ts (potentially add summary formatting function)
  - New tests for summary formatting
- **User benefit**: Users can see workout details before starting, improving
  informed decision-making

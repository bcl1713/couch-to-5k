# dashboard Specification

## Purpose

TBD - created by archiving change add-workout-interval-summary. Update Purpose after archive.

## Requirements

### Requirement: Workout Interval Summary Display

The dashboard SHALL display a human-readable summary of workout intervals for
the next scheduled workout, showing users what activities they will perform
before starting the workout.

#### Scenario: Simple repeated intervals displayed

- **WHEN** user views dashboard with next workout having 8 repeated intervals
  of 60s jog + 90s walk
- **THEN** interval summary displays "8x (60s jog, 90s walk)" or similar
  readable format

#### Scenario: Complex mixed intervals displayed

- **WHEN** user views dashboard with next workout having varied intervals
  (e.g., Week 4: 3min jog, 90s walk, 5min jog, 2.5min walk, etc.)
- **THEN** interval summary displays all intervals in sequence with clear
  formatting

#### Scenario: Continuous jog workout displayed

- **WHEN** user views dashboard with next workout having single continuous jog
  interval (e.g., Week 7-9)
- **THEN** interval summary displays "20 min jog" or similar simple format

#### Scenario: No next workout available

- **WHEN** user has completed all workouts and no next workout exists
- **THEN** interval summary section is not displayed or shows appropriate
  completion message

# Workout Tracking

## ADDED Requirements

### Requirement: Couch to 5K Program Structure

The system SHALL define the complete 9-week Couch to 5K progression with
structured intervals and durations for each week and workout session, following
the official Couch to 5K program specification.

#### Scenario: Week 1 workout intervals are defined

- **WHEN** the system initializes the program structure
- **THEN** Week 1 contains 3 identical workouts
- **THEN** each Week 1 workout: 5 min warmup + 8 cycles of 60s jog / 90s walk
- **THEN** total workout time is 25 minutes (5 min warmup + 20 min intervals)

#### Scenario: Week 3 workout intervals progress correctly

- **WHEN** a user completes Week 2
- **THEN** Week 3 unlocks with new intervals
- **THEN** Week 3 Workout 1: 5 min warmup + 2 sets (90s jog/walk + 3 min jog/walk)
- **THEN** Week 3 Workouts 2-3 are identical to Workout 1

#### Scenario: Week 5 shows diverse progression

- **WHEN** a user reaches Week 5
- **THEN** Workout 1: 5 min warmup + 3 cycles of 5 min jog / 3 min walk
- **THEN** Workout 2: 5 min warmup + 8 min jog / 5 min walk / 8 min jog
- **THEN** Workout 3: 5 min warmup + 20 minutes continuous jogging

#### Scenario: Week 9 final progression

- **WHEN** a user reaches Week 9
- **THEN** all 3 workouts require 5 min warmup + 30 min continuous jogging
- **THEN** no walking recovery intervals remain
- **THEN** Workout 3 includes celebratory message marking program completion

### Requirement: User Workout Progress Tracking

The system SHALL track each user's progression through the 9-week program,
recording which week, workout, and interval they are currently on.

#### Scenario: New user starts at Week 1 Workout 1

- **WHEN** a newly registered user accesses the dashboard
- **THEN** their current progress is set to Week 1, Workout 1
- **THEN** they can start a workout session immediately

#### Scenario: User progress advances after workout completion

- **WHEN** a user completes Workout 1 of Week 1
- **THEN** the system records the completion timestamp
- **THEN** their progress is updated to Week 1, Workout 2
- **THEN** they are eligible to start Workout 2

#### Scenario: User auto-advances to next week after completing 3 workouts

- **WHEN** a user completes all 3 workouts in a week
- **THEN** the system automatically advances them to Week 2, Workout 1
- **THEN** the new week's intervals become available

### Requirement: Workout Session Structure

The system SHALL define each workout session with three phases: warmup, main
intervals, and cooldown, each with appropriate duration and cues.

#### Scenario: Warmup phase is 5 minutes

- **WHEN** a user starts a workout session
- **THEN** the warmup phase is 5 minutes of brisk walking
- **THEN** an audio cue announces "Start your brisk five-minute warmup walk"

#### Scenario: Main intervals follow warmup

- **WHEN** the warmup phase completes
- **THEN** the main interval sequence begins
- **THEN** the first interval cue is announced (e.g., "Start jogging")

#### Scenario: Cooldown follows main intervals

- **WHEN** the last main interval completes
- **THEN** the cooldown phase begins with implied walking
- **THEN** total workout duration is session plan plus 5 minute warmup

### Requirement: Active Workout Session Management

The system SHALL manage the state of an active workout session, tracking elapsed
time, current phase, and interval transitions.

#### Scenario: User can start a workout session

- **WHEN** a user clicks "Start Workout" on an available session
- **THEN** the system creates an active session record
- **THEN** the warmup timer begins counting down
- **THEN** the timer is displayed in real-time on the UI

#### Scenario: User can pause and resume a workout

- **WHEN** a user clicks the pause button during an active session
- **THEN** the timer pauses and saves the current position
- **THEN** the user can click resume to continue from that position

#### Scenario: User can abandon a workout session

- **WHEN** a user clicks "quit" or navigates away during a session
- **THEN** the system records the session as incomplete
- **THEN** the user can restart the same workout from the beginning

### Requirement: Interval Transition Cues

The system SHALL provide audible cues at interval transitions (start jog, start
walk, cooldown) using voice announcements and optional tone markers.

#### Scenario: Audio cue plays at jog start

- **WHEN** an interval transitions from walk to jog phase
- **THEN** an audio cue announces "Start jogging"
- **THEN** an optional tone marker sounds (beep/chime)

#### Scenario: Audio cue plays at walk start

- **WHEN** an interval transitions from jog to walk phase
- **THEN** an audio cue announces "Start walking"

### Requirement: Workout Completion and Persistence

The system SHALL record workout completion, updating user progress and storing
session details for history and analytics.

#### Scenario: Successful workout completion is recorded

- **WHEN** a user completes all intervals of a workout session
- **THEN** the system records the completion timestamp
- **THEN** the session status is marked as "completed"
- **THEN** user progress is updated

#### Scenario: Completed workout appears in user history

- **WHEN** a user accesses their workout history
- **THEN** all completed workouts are listed with dates and durations
- **THEN** current week/workout status is displayed prominently

### Requirement: Manual Workout Completion

The system SHALL allow users to manually mark a workout as completed if they
completed the workout outside of the tracker (e.g., completed it without using
the app's timer).

#### Scenario: User manually marks workout complete from dashboard

- **WHEN** a user is on the dashboard viewing the current workout
- **THEN** a "Mark Complete" button is available alongside "Start Workout"
- **WHEN** the user clicks "Mark Complete"
- **THEN** a confirmation dialog appears asking "Mark this workout as complete?"
- **THEN** confirming marks the workout complete with today's date
- **THEN** user progress advances to the next workout
- **THEN** the workout appears in workout history

#### Scenario: User manually completes a past workout

- **WHEN** a user accesses their workout history
- **THEN** incomplete past workouts show a "Mark Complete" option
- **WHEN** the user clicks "Mark Complete" on a past workout
- **THEN** a date picker allows selecting the completion date
- **THEN** marking complete records the workout with the selected date
- **THEN** user progress is updated if it's the next scheduled workout

#### Scenario: Manually completed workouts are recorded correctly

- **WHEN** a user manually marks a workout complete
- **THEN** the session is recorded with type "manual_completion"
- **THEN** no elapsed time or intervals are recorded (manual completions have
  no timer data)
- **THEN** the completion timestamp is recorded with user-specified date
- **THEN** the workout counts toward program progression

### Requirement: Flexible Program Progression

The system SHALL allow users to adjust their progress backwards or repeat
workouts if they feel their body needs more recovery or if they have missed
training days.

#### Scenario: User repeats the current workout

- **WHEN** a user views their dashboard
- **THEN** a "Repeat This Workout" button or link is available
- **WHEN** the user clicks it
- **THEN** the current workout remains the same on next access
- **THEN** the workout history does not show this as a progression action
- **THEN** the user can start the same workout again

#### Scenario: User moves back one week due to recovery needs

- **WHEN** a user feels they need more practice with current week
- **THEN** an access to "Settings" or "Progress" menu shows progress controls
- **WHEN** the user selects "Go Back One Week"
- **THEN** a confirmation dialog explains the action
- **THEN** confirming moves progress back to the first workout of previous week
- **THEN** the user can now practice the previous week's workouts again

#### Scenario: User moves forward if they completed workouts outside the app

- **WHEN** a user has completed workouts without using the tracker
- **THEN** they can advance their progress manually from the progress menu
- **WHEN** the user selects "Jump to Week X, Workout Y"
- **THEN** a confirmation dialog shows the change
- **THEN** confirming updates their current progress to selected week/workout

#### Scenario: Progress adjustment is recorded in history

- **WHEN** a user adjusts their progress (repeat, go back, jump forward)
- **THEN** the action is logged (but not as a workout completion)
- **THEN** the adjustment appears in progress notes or history with timestamp
- **THEN** the user can see they made a progress adjustment, not completed a
  workout

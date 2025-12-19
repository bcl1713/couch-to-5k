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

### Requirement: Landing Page for Authenticated Users

The system SHALL display a dashboard after login showing the user's current
progress in the program and options to start or manually mark the next workout.

#### Scenario: Dashboard displays current week and workout

- **WHEN** a logged-in user accesses the dashboard
- **THEN** the page displays "Week 2, Workout 1 of 3"
- **THEN** the current workout description is shown (intervals, durations)

#### Scenario: Dashboard shows workout action buttons

- **WHEN** a user views the dashboard
- **THEN** a prominent "Start Workout" button is displayed
- **THEN** a "Mark Complete" button is displayed alongside "Start Workout"
- **WHEN** clicking "Start Workout" the user navigates to the workout session
- **WHEN** clicking "Mark Complete" a confirmation dialog appears

#### Scenario: Dashboard shows user's recent workout history

- **WHEN** a user views the dashboard
- **THEN** a list of the last 5 completed workouts is displayed
- **THEN** each entry shows date, week, workout number, and completion type
  (timer-based or manual)

#### Scenario: Dashboard includes logout option

- **WHEN** a logged-in user views the dashboard
- **THEN** a logout button or menu is accessible
- **THEN** clicking logout clears the session and redirects to login page

#### Scenario: Dashboard shows progress adjustment options

- **WHEN** a user views the dashboard
- **THEN** a "Repeat This Workout" option is available (next to Mark Complete)
- **WHEN** the user clicks "Repeat This Workout"
- **THEN** the current week/workout remains unchanged
- **THEN** they can immediately start the same workout again

### Requirement: Progress Settings Page

The system SHALL provide a progress settings page where users can adjust their
current position in the program (repeat current week, go back one week, or jump
to a specific week/workout).

#### Scenario: User accesses progress settings

- **WHEN** a user clicks on a settings/menu icon on the dashboard
- **THEN** a menu or navigation option shows "Progress Settings"
- **WHEN** clicking "Progress Settings"
- **THEN** the page displays current progress ("Week 4, Workout 2")
- **THEN** options are displayed for: Repeat Week, Go Back One Week, Jump To...

#### Scenario: User repeats current week

- **WHEN** a user is on the progress settings page
- **THEN** a "Repeat Current Week" button or option is available
- **WHEN** the user clicks it
- **THEN** a confirmation dialog appears explaining the action
- **THEN** confirming resets progress to Workout 1 of the current week
- **THEN** the user can now repeat the week's workouts

#### Scenario: User goes back one week

- **WHEN** a user is on the progress settings page
- **THEN** a "Go Back One Week" button is available (disabled if at Week 1)
- **WHEN** the user clicks it
- **THEN** a confirmation dialog explains they will restart the previous week
- **WHEN** confirming, progress moves to Workout 1 of the previous week
- **THEN** the user is redirected to dashboard showing updated progress

#### Scenario: User jumps to specific week/workout

- **WHEN** a user is on the progress settings page
- **THEN** a "Jump to Week..." option is available
- **WHEN** the user selects this option
- **THEN** a dialog displays a dropdown or picker for Week (1-9)
- **THEN** after selecting week, a second picker shows Workout (1-3)
- **WHEN** the user confirms the selection
- **THEN** progress is updated to the selected week and workout
- **THEN** the dashboard displays the new progress

#### Scenario: Progress adjustments are logged

- **WHEN** a user adjusts their progress
- **THEN** the adjustment is recorded with timestamp and adjustment type
- **THEN** the adjustment appears in a "Progress Log" section on settings page
- **THEN** the log shows all progress adjustments (not workout completions)

### Requirement: Public Landing Page for Unauthenticated Users

The system SHALL display a landing page for unauthenticated users introducing
the Couch to 5K program and providing options to login or signup.

#### Scenario: Unauthenticated user sees welcome page

- **WHEN** an unauthenticated user accesses the root URL `/`
- **THEN** a landing page is displayed
- **THEN** the page describes the Couch to 5K program and its benefits

#### Scenario: Landing page has login and signup buttons

- **WHEN** an unauthenticated user views the landing page
- **THEN** a "Login" button links to `/login`
- **THEN** a "Sign Up" button links to `/signup`

### Requirement: Login Page

The system SHALL display a login form allowing users to enter email and
password credentials.

#### Scenario: Login form displays email and password fields

- **WHEN** a user navigates to `/login`
- **THEN** an email input field is displayed
- **THEN** a password input field is displayed
- **THEN** a "Login" submit button is present

#### Scenario: Login form submission sends credentials to API

- **WHEN** a user submits the login form with valid credentials
- **THEN** the form data is sent to POST `/api/auth/login`
- **THEN** on success, the user is redirected to the dashboard
- **THEN** on failure, an error message is displayed

#### Scenario: Login page has link to signup

- **WHEN** a new user views the login page
- **THEN** a "Sign up here" link is displayed
- **THEN** clicking the link navigates to `/signup`

### Requirement: Signup Page

The system SHALL display a signup form allowing new users to create an account
with email and password.

#### Scenario: Signup form displays email and password fields

- **WHEN** a user navigates to `/signup`
- **THEN** an email input field is displayed
- **THEN** a password input field is displayed
- **THEN** a password confirmation field is displayed
- **THEN** a "Sign Up" submit button is present

#### Scenario: Signup form validates password match

- **WHEN** a user enters mismatched passwords and submits
- **THEN** the form displays error "Passwords do not match"
- **THEN** the signup is rejected

#### Scenario: Signup form submission sends credentials to API

- **WHEN** a user submits the signup form
- **THEN** the form data is sent to POST `/api/auth/signup`
- **THEN** on success, the user account is created
- **THEN** the user is authenticated and redirected to dashboard

#### Scenario: Signup page has link to login

- **WHEN** an existing user views the signup page
- **THEN** a "Already have an account? Log in here" link is displayed
- **THEN** clicking the link navigates to `/login`

### Requirement: Workout Session Display

The system SHALL display an active workout session with real-time timer,
current phase indicator, and visual feedback on progress through intervals.

#### Scenario: Workout session page shows current phase

- **WHEN** a user is in an active workout session
- **THEN** the current phase (warmup, jog, walk, cooldown) is prominently
  displayed
- **THEN** the activity description is shown (e.g., "Jogging" or "Walking")

#### Scenario: Workout session displays countdown timer

- **WHEN** a user is in an active workout session
- **THEN** a large, easy-to-read countdown timer is displayed
- **THEN** the timer updates in real-time (updates every second)
- **THEN** remaining time in minutes:seconds format is shown

#### Scenario: Workout session shows interval progress

- **WHEN** a user is in an active workout session
- **THEN** a progress indicator shows which interval the user is on
- **THEN** visual representation (e.g., "Interval 3 of 8") is displayed

#### Scenario: Workout session provides pause and resume controls

- **WHEN** a user is in an active workout session
- **THEN** pause/resume buttons are accessible
- **THEN** clicking pause stops the timer and displays "Paused"
- **THEN** clicking resume continues from the paused time

#### Scenario: Workout session provides quit button

- **WHEN** a user is in an active workout session
- **THEN** a "Quit" button is displayed
- **THEN** clicking quit shows a confirmation dialog
- **THEN** confirming quit ends the session and returns to dashboard

#### Scenario: Workout completion shows success screen

- **WHEN** a user completes all intervals of a workout
- **THEN** a success screen is displayed with congratulatory message
- **THEN** an option to "Back to Dashboard" is provided
- **THEN** an option to "View History" is provided

### Requirement: Manual Workout Completion Dialog

The system SHALL display a confirmation dialog when users manually mark a
workout complete, allowing them to confirm the action and optionally specify
the completion date.

#### Scenario: Manual completion confirmation dialog appears

- **WHEN** a user clicks "Mark Complete" on the dashboard
- **THEN** a modal dialog appears with title "Mark Workout Complete?"
- **THEN** the dialog shows the current week and workout number
- **THEN** a confirmation message explains the action
- **THEN** "Cancel" and "Mark Complete" buttons are provided

#### Scenario: User can set completion date for past workouts

- **WHEN** a user accesses workout history and clicks "Mark Complete" on a past
  workout
- **THEN** a date picker is displayed defaulting to today's date
- **THEN** the user can select any past date up to the current date
- **WHEN** the user confirms, the workout is marked with the selected date
- **THEN** the dialog closes and the history is updated

#### Scenario: Manually completed workout shows in history with label

- **WHEN** a user manually completes a workout
- **THEN** the workout appears in history with date and week/number
- **THEN** a "Manual" badge or label indicates it was manually completed (not
  timer-tracked)

### Requirement: Mobile-First Responsive Design

The system SHALL use mobile-first responsive design ensuring all UI is
accessible and readable on small screens (320px+) with proper touch targets and
landscape orientation support.

#### Scenario: Timer and controls are touch-friendly on mobile

- **WHEN** a user views the workout session on a 360px wide mobile phone
- **THEN** all buttons have minimum 44px touch target size
- **THEN** the timer is large enough to read without zooming

#### Scenario: Landscape orientation is supported

- **WHEN** a user rotates their phone to landscape during a workout
- **THEN** the UI adapts to landscape layout
- **THEN** the timer and controls remain accessible and readable

#### Scenario: Dashboard is responsive on all screen sizes

- **WHEN** a user views the dashboard on mobile, tablet, or desktop
- **THEN** layout adjusts appropriately for each screen size
- **THEN** all interactive elements are accessible on all screen sizes

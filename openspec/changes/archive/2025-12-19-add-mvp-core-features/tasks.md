# Implementation Tasks

## 1. Database Schema & Setup

- [x] 1.1 Create User table (id, email, password_hash, created_at, updated_at)
- [x] 1.2 Create Workout table (id, week, number, intervals_json, duration)
- [x] 1.3 Create UserProgress table (id, user_id, current_week, current_workout,
      last_completed_at)
- [x] 1.4 Create WorkoutSession table with columns:
  - id, user_id, workout_id, started_at, completed_at, status
  - type (enum: 'timer_based' or 'manual_completion')
  - elapsed_seconds (null for manual completions)
- [x] 1.4b Create ProgressAdjustment table for tracking progress changes:
  - id, user_id, adjustment_type (enum: 'repeat_week', 'go_back_week', 'jump_to')
  - from_week, from_workout, to_week, to_workout
  - timestamp, reason (optional user-provided reason)
- [x] 1.5 Set up database migrations or SQL initialization scripts
- [x] 1.6 Add database connection configuration to environment variables

## 2. Authentication Backend (API Routes)

- [x] 2.1 Create POST `/api/auth/signup` endpoint
  - Validates email and password
  - Hashes password with bcrypt
  - Creates user record
  - Returns session token/sets session cookie
- [x] 2.2 Create POST `/api/auth/login` endpoint
  - Validates email and password against stored hash
  - Creates session on success
  - Returns error on invalid credentials
- [x] 2.3 Create POST `/api/auth/logout` endpoint
  - Clears user session
  - Returns success response
- [x] 2.4 Create GET `/api/auth/me` endpoint
  - Returns current user data if authenticated
  - Returns 401 if not authenticated
- [x] 2.5 Create session middleware for route protection
  - Validates session token/cookie on requests
  - Attaches user context to request
  - Returns 401 for protected routes without auth

## 3. Authentication Frontend (UI)

- [x] 3.1 Create Login page (`/login`) with form
  - Email input field
  - Password input field
  - Submit button
  - Error message display
  - Link to signup page
- [x] 3.2 Create Signup page (`/signup`) with form
  - Email input field
  - Password input field
  - Password confirmation field
  - Submit button
  - Error message display
  - Link to login page
- [x] 3.3 Create public landing page (`/`) for unauthenticated users
  - Welcome section
  - Program description
  - Login and signup buttons
- [x] 3.4 Create protected route wrapper component
  - Redirects unauthenticated users to login
  - Allows access for authenticated users
- [x] 3.5 Implement form validation on client side
  - Email format validation
  - Password length validation
  - Password match validation on signup

## 4. Program Structure & Seed Data

- [x] 4.1 Define 9-week Couch to 5K interval structure in code/database
  - Week 1-2: 60s jog / 90s walk (Week 2 uses 90s jog / 2 min walk)
  - Week 3-4: Increasing jog durations (90s → 5 min) with walk recovery
  - Week 5-6: Longer intervals (5 min → 10 min jogs) with walks, then 20-25
    min continuous
  - Week 7-9: Continuous jog progression (25 min → 28 min → 30 min)
- [x] 4.2 Create seed/migration script to populate Workout table
  - Insert all 27 workout records (9 weeks × 3 workouts)
  - Follow official Couch to 5K spec (see design.md for detailed intervals)
  - Include interval arrays and total durations
- [x] 4.3 Create helper function to format workout intervals for display
  - Parse interval JSON and display human-readable description
  - Handle special cases (repeat cycles, continuous jog)

## 5. Workout Tracking Backend (API Routes)

- [x] 5.1 Create POST `/api/workouts/start` endpoint
  - Creates new WorkoutSession record
  - Returns session ID and initial timer state
  - Requires authentication
- [x] 5.1b Create POST `/api/workouts/mark-complete` endpoint
  - Accepts optional completion_date parameter
  - Creates WorkoutSession with type "manual_completion"
  - Advances user progress to next workout
  - Returns success response with updated progress
- [x] 5.2 Create POST `/api/workouts/:sessionId/pause` endpoint
  - Pauses active session
  - Records current elapsed time
- [x] 5.3 Create POST `/api/workouts/:sessionId/resume` endpoint
  - Resumes paused session
  - Continues from paused time
- [x] 5.4 Create POST `/api/workouts/:sessionId/complete` endpoint
  - Marks session as completed
  - Updates user progress to next workout
  - Advance week if all 3 workouts completed
- [x] 5.5 Create POST `/api/workouts/:sessionId/quit` endpoint
  - Marks session as abandoned
  - Does not advance user progress
- [x] 5.6 Create GET `/api/user/progress` endpoint
  - Returns current user progress (week, workout)
  - Returns next workout details
- [x] 5.7 Create GET `/api/user/history` endpoint
  - Returns list of completed workouts with dates
  - Limit to last 10 for MVP
- [x] 5.8 Create POST `/api/user/progress/repeat-week` endpoint
  - Resets current progress to Workout 1 of current week
  - Records progress adjustment
  - Returns updated progress
- [x] 5.9 Create POST `/api/user/progress/go-back-week` endpoint
  - Moves progress back one week (Workout 1 of previous week)
  - Validates not at Week 1
  - Records progress adjustment
  - Returns updated progress
- [x] 5.10 Create POST `/api/user/progress/jump-to` endpoint
  - Accepts week and workout_number parameters
  - Validates parameters (week 1-9, workout 1-3)
  - Updates progress to specified week/workout
  - Records progress adjustment
  - Returns updated progress
- [x] 5.11 Create GET `/api/user/progress-log` endpoint
  - Returns list of progress adjustments (repeat, back, jump)
  - Includes timestamp and adjustment type
  - Excludes workout completions

## 6. Workout Timing & Audio Hooks

- [x] 6.1 Create `useWorkoutSession` custom hook
  - Manages active session state
  - Tracks elapsed time and current interval
  - Handles pause/resume logic
- [x] 6.2 Create `useAudioCues` custom hook
  - Triggers audio cues on interval transitions
  - Supports phase announcements (warmup, jog, walk, cooldown)
- [x] 6.3 Create audio utility functions
  - Text-to-speech synthesis for cue announcements
  - Optional tone markers (beep/chime)
  - Volume control
- [x] 6.4 Create interval calculator utility
  - Given elapsed time, returns current interval and phase
  - Handles warmup + main intervals + cooldown

## 7. Dashboard & Workout Session UI

- [x] 7.1 Create Dashboard page (`/dashboard`)
  - Displays current week and workout number
  - Shows current workout description
  - Displays "Start Workout" and "Mark Complete" buttons
  - Shows recent workout history (last 5)
  - Shows completion type (manual vs timer-tracked)
  - Includes user name and logout button
- [x] 7.1b Create Manual Completion Dialog component
  - Modal confirmation dialog for marking workout complete
  - Shows week/workout number
  - Optional date picker for past workouts (via history page)
  - Cancel and Confirm buttons
- [x] 7.2 Create Workout Session page (`/workout/active`)
  - Large countdown timer (MM:SS format)
  - Current phase indicator (warmup/jog/walk/cooldown)
  - Activity description (e.g., "Jogging")
  - Interval progress (e.g., "Interval 3 of 8")
  - Pause/Resume buttons
  - Quit button with confirmation
- [x] 7.3 Create Workout Completion screen
  - Congratulatory message
  - "Back to Dashboard" button
  - "View History" button
- [x] 7.4 Create Workout History page (`/history`)
  - List of completed workouts with dates, durations, weeks
  - Current progress summary
- [x] 7.5 Create Progress Settings page (`/settings/progress`)
  - Display current week and workout
  - "Repeat Current Week" button
  - "Go Back One Week" button (disabled if at Week 1)
  - "Jump to Week..." dropdown with week/workout selection
  - Confirmation dialogs for each action
  - Progress adjustment log showing past adjustments
- [x] 7.6 Add navigation menu/hamburger to dashboard and pages
  - Link to "Progress Settings"
  - Link to "Workout History"
  - Link to "Logout"

## 8. Mobile & Responsive Design

- [x] 8.1 Ensure all pages are mobile-first responsive
  - Test on 320px, 360px, 768px, 1024px, 1440px widths
  - Verify touch targets are 44px+ minimum
- [x] 8.2 Test landscape orientation support
  - Workout session timer readable in landscape
  - Dashboard responsive in landscape
- [x] 8.3 Optimize fonts and spacing for mobile reading
  - Large timer text (minimum 48px for workout page)
  - Appropriate spacing and padding for touch

## 9. Testing & Validation

- [x] 9.1 Write unit tests for authentication logic
  - Password hashing and validation
  - Session creation and validation
- [x] 9.2 Write unit tests for workout interval calculation
  - Correct interval indexing at various elapsed times
  - Warmup + main + cooldown sequencing
- [x] 9.3 Write integration tests for auth flow
  - Signup → login → dashboard redirect
  - Logout → redirect to login
- [x] 9.4 Write component tests for UI pages
  - Login/Signup form submission
  - Dashboard display of current progress
  - Workout timer updates in real-time
- [x] 9.5 Manual testing checklist
  - Complete signup with new email
  - Login with registered credentials
  - Start and complete a full workout
  - Pause and resume during workout
  - View history and progress
  - Test mobile on actual phone device

## 10. Finalization & Documentation

- [x] 10.1 Verify all API endpoints work end-to-end
- [x] 10.2 Test Docker build and container execution
- [x] 10.3 Verify database initialization in Docker container
- [x] 10.4 Update README with setup and deployment instructions
- [x] 10.5 Update `.env.example` with all required environment variables
- [x] 10.6 Run full linting and type check suite
- [x] 10.7 Validate test coverage meets 70% threshold

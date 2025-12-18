# Manual Testing Checklist

This checklist covers the manual testing requirements for the Couch to 5K MVP as outlined in task 9.5 of the implementation plan.

## Prerequisites

- [x] Application is running locally (`npm run dev`)
- [x] Database is initialized with workout data
- [x] Browser DevTools are open for debugging

## 1. User Authentication

### Signup Flow

- [x] Navigate to `/signup`
- [x] Complete signup with new email (e.g., `testuser@example.com`)
  - [x] Email validation works (rejects invalid formats)
  - [x] Password validation works (minimum 8 characters)
  - [x] Password confirmation validation works
  - [x] Successful signup redirects to dashboard
  - [x] User progress initialized to Week 1, Workout 1

### Login Flow

- [x] Navigate to `/login`
- [x] Login with registered credentials
  - [x] Correct credentials redirect to dashboard
  - [x] Incorrect password shows error message
  - [x] Non-existent email shows error message
  - [x] Session persists on page refresh

### Logout Flow

- [x] Click logout button from dashboard
- [x] Redirects to landing page
- [x] Session is cleared (accessing `/dashboard` redirects to login)

## 2. Dashboard & Progress Display

### Initial State

- [x] Dashboard displays "Week 1, Workout 1"
- [x] Current workout description is visible
- [x] "Start Workout" button is present
- [x] "Mark Complete" button is present
- [x] Recent workout history is empty or shows previous completions

### After Completing Workouts

- [x] Complete a workout (via timer or manual)
- [x] Dashboard updates to next workout number
- [x] After 3 workouts, week increments
- [x] Recent history shows completed workouts with dates

## 3. Workout Session (Timer-Based)

### Starting a Workout

- [x] Click "Start Workout" from dashboard
- [x] Redirects to `/workout/active`
- [x] Timer starts automatically
- [x] Shows correct week and workout number

### During Workout

- [x] Timer counts down (MM:SS format)
- [x] Warmup phase displays "Warm Up - Brisk Walk"
- [x] Transitions to jog intervals correctly
- [x] Transitions to walk intervals correctly
- [ ] Audio cues announce phase changes
- [x] Interval counter shows progress (e.g., "Interval 3 of 8")

### Pause and Resume

- [x] Click "Pause" button
  - [x] Timer stops
  - [x] Pause button changes to "Resume"
- [x] Click "Resume" button
  - [x] Timer continues from paused time
  - [x] Workout phases remain accurate

### Completing Workout

- [ ] Complete full workout (or fast-forward timer)
- [ ] Automatically redirects to completion screen
- [ ] Completion screen shows congratulatory message
- [ ] "Back to Dashboard" button works
- [ ] Progress advances to next workout

### Quitting Workout

- [x] Start a workout
- [x] Click "Quit" button
- [x] Confirmation dialog appears
- [x] Cancel keeps workout running
- [x] Confirm quit returns to dashboard
- [x] Progress is NOT updated

## 4. Manual Workout Completion

- [x] From dashboard, click "Mark Complete"
- [x] Confirmation dialog appears
- [x] Shows correct week/workout number
- [x] Confirm advances progress
- [x] Workout appears in history as "manual completion"
- [x] Cancel returns to dashboard without changes

## 5. Workout History

- [x] Navigate to `/history`
- [x] Shows list of completed workouts
- [x] Each entry shows:
  - [x] Week and workout number
  - [x] Completion date
  - [x] Duration (for timer-based) or "Manual" label
- [x] Shows current progress summary
- [x] Displays at least 10 most recent workouts

## 6. Progress Management

### Access Settings

- [x] Navigate to `/settings/progress` (via menu or direct link)
- [x] Displays current week and workout number

### Repeat Current Week

- [x] Click "Repeat Current Week" button
- [x] Confirmation dialog appears
- [x] Confirm resets to Workout 1 of current week
- [x] Progress adjustment logged in history

### Go Back One Week

- [x] Click "Go Back One Week" button
- [x] Confirmation dialog appears
- [x] Confirm moves to Workout 1 of previous week
- [x] Button disabled when at Week 1
- [x] Progress adjustment logged in history

### Jump to Week

- [x] Select a week/workout from dropdown
- [x] Click "Jump to Week" button
- [x] Confirmation dialog appears
- [x] Confirm updates progress to selected week/workout
- [x] Progress adjustment logged in history

### Progress Adjustment Log

- [x] View shows all progress adjustments
- [x] Each entry shows:
  - [x] Adjustment type (repeat/back/jump)
  - [x] From week/workout
  - [x] To week/workout
  - [x] Timestamp

## 7. Mobile Responsiveness

### Test on Various Widths

- [x] 320px (small phone)
  - [x] All text is readable
  - [x] Buttons are at least 44px touch targets
  - [x] No horizontal scrolling
- [x] 360px (medium phone)
  - [x] Layout adapts appropriately
- [x] 768px (tablet)
  - [x] Responsive layout works
- [x] 1024px (desktop)
  - [x] Proper spacing and layout

### Landscape Orientation

- [x] Rotate to landscape on mobile
- [x] Workout timer is readable
- [x] Dashboard is functional
- [x] All controls are accessible

### Touch Interactions

- [x] Buttons respond to touch
- [x] Touch targets are adequate size
- [x] No accidental touches on adjacent elements

## 8. Navigation

### Menu Accessibility

- [x] Navigation menu accessible from all pages
- [ ] Links to:
  - [ ] Dashboard
  - [ ] Workout History
  - [ ] Progress Settings
  - [ ] Logout

### Direct URL Access

- [ ] Protected routes redirect to login when not authenticated
- [ ] `/dashboard` accessible when logged in
- [ ] `/workout/active` requires active session
- [ ] Public routes (`/`, `/login`, `/signup`) accessible without auth

## 9. Edge Cases & Error Handling

### Network Errors

- [ ] Simulate offline mode during login
- [ ] Error message displays appropriately
- [ ] No application crash

### Session Expiration

- [ ] Wait for session to expire (or manually delete session cookie)
- [ ] Attempting protected action redirects to login
- [ ] Appropriate error message shown

### Browser Compatibility

- [ ] Test on Chrome/Chromium
- [ ] Test on Firefox
- [ ] Test on Safari (if available)
- [ ] Test on mobile browsers

### Data Validation

- [ ] Try to submit forms with empty fields
- [ ] Try invalid email formats
- [ ] Try passwords shorter than 8 characters
- [ ] Error messages are clear and helpful

## 10. Performance & UX

### Load Times

- [ ] Initial page load is under 3 seconds
- [ ] Navigation between pages is smooth
- [ ] No noticeable lag in timer updates

### Visual Feedback

- [ ] Loading states shown during API calls
- [ ] Success messages for completed actions
- [ ] Error states are clear and actionable
- [ ] Transitions are smooth

## Test Results

Date: \***\*\_\_\*\***
Tester: \***\*\_\_\*\***

### Summary

- Total Tests: 100+
- Passed: \_\_\_\_
- Failed: \_\_\_\_
- Blocked: \_\_\_\_

### Critical Issues Found

1.
2.
3.

### Minor Issues Found

1.
2.
3.

### Notes

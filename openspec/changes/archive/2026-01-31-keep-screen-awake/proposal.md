# Proposal: Keep Screen Awake

## Why

During active workout sessions, the device screen turns off after the system's
idle timeout, causing the JavaScript timer to pause or become unreliable. Users
lose accurate time tracking and miss interval transition cues when running with
the phone in their pocket or armband. The timer should remain active and the
screen should stay awake throughout the workout.

## What Changes

- Add Screen Wake Lock API integration to prevent the screen from sleeping
  during active workouts
- Request wake lock when a workout starts and release it when the workout
  completes, is paused, or is quit
- Handle wake lock re-acquisition after visibility changes (e.g., user switches
  tabs then returns)
- Provide graceful degradation for browsers that don't support the Wake Lock
  API

## Capabilities

### New Capabilities

- `screen-wake-lock`: Manages screen wake lock during active workout sessions
  to prevent the device from sleeping

### Modified Capabilities

None - this is additive functionality that enhances the existing workout-
tracking behavior without changing its requirements.

## Impact

- **Code**: `app/workout/active/page.tsx` - add wake lock acquisition/release
  logic tied to workout session lifecycle
- **APIs**: Uses the browser's Screen Wake Lock API (`navigator.wakeLock`) - no
  server-side changes
- **Browser Support**: Wake Lock API is supported in modern Chrome, Edge,
  Safari (iOS 16.4+), and Samsung Internet. Firefox does not support it.
  Unsupported browsers will function as before (no wake lock, timer may pause
  when screen sleeps)
- **PWA Enhancement**: Particularly valuable for the installed PWA experience
  where users expect app-like behavior

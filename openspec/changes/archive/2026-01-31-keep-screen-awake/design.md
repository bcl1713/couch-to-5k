# Design: Keep Screen Awake

## Context

The Couch to 5K app has an active workout page (`app/workout/active/page.tsx`)
that runs a JavaScript timer using `setInterval`. When the device screen turns
off due to inactivity, the browser throttles or pauses JavaScript execution,
causing the timer to drift or stop entirely. Users running with the phone in
a pocket or armband miss interval cues and lose accurate time tracking.

The Screen Wake Lock API is a modern browser feature that prevents the screen
from dimming or locking while the wake lock is held. This is the standard
solution for workout, video, and presentation apps.

## Goals / Non-Goals

**Goals:**

- Prevent screen from sleeping during active (non-paused) workout sessions
- Automatically release wake lock when workout is paused, quit, or completed
- Re-acquire wake lock when workout resumes or user returns to tab
- Fail gracefully on unsupported browsers with no errors or degraded UX

**Non-Goals:**

- Keeping the timer running when the app is in the background (wake lock only
  prevents screen sleep, not background execution)
- Supporting browsers without Wake Lock API (Firefox) - they function as before
- Adding user preferences to disable wake lock

## Decisions

### Decision 1: Use Screen Wake Lock API directly (no library)

The Wake Lock API is simple enough that a wrapper library adds no value:

```typescript
const wakeLock = await navigator.wakeLock.request("screen");
wakeLock.release();
```

**Alternatives considered:**

- `nosleep.js` library - uses a hidden video hack for older browsers. Not
  needed since Wake Lock API has good support and we accept graceful
  degradation on unsupported browsers.

### Decision 2: Manage wake lock in a custom hook

Create a `useWakeLock` hook that encapsulates:

- Feature detection (`"wakeLock" in navigator`)
- Requesting and releasing the lock
- Re-acquiring on visibility change (when user returns to tab)
- Cleanup on unmount

This keeps the workout page clean and makes the logic testable/reusable.

**Alternatives considered:**

- Inline in `page.tsx` - works but clutters the component
- Global singleton - unnecessary complexity for single-page usage

### Decision 3: Tie wake lock lifecycle to pause/resume state

- Request wake lock when: session starts AND not paused
- Release wake lock when: paused, quit, or completed
- Re-request on: resume or visibility change (if not paused)

This matches user expectations - a paused workout shouldn't keep the screen on.

### Decision 4: Handle visibility change for tab switching

When the user switches tabs and returns, the wake lock is automatically
released by the browser. The hook listens for `visibilitychange` events and
re-requests the lock if the workout is active.

## Risks / Trade-offs

**[Risk] iOS Safari support requires iOS 16.4+** → Users on older iOS versions
will not get wake lock. The app continues to work; they just need to keep the
screen on manually or increase auto-lock timeout. No mitigation needed beyond
documentation.

**[Risk] Wake lock fails silently** → If `request()` throws (e.g., low battery
mode on some devices), we catch the error and log it. The workout continues
without wake lock rather than crashing.

**[Trade-off] No user toggle** → We always request wake lock during workouts.
This is the expected behavior for a workout app and avoids settings bloat.
Could add later if users request it.

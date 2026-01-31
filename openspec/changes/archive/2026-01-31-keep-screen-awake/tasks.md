# Tasks: Keep Screen Awake

## 1. Create Wake Lock Hook

- [x] 1.1 Create `hooks/useWakeLock.ts` with TypeScript types for Wake Lock API
- [x] 1.2 Implement feature detection (`"wakeLock" in navigator`)
- [x] 1.3 Implement `requestWakeLock()` function that requests screen wake lock
- [x] 1.4 Implement `releaseWakeLock()` function that releases the lock
- [x] 1.5 Add visibility change listener to re-acquire lock when tab becomes
      visible
- [x] 1.6 Add cleanup on unmount to release lock and remove listeners

## 2. Integrate with Workout Page

- [x] 2.1 Import and use `useWakeLock` hook in `app/workout/active/page.tsx`
- [x] 2.2 Request wake lock when session starts (non-null session, not paused)
- [x] 2.3 Release wake lock when `isPaused` becomes true
- [x] 2.4 Re-acquire wake lock when `isPaused` becomes false (resume)
- [x] 2.5 Ensure wake lock is released on workout complete or quit

## 3. Testing

- [x] 3.1 Write unit tests for `useWakeLock` hook with mocked Wake Lock API
- [x] 3.2 Test graceful degradation when Wake Lock API is unavailable
- [x] 3.3 Test visibility change re-acquisition behavior
- [x] 3.4 Manual test on mobile device to verify screen stays awake during
      workout

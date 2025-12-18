# Change: Add MVP Core Features

## Why

The project currently has only foundational infrastructure (Next.js, TypeScript,
Docker) established. To deliver a working application, we need to implement the
three core pillars of the MVP: user authentication to track individual progress,
a landing page to welcome new and returning users, and workout tracking to guide
users through the Couch to 5K program with real-time coaching and progression.

## What Changes

- **User Authentication:** Email-based login/signup without email verification,
  secure session management
- **Landing Page:** Entry point for new and returning users, displays current
  week/workout status
- **Workout Tracking:** Full 9-week Couch to 5K program structure with workout
  sessions, interval sequencing, and user progress tracking
- **Workout Session UI:** Real-time timer with visual feedback, audible cues for
  transitions, and activity phase display

## Impact

- **Affected capabilities:**
  - `user-auth` (NEW) - Email-based authentication
  - `workout-tracking` (NEW) - 9-week program structure and progress management
  - `dashboard` (NEW) - Landing page and workout session UI

- **Affected code:**
  - Database schema for users, workouts, sessions
  - API routes for auth and workout data
  - Frontend pages for landing, auth, and workout session
  - Custom hooks for timer logic and workout state

- **Breaking changes:** None - this is new functionality

## Timeline & Approach

1. **Phase 1:** Implement user authentication (schema, API, UI)
2. **Phase 2:** Implement workout program structure and tracking
3. **Phase 3:** Build landing/dashboard page and workout session UI
4. **Phase 4:** Integration testing and refinement

## Out of Scope (Future)

- Email notifications or reminders
- Advanced analytics or progress charts
- Social features (sharing, leaderboards)
- Mobile app (web-only for MVP)
- Workout customization or modifications

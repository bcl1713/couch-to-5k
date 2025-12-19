# Design Document: MVP Core Features

## Context

This change implements the three essential features needed for a functioning
Couch to 5K application: user authentication, workout program structure and
tracking, and the user interface for interacting with workouts. The change spans
database schema, API backend (multiple routes), frontend pages, custom hooks,
and utility functions.

The implementation builds on the established project foundations (Next.js,
TypeScript, Tailwind CSS, shadcn/ui) and follows the architecture patterns
defined in `openspec/project.md`.

## Goals

- Deliver a fully functional MVP with user signup, login, and complete workout
  tracking
- Enable users to progress through the 9-week Couch to 5K program with
  real-time coaching
- Provide a smooth, mobile-optimized user experience
- Maintain code quality standards (component size <300 lines, TypeScript strict
  mode, 70%+ test coverage)

## Non-Goals

- Email verification or confirmation flows
- Advanced analytics, reporting, or visualizations
- User account settings or profile customization
- Offline functionality or service workers
- Social features or integration with fitness platforms

## Architecture Decisions

### 1. Authentication Strategy: Session-Based with HTTP-Only Cookies

**Decision:** Use session-based authentication with HTTP-only cookies instead of
JWT tokens.

**Rationale:**

- HTTP-only cookies prevent XSS attacks from accessing auth tokens
- Sessions are simpler to manage for a single-server Docker deployment
- No need for token refresh logic or client-side storage
- Naturally supports logout by server-side session invalidation

**Implementation:**

- Store sessions in database (session table with user_id, token, expires_at)
- Set session cookie on signup/login with `httpOnly: true, secure: true`
- Validate session token on protected routes via middleware
- Clear session on logout

### 2. Password Storage: Bcrypt with Cost of 10

**Decision:** Use bcrypt for password hashing with a minimum cost factor of 10.

**Rationale:**

- bcrypt is well-established for secure password storage
- Cost factor of 10 provides reasonable security-performance trade-off
- Built-in salt generation prevents rainbow table attacks
- Adaptive hashing allows cost increase in future if needed

**Implementation:**

- Hash password before storing in User.password_hash
- Compare plaintext input against stored hash during login
- Never log or expose passwords in error messages

### 3. Program Structure: Static Database Records

**Decision:** Pre-define all 27 workouts (9 weeks × 3 per week) as database
records with interval arrays.

**Rationale:**

- Couch to 5K is a fixed, standard program (no customization in MVP)
- Database records allow efficient queries and user progress tracking
- JSON array for intervals supports flexible representation
- Simplifies migration and deployment

**Implementation:**

- Create `workouts` table with columns: id, week, number, intervals_json,
  duration_seconds
- Seed database with 27 records during initialization
- Query by (week, number) to get specific workout details

**Example interval structure (Week 1):**

```json
{
  "warmup": 300,
  "intervals": [
    { "type": "jog", "seconds": 60 },
    { "type": "walk", "seconds": 90 }
  ],
  "repeat": 8,
  "total_duration": 1500
}
```

**Example interval structure (Week 5, Workout 2):**

```json
{
  "warmup": 300,
  "intervals": [
    { "type": "jog", "seconds": 480 },
    { "type": "walk", "seconds": 300 },
    { "type": "jog", "seconds": 480 }
  ],
  "total_duration": 1560
}
```

### 4. Workout Session State: Elapsed Time Tracking

**Decision:** Track elapsed time on the server and validate client-side timer
against server state.

**Rationale:**

- Server timestamp prevents client manipulation
- Clients (JavaScript timers) can drift; server is source of truth
- Pause/resume requires server-side state to prevent time manipulation

**Implementation:**

- On session start, record `started_at` timestamp
- On pause, record `paused_at` and `paused_elapsed_seconds`
- On resume, record `resumed_at` and add to accumulated elapsed time
- Client maintains local timer for display, validates on sync

### 5. Audio Cues: Web Audio API with Text-to-Speech

**Decision:** Use Web Speech API for voice announcements and optional HTML5
Audio for tone markers.

**Rationale:**

- Web Speech API provides free text-to-speech (no external service needed)
- HTML5 Audio allows simple beep/tone for transitions
- Single Docker container requires no external audio service
- Graceful degradation if audio not available

**Implementation:**

- Create `useAudioCues` hook that triggers cue announcements
- Use `SpeechSynthesis` API for voice announcements
- Optional prerecorded beep (base64 encoded in JavaScript)
- User can test audio before starting workout

### 6. Custom Hooks for State & Logic Separation

**Decision:** Encapsulate workout session logic and audio in custom hooks.

**Rationale:**

- Follows project architecture pattern (logic in hooks, UI in components)
- Makes testing easier (hooks can be tested independently)
- Allows multiple components to use same logic
- Keeps components under 300 line limit

**Implementation:**

- `useWorkoutSession`: Manages session state
- `useAudioCues`: Manages audio playback for cues
- `useTimer`: Generic timer hook with pause/resume support
- Each hook handles specific concern

### 7. API Route Organization

**Decision:** Organize routes by feature under `/api` (e.g.,
`/api/auth/login`, `/api/workouts/start`).

**Rationale:**

- Clear separation of concerns
- Easy to locate and test related endpoints
- Supports middleware (e.g., auth middleware for `/api/workouts/*`)

**Implementation:**

- `/api/auth/*` - signup, login, logout, me endpoints
- `/api/workouts/*` - start, pause, resume, complete, quit, history
- `/api/user/*` - progress, settings (future)

### 8. Database: SQLite for MVP, PostgreSQL-Ready

**Decision:** Use SQLite embedded in the Docker image for MVP, with option to
upgrade to PostgreSQL.

**Rationale:**

- SQLite requires no separate database service
- Single Docker container meets self-hosting requirement
- Easy to test locally
- Can migrate to PostgreSQL later if needed
- Environment variable allows database URL configuration

**Implementation:**

- Use `better-sqlite3` or `sqlite` for Node.js
- Create schema on startup if database doesn't exist
- Store database file in persistent volume (Docker)

### 9. Validation: Client-Side + Server-Side

**Decision:** Validate inputs on both client (UX) and server (security).

**Rationale:**

- Client validation provides immediate feedback
- Server validation prevents bypassing checks via API
- Defense in depth against malicious input

**Implementation:**

- Client: Form validation in React components
- Server: Validate email format, password length, required fields

### 10. Error Handling & User Feedback

**Decision:** Return clear error messages from API, display user-friendly
messages in UI.

**Rationale:**

- Helps users understand what went wrong
- Prevents exposing internal errors
- Improves user experience

**Implementation:**

- API returns error object with code and message
- UI displays user-friendly message
- Avoid exposing database or system errors to user

## Risks & Mitigations

| Risk                    | Probability | Impact          | Mitigation                 |
| ----------------------- | ----------- | --------------- | -------------------------- |
| SQLite locks            | Medium      | Sessions fail   | Migrate to PostgreSQL      |
| Audio API issues        | Low         | Cues don't play | Fallback visual indicators |
| Clients manipulate data | Low         | Data integrity  | Validate server-side       |
| Password hashing spike  | Low         | Login slow      | Rate limiting on auth      |
| History queries slow    | Low         | Dashboard slow  | Paginate; limit to 10      |

## Migration Plan

This is a new feature, no migration needed from previous version.

### Deployment Steps

1. Build Docker image with updated code
2. Initialize database on container startup
3. Seed 27 workout records
4. Start application
5. Verify all API endpoints are functional
6. Test signup/login/logout flow
7. Test complete workout from start to finish

## Open Questions

1. Should we implement email verification later, or keep it permanently
   optional?
2. Should users be able to repeat earlier workouts for practice, or only
   progress forward?
3. Should we collect any analytics or metrics on completed workouts?
4. What should the session timeout period be (currently 30 days)?

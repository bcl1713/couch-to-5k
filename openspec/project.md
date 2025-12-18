# Project Context

## Purpose

A self-contained, mobile-first web application that guides users through the
Couch to 5K running program with real-time workout coaching, audible cues, and
visual timers. Users authenticate via email (no confirmation required) and
receive personalized workout sessions with interval guidance (walk/run
transitions), warmup/cooldown phases, and voice notifications. The app is
containerized as a single Docker image for easy deployment and self-hosting.

**Primary Features:**

- Email-based authentication (no verification required)
- Real-time workout timer with visual countdown
- Audible cues for activity transitions (warmup → jog → walk → cooldown)
- Full 9-week Couch to 5K progression tracking
- Mobile-first responsive interface optimized for smartphone usage during runs

## Tech Stack

- **Frontend:** React with Next.js (full-stack framework, mobile-first)
- **Backend:** Node.js API routes (via Next.js)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS with shadcn/ui components
- **Authentication:** Email-based (no confirmation required)
- **Database:** PostgreSQL or SQLite (embedded in container)
- **UI Components:** shadcn/ui library
- **Audio:** Web Audio API for audible cues
- **Containerization:** Docker (single self-contained image)
- **Deployment:** Portainer-compatible Docker image for self-hosted
  deployment
- **Package Manager:** npm or pnpm
- **Build Tool:** Next.js built-in build system

## Project Conventions

### Code Style

- **Language:** TypeScript with strict mode enabled
- **Component Structure:** React functional components with hooks
- **Max Component Size:** 300 lines enforced by ESLint rules and CI/CD
  checks
- **SOLID Principles:** All components must follow Single Responsibility
  Principle
  - One component = one concern
  - Extract reusable logic into custom hooks and utility functions
  - Avoid prop drilling through multiple levels
- **Formatting:** Prettier (automatic on save)
- **Linting:** ESLint with TypeScript rules + custom rule for component
  size (300 line max)
- **Naming Conventions:**
  - Components: PascalCase (e.g., `WorkoutTimer`, `IntervalCue`)
  - Functions/hooks: camelCase (e.g., `useWorkoutSession`,
    `calculateElapsedTime`)
  - Constants: UPPER_SNAKE_CASE (e.g., `WARMUP_DURATION_SECONDS`)
  - Files: kebab-case for utilities (`audio-cues.ts`), PascalCase for
    components (`WorkoutDisplay.tsx`)
- **Imports:** Absolute imports using path aliases (`@/components`,
  `@/lib`, `@/types`)

### Architecture Patterns

- **Frontend Architecture:**
  - Page components in `pages/` or `app/` directory
  - Reusable UI components in `components/` using shadcn/ui patterns
  - Custom hooks in `hooks/` for workout logic (state, timers, audio)
  - Type definitions in `types/`
  - Utilities in `lib/`
- **State Management:** React Context API + custom hooks (no Redux)
- **Workout Logic:** Encapsulated in custom hooks (`useWorkoutSession`,
  `useIntervalTimer`)
- **Audio Handling:** Centralized audio service with cue types (start jog,
  start walk, etc.)
- **Mobile First:** CSS-in-JS with Tailwind breakpoints (mobile → tablet →
  desktop)
- **Separation of Concerns:**
  - UI components (pure, no business logic)
  - Custom hooks (workout logic, timers, state)
  - Services (audio playback, data persistence)
  - API routes (authentication, user workouts)

### Testing Strategy

- **Unit Tests:** Jest for hooks and utility functions
- **Component Tests:** React Testing Library for isolated component
  behavior
- **Integration Tests:** Mock API calls and test user workflows
- **Coverage Target:** 70%+ on business logic
- **Test File Location:** Co-located with source (`*.test.ts`,
  `*.test.tsx`)
- **Focus Areas:** Timer accuracy, cue sequencing, workout progression
  logic

### Git Workflow

- **Branching:** Feature branches from `main` (e.g., `feat/interval-timer`,
  `fix/audio-cues`)
- **Branch Naming:** `type/description` (feat, fix, refactor, docs, test,
  chore)
- **Commit Messages:** Conventional commits (feat:, fix:, docs:, test:,
  refactor:)
- **PR Requirements:** All changes via pull request with CI checks passing
- **CI Rules:** ESLint (including 300-line component size check),
  TypeScript strict mode, tests pass
- **Post-tool-use Hooks:** Claude Code hooks enforce code size limits
  after generation

## Domain Context

### Couch to 5K Program

The app implements the standard 9-week Couch to 5K progression:

- **Week 1-2:** Alternate 60-90s jogging with walking intervals over 20
  minutes
- **Week 3-4:** Gradual increase in jogging intervals (3-5 minutes)
- **Week 5-6:** Longer jogging intervals (5-10 minutes) with walking
  recovery
- **Week 7-9:** Continuous jogging progression (20 → 28 → 30 minutes)
- **Every workout includes:** 5-minute brisk warmup walk, main intervals,
  cooldown (implied)

### Workout Session Structure

Each workout has three phases with distinct audio cues:

1. **Warmup Phase:** "Start your brisk five-minute warmup walk" (5
   minutes)
2. **Main Intervals:** Alternating jog/walk phases with clear verbal cues
   ("Start jogging", "Start walking")
3. **Cooldown:** Implied walk phase to end

### Audio Cues

- Voice announcements for phase transitions
- Clear time remaining announcements
- Distinct audio markers (beeps/tones) for transitions
- Volume appropriate for outdoor use

### User Journey

1. Sign up with email (no confirmation)
2. Start at Week 1, Workout 1
3. Daily progress through 3 workouts per week
4. Automatic progression to next week after completing week
5. Real-time coaching during active workout session

## Important Constraints

### Deployment & Infrastructure

- **Docker:** Entire app must run as single Docker image
- **Self-hosted:** No external service dependencies for core functionality
- **Portainer-compatible:** Standard Docker image compatible with Portainer
  UI
- **Database:** Embedded (SQLite) or included PostgreSQL instance
- **Stateless/Scalable:** Should support running multiple instances behind
  load balancer if needed

### Mobile-First Requirements

- **Primary Device:** Smartphone (Chrome browser)
- **Screen Sizes:** Optimized for 320px+ width (mobile first)
- **Responsiveness:** Touch-friendly, large tap targets
- **Orientation:** Support both portrait and landscape
- **Performance:** Fast load times, minimal jank during timer updates

### Authentication & Security

- **No Email Verification:** Email acts as username
- **Password Storage:** Secure hashing (bcrypt or similar)
- **Session Management:** Secure cookie-based or JWT tokens
- **HTTPS:** Support HTTPS in production (Docker container)
- **Data Privacy:** Workout data must be user-specific and protected

### Code Quality Enforcement

- **Component Size Limit:** 300 lines maximum, enforced by ESLint + CI
- **SOLID Principles:** Code review focus on single responsibility
- **Post-tool-use Hooks:** Claude Code hooks verify component size after
  generation
- **Type Safety:** TypeScript strict mode enabled

### Browser Compatibility

- **Target:** Modern Chrome/Chromium on Android/iOS
- **Features Used:** Web Audio API, Web Storage API, Service Workers
  (optional for offline)
- **Fallbacks:** Graceful degradation if audio not available

## External Dependencies

- **None Required for Core Functionality** - Single Docker container should
  be self-contained
- **Optional Integrations:**
  - Analytics: Plausible or similar (privacy-focused)
  - Error tracking: Sentry (optional)
  - External APIs: None planned for MVP

## Development Notes

- Use shadcn/ui components as building blocks - customize via Tailwind
- Keep components small and focused (< 300 lines)
- Extract workout logic into custom hooks for reusability
- Use TypeScript for type safety in workout data structures
- Build Docker image locally and test with Portainer before deployment

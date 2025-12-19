# Development Guide

Guide for developing the Couch to 5K application locally.

## Setup

### Prerequisites

- Node.js 20 or higher
- npm 10+ or pnpm
- Git
- Docker (for containerized testing)

### Installation

```bash
git clone <repository-url>
cd couch-to-5k
npm install
```

## Development Workflow

### Starting the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)
with hot reload enabled.

### Code Quality Commands

Run these commands before committing:

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Type check the entire project
npm run type-check

# Format code with Prettier
npm run format

# Check if code matches Prettier format
npm run format:check
```

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm run start
```

## Project Conventions

### Component Guidelines

#### Maximum 300 Lines per Component

All React components must be under 300 lines to enforce single responsibility:

```typescript
// ✅ GOOD: Single concern component
export function WorkoutTimer({ totalSeconds }: Props) {
  const [elapsed, setElapsed] = useState(0);
  // logic here...
  return <div>Timer: {elapsed}s</div>;
}

// ❌ BAD: Multiple concerns in one component (over 300 lines)
export function WorkoutPage() {
  // Timer logic
  // Display logic
  // State management
  // API calls
  // ...too much!
}
```

#### Refactoring Strategy

1. Extract logic into custom hooks:

```typescript
// hooks/useWorkoutTimer.ts
export function useWorkoutTimer(totalSeconds: number) {
  const [elapsed, setElapsed] = useState(0);
  // timer logic...
  return { elapsed, isRunning, pause, resume };
}

// components/WorkoutTimer.tsx
export function WorkoutTimer({ totalSeconds }: Props) {
  const { elapsed } = useWorkoutTimer(totalSeconds);
  return <div>Timer: {elapsed}s</div>;
}
```

1. Extract utility functions:

```typescript
// lib/workout/calculations.ts
export function calculateProgress(current: number, total: number): number {
  return (current / total) * 100;
}
```

1. Use composition for complex UIs:

```typescript
// Instead of one large component, create smaller ones
<Workout>
  <WorkoutHeader />
  <WorkoutTimer />
  <WorkoutProgress />
  <WorkoutControls />
</Workout>
```

### TypeScript Strict Mode

All TypeScript files must comply with strict mode:

- No implicit `any` types
- All functions must have explicit return types
- No unused variables or parameters (prefix with `_` if intentional)

```typescript
// ✅ GOOD
interface User {
  id: string;
  email: string;
}

export function getUserById(id: string): User | null {
  // ...
}

// ❌ BAD
export function getUserById(id: any): any {
  // ...
}
```

### File Organization

```text
src/
├── components/
│   ├── WorkoutTimer.tsx          # Single component per file
│   ├── WorkoutProgress.tsx
│   └── index.ts                  # Export public components
├── hooks/
│   ├── useWorkoutSession.ts      # Custom hook
│   ├── useIntervalTimer.ts
│   └── index.ts
├── lib/
│   ├── workout/
│   │   ├── calculations.ts       # Workout math
│   │   ├── data.ts               # Workout data (C25K program)
│   │   └── index.ts
│   ├── auth/
│   │   ├── session.ts
│   │   └── index.ts
│   └── utils.ts                  # General utilities
├── types/
│   ├── index.ts                  # Global types
│   └── workout.ts                # Domain types
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   └── workouts/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css               # Tailwind styles
└── public/
    └── (static assets)
```

### Naming Conventions

- **Components:** PascalCase (`WorkoutTimer.tsx`)
- **Hooks:** camelCase with `use` prefix (`useWorkoutTimer.ts`)
- **Utilities:** camelCase (`calculateProgress.ts`)
- **Types:** PascalCase (`WorkoutInterval.ts`)
- **Constants:** UPPER_SNAKE_CASE (`WARMUP_DURATION_SECONDS`)
- **Files:** kebab-case for utilities (`workout-utils.ts`)

### Imports

Use absolute imports with path aliases:

```typescript
// ✅ GOOD
import { Button } from "@/components/Button";
import { useWorkoutTimer } from "@/hooks/useWorkoutTimer";
import { calculateProgress } from "@/lib/workout/calculations";
import { WorkoutInterval } from "@/types";

// ❌ BAD (relative imports)
import { Button } from "../../../components/Button";
import { useWorkoutTimer } from "../../hooks/useWorkoutTimer";
```

## Git Workflow

### Branch-Based Development

**IMPORTANT:** All changes must be developed on feature branches. Direct pushes
to `main` are not allowed.

### Branch Naming

Use descriptive branch names with type prefixes:

```bash
git checkout -b feat/workout-timer          # New feature
git checkout -b fix/audio-cue-volume        # Bug fix
git checkout -b refactor/hook-extraction    # Refactoring
git checkout -b docs/deployment-guide       # Documentation
```

### Commit Messages (Conventional Commits)

All commits MUST follow the conventional commits format. This is enforced by
commitlint.

**Format:** `<type>: <description>`

**Types:**

- `feat`: New feature (triggers MINOR version bump)
- `fix`: Bug fix (triggers PATCH version bump)
- `docs`: Documentation changes
- `style`: Code style/formatting (no functional changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

**Breaking Changes:** Add `!` after type or include `BREAKING CHANGE:` in
footer (triggers MAJOR version bump)

**Examples:**

```bash
# Feature (MINOR version bump: 0.1.0 → 0.2.0)
git commit -m "feat: add workout timer component"

# Bug fix (PATCH version bump: 0.2.0 → 0.2.1)
git commit -m "fix: correct interval duration calculation"

# Breaking change (MAJOR version bump: 0.2.1 → 1.0.0)
git commit -m "feat!: redesign authentication API"

# With breaking change footer
git commit -m "feat: redesign authentication API

BREAKING CHANGE: authentication endpoint moved from /auth to /api/auth"

# Non-versioned changes
git commit -m "docs: update development guide"
git commit -m "refactor: extract timer logic into hook"
```

### Creating a Pull Request

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feat/your-feature
   ```

2. Make changes and commit using conventional commits format

3. Push your branch:

   ```bash
   git push origin feat/your-feature
   ```

4. Create PR on GitHub using the PR template
5. Ensure automated checks pass:
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Tests (Jest)
   - Formatting (Prettier)
   - Automated code review (AI-powered)
6. Review feedback and address comments
7. Merge after all checks pass

### Automated Versioning and Releases

When your PR is merged to `main`:

1. **Semantic-release** automatically:
   - Analyzes commit messages since last release
   - Determines version bump (MAJOR.MINOR.PATCH)
   - Updates `package.json` version
   - Generates `CHANGELOG.md` entry
   - Creates git tag
   - Creates GitHub release

2. **Docker build** automatically:
   - Builds Docker image
   - Tags with version number (e.g., `bcl1713/couch-to-5k:0.2.0`)
   - Tags with `latest`
   - Pushes to Docker Hub

**Version Bump Rules:**

- `feat:` commits → MINOR bump (0.1.0 → 0.2.0)
- `fix:` commits → PATCH bump (0.2.0 → 0.2.1)
- `feat!:` or `BREAKING CHANGE:` → MAJOR bump (0.2.1 → 1.0.0)
- Other types → No version bump

## Debugging

### Using Chrome DevTools

1. Start dev server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000) in Chrome
3. Press F12 to open DevTools
4. Use Console, Network, React Profiler tabs

### Debugging TypeScript

ESLint and TypeScript will catch most errors:

```bash
npm run lint              # Find linting issues
npm run type-check       # Find type errors
npm run lint:fix         # Auto-fix linting issues
```

### Checking Component Size

Run ESLint to find components exceeding 300 lines:

```bash
npm run lint
# Look for "max-lines" errors
```

## Docker Development

### Building Locally

```bash
npm run docker:build
```

### Running Docker Container

```bash
npm run docker:run
```

App will be accessible at [http://localhost:3000](http://localhost:3000)

## Database Migrations

The application uses a versioned, file-based migration system for
SQLite, managed via `better-sqlite3`.

### Migration Structure

Migrations are stored in `db/migrations/` as SQL files.
Naming convention: `XXX_description.sql` (e.g.,
`001_initial_schema.sql`).

### Creating a New Migration

1. Create a new `.sql` file in `db/migrations/`.
2. Increment the number prefix.
3. Write your SQL statements (e.g., `ALTER TABLE`, `CREATE TABLE`).
4. The migration will be applied automatically the next time the
   application starts.

### How it Works

- The `_migrations` table in the database tracks applied migrations.
- On startup, `lib/migrations.ts` compares files in `db/migrations/`
  with the `_migrations` table.
- New migrations are applied in a single transaction.
- If a migration fails, the application will stop to prevent data
  corruption.

## Testing

Currently manual testing is primary approach. Future additions:

- Jest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests

## Performance Tips

- Use React DevTools Profiler to identify slow renders
- Check bundle size with `npm run build`
- Lazy load components with `dynamic()` for large features
- Use `useCallback` and `useMemo` sparingly (only when profiler shows
  improvement)

## Troubleshooting

### Hot reload not working

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### ESLint errors persist

```bash
# Clear ESLint cache
npm run lint -- --no-cache

# Or fix violations automatically
npm run lint:fix
```

### TypeScript strict mode issues

Most issues can be fixed by adding explicit type annotations:

```typescript
// Problem
const user = getUserById(id);

// Solution
const user: User | null = getUserById(id);
```

### Git hooks not running

```bash
# Reinstall Husky
npm run prepare
npx husky install
```

### Commit rejected by commitlint

If your commit is rejected, ensure it follows the conventional commits
format:

```bash
# ❌ BAD
git commit -m "added new feature"
git commit -m "Fixed bug"

# ✅ GOOD
git commit -m "feat: add workout interval summary"
git commit -m "fix: correct session cookie expiry"
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [ESLint Rules](https://eslint.org/docs/rules)
- [Conventional Commits](https://www.conventionalcommits.org)

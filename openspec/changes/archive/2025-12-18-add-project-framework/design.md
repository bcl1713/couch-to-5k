# Design: Project Framework and Development Tooling

## Context

This is the foundational setup for a production-ready Next.js application with
strict code quality standards. The project must run as a single self-contained
Docker image, enforce a 300-line component size limit via SOLID principles, and
maintain mobile-first responsive design. Development workflows must be automated
through linting, type checking, and Git hooks.

## Goals

- Establish enforced code quality standards (ESLint, TypeScript, Prettier)
- Implement component size limits (300 lines max) with ESLint rules
- Create reliable Docker containerization for self-hosted deployment
- Enable mobile-first component development patterns
- Automate code quality checks at commit/push stages
- Provide Claude Code post-tool-use hooks for real-time compliance

Non-Goals:

- Complex build optimization (defer until performance needs warrant)
- Advanced testing infrastructure (will be added incrementally)
- Monorepo setup (single package is sufficient for MVP)
- External CI/CD pipeline (focus on local development first)

## Decisions

### Decision: Next.js Full Stack Framework

**What:** Use Next.js (App Router) for full-stack development.

**Why:** Provides frontend and backend in single codebase, zero-config
TypeScript support, built-in API routes, and excellent mobile-first tooling.
Reduces deployment complexity to single Node.js container.

**Alternatives considered:**

- Vite + separate Node.js backend: More complex deployment, more dependencies
- Create React App: No backend support, would require separate API server

### Decision: Component Size Enforcement via ESLint

**What:** Implement custom ESLint rule limiting React components to 300 lines.

**Why:** Enforces SOLID principle (single responsibility) automatically. Prevents
monolithic components that are hard to test and maintain. Makes code review
easier by keeping components focused.

**Alternatives considered:**

- Manual code review only: Inconsistent, human error prone
- Prettier plugin: No suitable plugin exists
- Static analysis post-build: Too late, feedback not immediate

### Decision: Docker Single-Image Deployment

**What:** Create Dockerfile that builds and runs entire app in one image
(multi-stage build).

**Why:** Enables easy self-hosted deployment on personal server via Portainer.
No external dependencies required. Can be pushed to GitHub and deployed with
single Docker pull command.

**Alternatives considered:**

- Docker Compose: More complex setup, overkill for single service
- Cloud-native deployment: Contradicts self-hosted requirement

### Decision: Git Hooks + Claude Code Post-Tool-Use Hooks

**What:** Configure pre-commit hooks to run ESLint/TypeScript checks and
Claude Code post-tool-use hooks to verify component size after generation.

**Why:** Catches issues before commit, prevents accidental violations.
Claude Code hooks ensure AI-generated code complies with standards.

**Alternatives considered:**

- CI-only checks: Too late, developer frustration higher
- Manual review: Not scalable, human error prone

### Decision: TypeScript Strict Mode

**What:** Enable `strict: true` in tsconfig.json, no implicit `any` allowed.

**Why:** Catches more errors at compile time. Mandatory for financial/safety
apps; good practice for fitness app (user data integrity matters).

**Alternatives considered:**

- Standard TypeScript: More permissive, allows subtle bugs

### Decision: Path Aliases for Imports

**What:** Use `@/` prefix for absolute imports (`@/components`, `@/lib`).

**Why:** Cleaner than relative imports, easier refactoring, prevents import
confusion in large codebases.

**Example:** `import Button from '@/components/Button'` instead of
`import Button from '../../../components/Button'`

## Risks & Trade-offs

- **300-line limit too strict**: Can be increased later; enforces best
  practices initially
- **Docker build time increases**: Multi-stage build optimizes image size;
  acceptable trade-off
- **ESLint custom rule maintenance**: Simple rule, minimal surface area for
  bugs
- **Git hooks slow down workflow**: Hooks run in seconds; minimal friction

## Migration Plan

No migration needed (new project). Sequential setup:

1. Initialize Next.js with TypeScript
2. Configure linting and formatting tools
3. Set up Git hooks
4. Create Docker build configuration
5. Test local development workflow
6. Document setup process

## Implementation Notes

- Use `create-next-app` with `--typescript` and `--tailwind` flags
- Install shadcn/ui after project initialization
- ESLint rule: Write custom rule or use `max-lines` with component detection
- Docker: Use Node.js Alpine image for minimal size
- Git hooks: Use Husky for cross-platform compatibility
- Claude Code hooks: Create shell scripts in `.claude/hooks/`

## Open Questions

- Should SQLite be embedded in Docker or PostgreSQL?
  - Decision: SQLite for MVP (single server). Can migrate to PostgreSQL
    later.
- Database connection pooling strategy?
  - Decision: Defer to first database integration; use sensible defaults.

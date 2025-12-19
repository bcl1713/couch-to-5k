# project-setup Specification

## Purpose

TBD - created by archiving change add-project-framework. Update Purpose after archive.

## Requirements

### Requirement: Next.js Full-Stack Project Structure

The system SHALL provide a Next.js project scaffold with TypeScript strict mode,
organized directories (components, hooks, lib, types, pages), and absolute
import aliases for clean code organization.

#### Scenario: Project structure initialized

- **WHEN** project is freshly initialized
- **THEN** directory tree includes `src/components/`, `src/hooks/`, `src/lib/`,
  `src/types/`, `src/app/`, and `src/api/`

#### Scenario: Absolute imports work

- **WHEN** code imports using `@/components/Button`
- **THEN** import resolves correctly to `src/components/Button.tsx`

### Requirement: TypeScript Strict Mode Enforcement

The system SHALL enforce TypeScript strict mode globally, preventing implicit
`any` types and requiring explicit type annotations.

#### Scenario: Strict mode enabled

- **WHEN** `tsc` is run
- **THEN** `strict: true` and `noImplicitAny: true` are applied

#### Scenario: Type errors caught at compile time

- **WHEN** implicit any types are written
- **THEN** TypeScript compilation fails with error

### Requirement: ESLint Component Size Limit

The system SHALL enforce a maximum of 300 lines per React component file via
ESLint custom rule, preventing monolithic components.

#### Scenario: Component under limit passes linting

- **WHEN** component file is 250 lines
- **THEN** `npm run lint` passes without errors

#### Scenario: Component over limit fails linting

- **WHEN** component file is 350 lines
- **THEN** `npm run lint` fails with ESLint error

### Requirement: Prettier Code Formatting

The system SHALL automatically format code using Prettier to maintain
consistent style across the codebase.

#### Scenario: Format command reformats code

- **WHEN** `npm run format` is executed
- **THEN** all files are reformatted to match Prettier configuration

### Requirement: Git Hooks for Code Quality

The system SHALL run ESLint and TypeScript checks automatically before commits
and pushes, preventing non-compliant code from being committed.

#### Scenario: Pre-commit hook validates code

- **WHEN** user runs `git commit`
- **THEN** pre-commit hook runs ESLint and TypeScript check
- **THEN** commit is rejected if checks fail

#### Scenario: Pre-push hook runs tests

- **WHEN** user runs `git push`
- **THEN** pre-push hook runs test suite
- **THEN** push is rejected if tests fail

### Requirement: Docker Containerization

The system SHALL build and run as a single Docker image using multi-stage
builds, optimized for self-hosted deployment via Portainer.

#### Scenario: Docker image builds successfully

- **WHEN** `docker build -t c25k .` is run
- **THEN** Docker image is created successfully

#### Scenario: Docker container runs application

- **WHEN** Docker container is started with `docker run -p 3000:3000 c25k`
- **THEN** application is accessible at `http://localhost:3000`

#### Scenario: Environment variables passed to container

- **WHEN** Docker run includes `-e DATABASE_URL=...`
- **THEN** application receives environment variable correctly

### Requirement: Claude Code Post-Tool-Use Hooks

The system SHALL provide hooks that automatically verify component size after
code generation, ensuring AI-generated code complies with 300-line limit.

#### Scenario: Generated component passes size check

- **WHEN** Claude Code generates component under 300 lines
- **THEN** post-tool-use hook passes silently

#### Scenario: Generated component fails size check

- **WHEN** Claude Code generates component over 300 lines
- **THEN** post-tool-use hook alerts user to violation

### Requirement: Tailwind CSS and shadcn/ui Integration

The system SHALL include Tailwind CSS configured for mobile-first responsive
design and initialize shadcn/ui component library for consistent UI patterns.

#### Scenario: Tailwind classes work

- **WHEN** component uses `className="md:flex lg:grid"`
- **THEN** responsive styles apply correctly

#### Scenario: shadcn/ui components available

- **WHEN** Button component is imported from shadcn/ui
- **THEN** Button renders with correct styling

### Requirement: Development and Build Scripts

The system SHALL provide npm scripts for local development (`dev`), production
build (`build`), production start (`start`), linting (`lint`), and formatting
(`format`).

#### Scenario: Local development starts

- **WHEN** `npm run dev` is executed
- **THEN** Next.js dev server starts on port 3000 with hot reload

#### Scenario: Production build succeeds

- **WHEN** `npm run build` is executed
- **THEN** optimized production build is created in `.next/` directory

#### Scenario: Production server starts

- **WHEN** `npm run start` is executed after build
- **THEN** production server starts and serves optimized app

### Requirement: Environment Configuration

The system SHALL support environment-specific configuration via `.env.local`,
`.env.example`, and container environment variables without external secrets
management for MVP.

#### Scenario: Environment variables loaded

- **WHEN** `.env.local` contains `DATABASE_URL=...`
- **THEN** application accesses via `process.env.DATABASE_URL`

#### Scenario: Example file documents required variables

- **WHEN** developer checks `.env.example`
- **THEN** file lists all required environment variables with descriptions

### Requirement: Semantic Versioning

The project MUST use Semantic Versioning (SemVer) for version numbers.

#### Scenario: Version Format

- **WHEN** checking the project version
- **THEN** it must follow the MAJOR.MINOR.PATCH format (e.g., 0.1.0)

# Tasks: Add Project Framework and Development Tooling

## 1. Initialize Next.js Project

- [x] 1.1 Run `create-next-app@latest` with TypeScript and Tailwind
- [x] 1.2 Verify Next.js, React, TypeScript versions in package.json
- [x] 1.3 Test `npm run dev` starts server successfully
- [x] 1.4 Confirm folder structure matches conventions (pages/app, components,
      lib, types, hooks)

## 2. Configure TypeScript

- [x] 2.1 Update `tsconfig.json` with strict mode enabled
- [x] 2.2 Configure path aliases (`@/components`, `@/lib`, `@/types`, `@/hooks`)
- [x] 2.3 Set `noImplicitAny: true`, `strictNullChecks: true`
- [x] 2.4 Verify `npm run type-check` passes
- [x] 2.5 Create `types/index.ts` for global type definitions

## 3. Configure ESLint and Prettier

- [x] 3.1 Install ESLint and eslint-config-next
- [x] 3.2 Create custom ESLint rule file for 300-line component limit
- [x] 3.3 Configure `.eslintrc.json` to enforce rule
- [x] 3.4 Install Prettier and create `.prettierrc` config
- [x] 3.5 Add `lint` and `format` scripts to package.json
- [x] 3.6 Verify `npm run lint` and `npm run format` work

## 4. Set Up Git Hooks

- [x] 4.1 Install Husky for Git hook management
- [x] 4.2 Create pre-commit hook: run ESLint and TypeScript check
- [x] 4.3 Create pre-push hook: run full test suite (stub for now)
- [x] 4.4 Test hooks trigger correctly on `git commit` and `git push`
- [x] 4.5 Document hook behavior in project README

## 5. Configure Docker

- [x] 5.1 Create `Dockerfile` with multi-stage build (build + production)
- [x] 5.2 Use Node.js Alpine image as base
- [x] 5.3 Create `.dockerignore` file
- [x] 5.4 Add `docker` and `docker-prod` scripts to package.json
- [x] 5.5 Test local Docker build succeeds
- [x] 5.6 Test Docker image runs and app accessible on localhost:3000
- [x] 5.7 Create docker-compose.yml for local development (optional)

## 6. Set Up Claude Code Post-Tool-Use Hooks

- [x] 6.1 Create `.claude/hooks/on-save.sh` script
- [x] 6.2 Script checks component file size, fails if > 300 lines
- [x] 6.3 Create `.claude/hooks/on-tool-use.sh` for post-tool-use checks
- [x] 6.4 Document hook configuration in `.claude/commands/setup.md`

## 7. Create Project Directory Structure

- [x] 7.1 Create `src/components/` directory
- [x] 7.2 Create `src/hooks/` directory for custom React hooks
- [x] 7.3 Create `src/lib/` directory for utility functions
- [x] 7.4 Create `src/types/` directory for TypeScript types
- [x] 7.5 Create `src/app/` or `src/pages/` for page components
- [x] 7.6 Create `src/api/` for API route handlers
- [x] 7.7 Create `.env.example` and `.env.local` template files

## 8. Configure Environment and Build

- [x] 8.1 Create `.env.example` with required environment variables
- [x] 8.2 Create `.gitignore` (include node_modules, .env.local, .next)
- [x] 8.3 Create `.dockerignore` (optimize Docker build)
- [x] 8.4 Update `package.json` scripts: dev, build, start, lint, format
- [x] 8.5 Add `@tailwindcss/forms` and other Tailwind plugins
- [x] 8.6 Verify `npm run build` creates optimized production build

## 9. Set Up shadcn/ui Components

- [x] 9.1 Install shadcn/ui CLI
- [x] 9.2 Initialize shadcn/ui in project
- [x] 9.3 Add commonly used components (Button, Card, Input, Dialog)
- [x] 9.4 Verify components use Tailwind styling correctly
- [x] 9.5 Create component examples in storybook or docs

## 10. Documentation and Testing

- [x] 10.1 Create `README.md` with setup instructions
- [x] 10.2 Document project conventions and folder structure
- [x] 10.3 Create `DEVELOPMENT.md` with local development guide
- [x] 10.4 Create `DEPLOYMENT.md` with Docker deployment steps
- [x] 10.5 Run full linting, type checking, and build to confirm no errors
- [x] 10.6 Test local development workflow end-to-end

## 11. Git Initialization

- [x] 11.1 Initialize git repo (or verify existing)
- [x] 11.2 Create initial commit with project framework
- [x] 11.3 Create `main` branch protection rules (if using GitHub)
- [x] 11.4 Document git workflow in DEVELOPMENT.md

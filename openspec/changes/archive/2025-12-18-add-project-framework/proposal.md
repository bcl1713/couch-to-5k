# Change: Add Project Framework and Development Tooling

## Why

The project requires a robust development foundation to enforce code quality,
consistency, and maintainability. This includes TypeScript configuration, ESLint
with component size limits, Prettier formatting, Docker containerization, Git
hooks, and a proper Next.js project structure. Without this framework, code
quality cannot be enforced and development will be chaotic.

## What Changes

- Initialize Next.js project with TypeScript and strict mode
- Configure ESLint with custom rule for 300-line component size limit
- Set up Prettier for consistent code formatting
- Create Dockerfile for self-contained Docker image deployment
- Configure Git hooks (pre-commit, pre-push) to enforce code quality
- Set up Claude Code post-tool-use hooks for component size enforcement
- Initialize project directory structure (components, hooks, lib, types, pages)
- Configure path aliases for absolute imports
- Set up development and build npm scripts
- Create .gitignore, .dockerignore, and environment files
- Configure TypeScript strict mode with project-specific compiler options

## Impact

- Affected specs: `project-setup` (new capability)
- Affected code: All project files (new project)
- Breaking changes: None (initial setup)
- Developer experience: Enforced code quality standards, mobile-first component
  patterns, reliable Docker deployment

## Benefits

- Code quality enforced through linting and CI rules
- Component size limits prevent monolithic components
- Docker containerization enables easy self-hosted deployment
- Git hooks catch issues before commit
- Consistent formatting across codebase
- Type safety with TypeScript strict mode

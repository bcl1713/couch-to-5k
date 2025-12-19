# Couch to 5K Running App

A self-contained, mobile-first web application that guides users through the
Couch to 5K running program with real-time workout coaching, audible cues, and
visual timers.

## Features

- Email-based authentication (no verification required)
- Real-time workout timer with visual countdown
- Audible cues for activity transitions
- Full 9-week Couch to 5K progression tracking
- Mobile-first responsive interface
- Self-contained Docker image for easy deployment

## Quick Start

### Local Development

1. Copy `.env.example` to `.env.local` and adjust `DATABASE_PATH` if desired
   (defaults to `./data/app.db`).
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

The database is created and seeded automatically on first boot. Open
[http://localhost:3000](http://localhost:3000) in your browser.

### Quality & Tests

- `npm run lint` - ESLint checks
- `npm run type-check` - TypeScript type checking
- `npm test` - Unit and integration tests
- `npm run test:coverage` - Coverage report (target 70%+)
- `npm run build` - Production build

## Tech Stack

- **Frontend:** React 19 with Next.js 16
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 with shadcn/ui
- **Code Quality:** ESLint (300-line component limit), Prettier, Husky
- **Deployment:** Docker (multi-stage build, Alpine Linux)

## Project Structure

```text
├── app/                 # Next.js pages and API routes
├── components/          # React components (< 300 lines)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── types/               # TypeScript definitions
├── openspec/            # Specification documents
└── data/                # SQLite database (created on first run)
```

## Code Quality

- **Component Size Limit:** 300 lines max (enforced by ESLint)
- **TypeScript Strict Mode:** Enabled globally
- **SOLID Principles:** Single responsibility per component
- **Git Hooks:** Pre-commit linting and type checking via Husky

## Docker Deployment

1. Build the image: `npm run docker:build`
2. Run locally:

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_PATH=/app/data/app.db \
  couch-to-5k:latest
```

Add `-v $(pwd)/data:/app/data` to persist the database outside the container.
The app initializes and seeds the database automatically on startup.

## Documentation

- `DEVELOPMENT.md` - Development guide and conventions
- `DEPLOYMENT.md` - Docker deployment instructions
- `openspec/project.md` - Project context and guidelines
- `openspec/AGENTS.md` - OpenSpec workflow for feature proposals

## Environment Variables

- `NODE_ENV` - `development` for local, `production` in containers
- `PORT` - Port for Next.js server (defaults to 3000)
- `DATABASE_PATH` - Path to SQLite database file (defaults to `./data/app.db`)

## Automated Releases

This project uses semantic versioning.

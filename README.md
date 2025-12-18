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

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-optimized application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container locally

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
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript definitions
├── openspec/           # Specification documents
└── .claude/            # Claude Code configuration
```

## Code Quality

- **Component Size Limit:** 300 lines max (enforced by ESLint)
- **TypeScript Strict Mode:** Enabled globally
- **SOLID Principles:** Single responsibility per component
- **Git Hooks:** Pre-commit linting and type checking via Husky

## Docker Deployment

```bash
npm run docker:build
npm run docker:run
```

Or deploy to Portainer:

1. Build image: `npm run docker:build`
2. Push to registry
3. Create container in Portainer
4. Map port 3000 and set environment variables
5. Start container

## Documentation

- `DEVELOPMENT.md` - Development guide and conventions
- `DEPLOYMENT.md` - Docker deployment instructions
- `openspec/project.md` - Project context and guidelines
- `openspec/AGENTS.md` - OpenSpec workflow for feature proposals

## Environment Variables

See `.env.example` for available configuration options.

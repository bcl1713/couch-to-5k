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
- Progressive Web App (PWA) support for native app-like experience

## Installing as a PWA

The Couch to 5K app can be installed directly from your browser for a
native app-like experience on mobile and desktop devices.

### Benefits of Installing

- **Home Screen Access**: Launch directly from your device home screen
  alongside native apps
- **Standalone Mode**: Full-screen experience without browser UI
- **Offline Support**: Access the app and complete workouts even without
  internet connection
- **App-Like Behavior**: Custom splash screen, icon, and seamless
  navigation
- **Better Performance**: Cached resources load instantly

### Installation Instructions

#### Chrome/Edge (Android & Desktop)

1. Open the app in Chrome or Edge browser
2. Look for the install icon in the address bar (monitor/phone icon with
   down arrow)
3. Click "Install" when prompted
4. The app will be added to your home screen/app drawer

Alternatively:

- Tap the three-dot menu (⋮) → "Install app" or "Add to Home Screen"

#### Safari (iOS/iPadOS)

1. Open the app in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"
5. The app icon will appear on your home screen

**Note**: iOS has limited PWA support compared to Android. Service worker
features like background sync work with limitations.

#### Safari (macOS)

1. Open the app in Safari
2. Click File → "Add to Dock"
3. The app will be available as a standalone application

### Offline Functionality

The app includes smart offline support:

**Works Offline:**

- UI navigation and all pages
- Viewing cached workout history
- Completing active workouts (synced when back online)
- Marking workouts complete (synced when back online)

**Requires Connection:**

- Starting new workouts (requires fresh workout data)
- User authentication (login/signup)
- Fetching latest progress updates

API requests made offline are automatically queued and synced when you
reconnect.

### Browser Support

**Full PWA Support:**

- Chrome 67+ (Android, Desktop, ChromeOS)
- Edge 79+ (Windows, Android)
- Samsung Internet 8.2+

**Partial PWA Support:**

- Safari 11.1+ (iOS, iPadOS, macOS) - limited service worker features
- Firefox 79+ - no install prompt on mobile

**Graceful Fallback:**

- All browsers can use the web version normally
- PWA features enhance but don't replace core functionality

### Troubleshooting

**Install button doesn't appear (Chrome/Edge):**

- Ensure you're using HTTPS (required for PWA installation)
- Try refreshing the page
- Check that the app isn't already installed
- Verify your browser version meets minimum requirements (Chrome 67+,
  Edge 79+)

**App won't work offline:**

- Allow the app to fully load at least once while online
- Check that service worker registered successfully (DevTools →
  Application → Service Workers)
- Verify browser supports service workers (all modern browsers except
  older iOS versions)

**Install prompt disappeared:**

- Clear browser cache and revisit the site
- Manually install via browser menu: Menu (⋮) → "Install app"

**iOS Safari specific issues:**

- Ensure you're using "Add to Home Screen" from the Share menu
- Some PWA features (like background sync) have limited support on iOS
- App must be opened from Safari, not from another browser

**App not updating to latest version:**

- Uninstall and reinstall the app
- Or clear site data: Settings → Privacy → Clear Browsing Data → Cached
  images and files

**Queued offline actions not syncing:**

- Check your internet connection is restored
- Reopen the app to trigger sync
- Check browser console for sync errors (DevTools → Console)

**HTTPS requirement:**

- PWAs require HTTPS in production (localhost works for development)
- If self-hosting, ensure your reverse proxy or server has TLS/SSL
  configured

For development issues, check the browser console (F12) for service
worker errors.

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

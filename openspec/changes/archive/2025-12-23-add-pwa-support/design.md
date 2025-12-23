# Design: add-pwa-support

## Overview

This change implements Progressive Web App (PWA) capabilities using Next.js
built-in support for web app manifests combined with a custom service worker
for offline functionality. The design prioritizes simplicity and follows PWA
best practices while maintaining compatibility with the existing Next.js
application structure.

## Architecture

### Component Structure

```text
public/
  ├── icons/
  │   ├── icon-192.png
  │   ├── icon-512.png
  │   ├── icon-maskable-192.png
  │   ├── icon-maskable-512.png
  │   └── apple-touch-icon.png
  ├── manifest.json
  └── sw.js

app/
  ├── layout.tsx (updated with PWA metadata)
  └── register-sw.tsx (new client component)
```

### Service Worker Strategy

#### Approach: Workbox-free minimal service worker

We will use a custom service worker without external dependencies rather
than Workbox or next-pwa. This keeps the implementation simple and avoids
build complexity.

#### Caching Strategy

- **All content**: Cache-first with network fallback
- **Static assets (CSS/JS/fonts)**: Cached indefinitely, updated on
  version change
- **Images**: Cache-first
- **API routes (/api/\*)**: Cache-first with background sync for updates
- **HTML pages**: Cache-first to ensure offline functionality

**Rationale:**

- Ensures app always works offline
- Simple implementation without complex sync logic for MVP
- Data syncs back to server when connection restored
- Minimal complexity for MVP PWA functionality
- Full control over caching logic
- No additional build dependencies
- Easy to understand and debug

### Manifest Configuration

**Start URL Decision:** Use `/` as start URL rather than `/dashboard`

**Rationale:**

- Allows both authenticated and unauthenticated users to install
- Existing routing logic handles redirects appropriately
- Simpler scope definition (entire app)

**Display Mode:** `standalone`

- Provides full-screen app experience
- Hides browser chrome for native-like feel
- Aligns with mobile-first usage during workouts

**Orientation:** `any` with preference for `portrait-primary`

- Supports both portrait and landscape
- Portrait preferred for phone usage during runs
- Flexible for different use cases

### iOS Safari Compatibility

iOS Safari has partial PWA support and requires additional metadata:

- `apple-touch-icon`: Required for home screen icon
- `apple-mobile-web-app-capable`: Enables standalone mode on iOS
- `apple-mobile-web-app-status-bar-style`: Themes status bar

**Limitation:** iOS does not support service worker background sync or
advanced PWA features, but basic installation and offline caching work.

### Next.js Integration

Next.js 13+ provides native manifest support via metadata API, but we use
a static `manifest.json` for:

1. **Simplicity**: Easier to understand and modify
2. **Standards compliance**: Standard Web App Manifest format
3. **Tool compatibility**: Works with PWA testing tools

We add manifest link via Next.js metadata in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  // ... existing metadata
  manifest: "/manifest.json",
  // apple-touch-icon, theme-color, etc.
};
```

### Service Worker Registration

Registration happens client-side in a separate component to avoid SSR
issues:

- Registered only in browser environment (`typeof window !== 'undefined'`)
- Registration deferred until after page load for performance
- Error handling for unsupported browsers
- Development mode supports unregistration for testing

### Offline Strategy Trade-offs

#### Decision: Hybrid offline support

We implement a pragmatic offline strategy that balances functionality
with complexity:

**What works offline:**

- UI and navigation (all pages cached)
- Viewing cached workout history
- Manually marking workouts complete (queued for sync)
- Completing active workouts (queued for sync)

**What requires connection:**

- Starting new workouts (requires server-side session creation)
- User authentication (login/signup)
- Fetching fresh user progress data

**Rationale:**

- Starting workouts requires real-time server data (workout intervals,
  session IDs) that can't be easily mocked
- Queuing completions is straightforward and valuable for offline use
- UI remains accessible even when features are disabled
- Simpler implementation for MVP

**Sync strategy**:

- Completion requests stored in IndexedDB
- Automatically synced when connection restored
- User sees optimistic UI (assumes success)
- Background sync processes queue on reconnection

**Future enhancement**:

- Pre-cache workout data for fully offline workout starts
- Implement Background Sync API for reliable queuing
- Add offline indicator in UI
- Show queued items count to user

### Icon Design

**Requirements:**

- 192x192: Minimum for install prompt
- 512x512: High-res for splash screen
- Maskable variants: Adaptive icons on Android
- Apple touch icon (180x180): iOS home screen

**Icon generation:**

- User will generate icons using external tools (Gemini/Nano Banana)
- Icons should be placed in `public/icons/` directory
- Maskable icons should use safe zone (80% of image for content)
- File names: `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`,
  `icon-maskable-512.png`, `apple-touch-icon.png`

### Browser Support

**Full PWA support:**

- Chrome 67+ (Android, Desktop)
- Edge 79+
- Samsung Internet 8.2+

**Partial support:**

- Safari 11.1+ (iOS) - limited service worker features
- Firefox 79+ - no install prompt on mobile

**Fallback:**

- App functions normally in unsupported browsers
- PWA features gracefully degrade
- No breaking changes for existing users

## Security Considerations

### HTTPS Requirement

Service workers require HTTPS (or localhost for development):

- Docker deployment must configure HTTPS
- Self-signed certificates acceptable for self-hosted
- Manifest recommends reverse proxy with TLS termination

### Service Worker Scope

Service worker scope set to `/` to cover entire application:

- Prevents scope-related installation issues
- Allows caching of all routes
- No security risk as all routes are part of same application

## Performance Implications

### Initial Load

- Manifest: ~1KB additional resource
- Service worker: ~2-3KB for minimal implementation
- Icons: Lazy-loaded, no impact on initial page load

**Impact:** Negligible performance overhead

### Offline Caching

Cache storage limits:

- Chrome: 6-10% of available disk space
- Safari: 50-100MB typical limit

**Strategy:** Cache only essential assets (~5-10MB estimated) to stay
well within limits

### Service Worker Lifecycle

- Install: Caches static assets on first visit
- Activate: Cleans up old caches
- Fetch: Intercepts requests with minimal overhead

**Impact:** Service worker adds <5ms to request handling

## Testing Strategy

### Manual Testing

1. Chrome DevTools Lighthouse PWA audit
2. Install flow on Chrome Android and iOS Safari
3. Offline mode testing in DevTools
4. Uninstall and reinstall testing

### Automated Testing

Not required for MVP - PWA features are primarily browser-level and
difficult to test in Jest/React Testing Library.

Future: Consider Playwright for E2E PWA testing

## Migration Path

No database or data migration required. This is purely additive:

- New static files in `public/`
- Metadata additions to `app/layout.tsx`
- New client component for service worker registration

**Rollback:** Remove files and metadata if needed - no breaking changes

## Future Enhancements

Potential improvements for future iterations:

1. **Push notifications**: Workout reminders
2. **Background sync**: Upload completed workouts when online
3. **App shortcuts**: Quick access to start workout from icon long-press
4. **Share target**: Share workouts with friends
5. **Periodic background sync**: Update workout plans automatically
6. **Custom install prompt**: Branded install experience

These are beyond MVP scope but align with PWA capabilities.

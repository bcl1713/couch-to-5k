# Tasks: add-pwa-support

## Implementation Tasks

- [x] 1. **Create app icons in multiple sizes**
  - [x] Generate or design 192x192 and 512x512 PNG icons
  - [x] Create maskable icon variants for adaptive icons
  - [x] Add 180x180 apple-touch-icon for iOS
  - [x] Place icons in `public/icons/` directory
  - [x] Validation: Icons exist and are properly sized

- [x] 2. **Create web app manifest file**
  - [x] Create `public/manifest.json` with required fields
  - [x] Set name, short_name, description, theme_color, background_color
  - [x] Define icons array with all icon sizes
  - [x] Set display mode to "standalone"
  - [x] Set start_url to "/"
  - [x] Define orientation preferences
  - [x] Validation: Manifest is valid JSON and includes all required fields

- [x] 3. **Update root layout with PWA metadata**
  - [x] Add manifest link to Next.js metadata in `app/layout.tsx`
  - [x] Add apple-touch-icon links for iOS support
  - [x] Add apple-mobile-web-app-capable meta tag
  - [x] Add apple-mobile-web-app-status-bar-style meta tag
  - [x] Add theme-color via viewport export
  - [x] Validation: HTML head includes all required PWA meta tags

- [x] 4. **Create minimal service worker**
  - [x] Create `public/sw.js` with basic caching strategy
  - [x] Implement install event to cache static assets
  - [x] Implement fetch event to serve cached assets when offline
  - [x] Define cache name and version for cache management
  - [x] Validation: Service worker registers without errors

- [x] 5. **Add service worker registration code**
  - [x] Create client-side registration script in `app/register-sw.tsx`
  - [x] Register service worker on app load
  - [x] Handle registration success and errors
  - [x] Production-only registration (no dev mode issues)
  - [x] Validation: Service worker shows as registered in DevTools

- [x] 6. **Test PWA installability**
  - [x] Build passes with no errors
  - [x] Type checking passes
  - [x] Linting passes
  - [x] All PWA files created and in correct locations
  - [x] Validation: Ready for manual testing in browser

- [x] 7. **Test offline functionality**
  - [x] Test app shell loads when offline
  - [x] Verify cached assets are served offline
  - [x] Add offline API request queueing
  - [x] Add IndexedDB-based request queue
  - [x] Add automatic sync when back online
  - [x] Validation: API requests queued and processed when online

- [x] 8. **Update documentation** (Optional for MVP)
  - [x] Add PWA installation instructions to README
  - [x] Document supported browsers and features
  - [x] Add troubleshooting section for install issues
  - [x] Validation: Documentation is clear and complete

## Dependencies

- Task 3 depends on Task 2 (manifest must exist before linking)
- Task 5 depends on Task 4 (service worker file must exist before
  registration)
- Task 6 depends on Tasks 1-5 (all components must be in place)
- Task 7 depends on Tasks 4-5 (service worker must be functional)

## Parallel Work

- Tasks 1 and 2 can be done in parallel (icons and manifest are
  independent)
- Task 4 can be done in parallel with Tasks 1-3
- Task 8 can be done in parallel with testing tasks 6-7

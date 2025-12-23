# Proposal: add-pwa-support

## Summary

Transform the Couch to 5K web application into a Progressive Web App (PWA)
to enable browser-based installation and native app-like behavior on mobile
devices. Users will be able to install the app directly from their browser
menu (Chrome, Safari, etc.), add it to their home screen, and access it with
a standalone app experience including full-screen mode, app icons, and
improved offline capabilities.

## Motivation

The Couch to 5K app is designed for mobile-first use during outdoor running
sessions. Currently, users must open a browser and navigate to the URL each
time they want to use the app. As a PWA, the app will:

1. **Install like a native app** - Users can install directly from the
   browser without app store friction
2. **Launch from home screen** - Quick access with a dedicated icon
   alongside native apps
3. **Run in standalone mode** - Full-screen experience without browser
   chrome/UI
4. **Better mobile integration** - Splash screens, status bar theming, and
   orientation control
5. **Enhanced offline support** - Service worker enables offline page
   loading and caching strategies
6. **Improved user retention** - Installed apps have higher engagement and
   retention rates

This aligns with the project's mobile-first philosophy and self-hosted
deployment model, providing an app-store-free installation experience.

## Affected Capabilities

- **pwa-capability** (NEW) - Core PWA support including web app manifest,
  service worker, and installability

## Related Changes

None - this is a new capability with no dependencies on other changes.

## Decisions

1. **Offline strategy**: Cache-first for all content to ensure the app
   always works offline. Data will sync back when online.

2. **Icons**: User will generate icons using external tools and provide
   them in the required sizes.

3. **Scope and start URL**: Full app scope including all routes
   (landing, login, dashboard, workout).

## Implementation Notes

- Next.js 13+ has built-in support for web app manifests via metadata
- Service worker will be minimal initially (focused on installability and
  basic caching)
- Icons should be generated in multiple sizes (72x72, 96x96, 128x128,
  144x144, 152x152, 192x192, 384x384, 512x512)
- Uses modern Web App Manifest v3 specification
- Compatible with Chrome/Edge (full support), Safari (partial support with
  apple-touch-icon)

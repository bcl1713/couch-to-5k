# pwa-capability Specification

## Purpose

Enable Progressive Web App (PWA) functionality to allow users to install
the Couch to 5K application directly from their browser and use it as a
standalone application with native app-like behavior.

## ADDED Requirements

### Requirement: Web App Manifest

The system SHALL provide a web app manifest that defines the application's
metadata, appearance, and behavior when installed.

#### Scenario: Manifest accessibility

- **WHEN** a user visits the application
- **THEN** the web app manifest MUST be served at `/manifest.json`
- **AND** the manifest MUST be linked in the HTML `<head>` via
  `<link rel="manifest">`

#### Scenario: Manifest metadata

- **WHEN** the manifest is loaded
- **THEN** it MUST include `name` set to "Couch to 5K"
- **AND** it MUST include `short_name` set to "C25K"
- **AND** it MUST include `description` describing the running coach app
- **AND** it MUST include `start_url` pointing to the dashboard or home
- **AND** it MUST include `display` set to "standalone" for app-like UI
- **AND** it MUST include `theme_color` matching the app's primary color
- **AND** it MUST include `background_color` for the splash screen

#### Scenario: Icon definitions

- **WHEN** the manifest is loaded
- **THEN** it MUST include an `icons` array with multiple sizes
- **AND** icons MUST include at least 192x192 and 512x512 PNG formats
- **AND** icons MUST be referenced with correct MIME types
- **AND** icons MUST be maskable or include maskable variants for adaptive
  icons

### Requirement: Browser Installability

The system SHALL meet all criteria for browser-based installation prompts.

#### Scenario: Install prompt trigger

- **WHEN** a user visits the application on a supported browser
- **AND** the manifest is valid
- **AND** the application is served over HTTPS (or localhost)
- **AND** a service worker is registered
- **THEN** the browser MAY display an install prompt or add-to-home-screen
  option

#### Scenario: Installation confirmation

- **WHEN** a user installs the application
- **THEN** an icon with the manifest's specified icon MUST be added to
  their device
- **AND** launching the icon MUST open the app in standalone mode
- **AND** the app MUST display without browser chrome (address bar, tabs)

### Requirement: Service Worker Registration

The system SHALL register a service worker to enable PWA functionality
and offline capabilities.

#### Scenario: Service worker registration

- **WHEN** the application loads in the browser
- **THEN** a service worker MUST be registered
- **AND** the service worker file MUST be served at `/sw.js` or similar
- **AND** registration MUST succeed without errors

#### Scenario: Service worker scope

- **WHEN** the service worker is registered
- **THEN** its scope MUST include all application routes
- **AND** it MUST be able to intercept network requests for resources

### Requirement: iOS Safari Support

The system SHALL include metadata for iOS Safari to enable add-to-home-
screen functionality.

#### Scenario: Apple touch icons

- **WHEN** the HTML is loaded on iOS Safari
- **THEN** it MUST include `<link rel="apple-touch-icon">` tags
- **AND** apple-touch-icon MUST reference at least a 180x180 icon
- **AND** the icon MUST be in PNG format

#### Scenario: Apple meta tags

- **WHEN** the HTML is loaded on iOS Safari
- **THEN** it MUST include `<meta name="apple-mobile-web-app-capable">`
  set to "yes"
- **AND** it MUST include `<meta name="apple-mobile-web-app-status-bar-
style">` for status bar theming
- **AND** it MUST include `<meta name="apple-mobile-web-app-title">` with
  the app name

### Requirement: Offline Page Support

The system SHALL provide basic offline functionality through service
worker caching.

#### Scenario: Cache static assets

- **WHEN** the service worker is installed
- **THEN** it MUST cache critical static assets (CSS, JS, fonts)
- **AND** it MUST cache the application shell
- **AND** cached assets MUST be served when offline

#### Scenario: Offline fallback

- **WHEN** a user is offline
- **AND** they navigate to an uncached page
- **THEN** the service worker SHOULD serve a cached fallback page
- **OR** display a meaningful offline message

### Requirement: Display Modes

The system SHALL support standalone display mode for an app-like
experience.

#### Scenario: Standalone display

- **WHEN** the PWA is launched from the home screen icon
- **THEN** it MUST open in standalone mode without browser UI
- **AND** the status bar MUST be themed according to `theme_color`
- **AND** navigation MUST occur within the app window

#### Scenario: Browser fallback

- **WHEN** the app is accessed via a standard browser tab
- **THEN** it MUST still function correctly with browser chrome visible
- **AND** all features MUST remain accessible

### Requirement: Orientation Support

The system SHALL define supported screen orientations in the manifest.

#### Scenario: Portrait orientation

- **WHEN** the manifest defines orientation
- **THEN** it SHOULD support "portrait-primary" for phone usage
- **AND** it MAY support "landscape" for flexibility
- **AND** the orientation preference MUST be respected when installed

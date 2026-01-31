# screen-wake-lock Specification

## ADDED Requirements

### Requirement: Screen Wake Lock During Active Workout

The system SHALL prevent the device screen from sleeping during active workout
sessions by acquiring a screen wake lock.

#### Scenario: Wake lock acquired when workout starts

- **WHEN** a workout session starts
- **AND** the browser supports the Screen Wake Lock API
- **THEN** the system SHALL request a screen wake lock
- **AND** the screen SHALL remain on while the workout is active

#### Scenario: Wake lock released when workout completes

- **WHEN** a workout session completes (all intervals finished)
- **THEN** the system SHALL release the screen wake lock
- **AND** normal screen sleep behavior SHALL resume

#### Scenario: Wake lock released when workout is quit

- **WHEN** the user quits an active workout session
- **THEN** the system SHALL release the screen wake lock
- **AND** normal screen sleep behavior SHALL resume

### Requirement: Wake Lock Respects Pause State

The system SHALL release the wake lock when a workout is paused and re-acquire
it when resumed, allowing the screen to sleep during paused workouts.

#### Scenario: Wake lock released on pause

- **WHEN** the user pauses an active workout
- **THEN** the system SHALL release the screen wake lock
- **AND** the screen MAY sleep according to system settings

#### Scenario: Wake lock re-acquired on resume

- **WHEN** the user resumes a paused workout
- **AND** the browser supports the Screen Wake Lock API
- **THEN** the system SHALL request a new screen wake lock
- **AND** the screen SHALL remain on while the workout is active

### Requirement: Wake Lock Re-acquisition on Visibility Change

The system SHALL re-acquire the wake lock when the user returns to the app
after switching tabs or apps, as browsers automatically release wake locks
when a page becomes hidden.

#### Scenario: Wake lock re-acquired when tab becomes visible

- **WHEN** the active workout page becomes visible after being hidden
- **AND** the workout is not paused
- **AND** the browser supports the Screen Wake Lock API
- **THEN** the system SHALL request a new screen wake lock

#### Scenario: Wake lock not re-acquired if workout is paused

- **WHEN** the active workout page becomes visible after being hidden
- **AND** the workout is paused
- **THEN** the system SHALL NOT request a wake lock

### Requirement: Graceful Degradation for Unsupported Browsers

The system SHALL function correctly in browsers that do not support the Screen
Wake Lock API, with no errors or degraded user experience beyond the screen
potentially sleeping.

#### Scenario: No errors on unsupported browsers

- **WHEN** a workout session starts
- **AND** the browser does not support the Screen Wake Lock API
- **THEN** the system SHALL NOT throw any errors
- **AND** the workout timer SHALL function normally
- **AND** no wake lock warning or message SHALL be displayed to the user

#### Scenario: Silent failure on wake lock request error

- **WHEN** a wake lock request fails (e.g., due to low battery mode)
- **THEN** the system SHALL log the error for debugging
- **AND** the system SHALL NOT display an error to the user
- **AND** the workout SHALL continue normally

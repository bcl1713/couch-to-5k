## MODIFIED Requirements

### Requirement: Session Management

The system SHALL maintain secure user sessions using HTTP-only cookies, setting
the `secure` attribute only when the request is served over HTTPS (including
when `x-forwarded-proto` indicates HTTPS) while allowing HTTP for local
development. Sessions SHALL persist across page reloads and browser restarts
and expire after 30 days of inactivity.

#### Scenario: User session persists across page reload

- **WHEN** a logged-in user reloads the page
- **THEN** the session token/cookie is validated
- **THEN** the user remains authenticated without re-login

#### Scenario: User session expires after inactivity

- **WHEN** a user's session exceeds 30 days without activity
- **THEN** the session token is invalidated
- **THEN** the user is logged out on next request
- **THEN** the user is redirected to the login page

#### Scenario: Secure flag follows request protocol

- **WHEN** a session cookie is set for a request received over HTTPS or with
  `x-forwarded-proto` indicating `https`
- **THEN** the cookie is issued with `secure=true`
- **WHEN** the request is over plain HTTP without HTTPS forwarding
- **THEN** the cookie is issued without the secure flag so local/dev login
  succeeds

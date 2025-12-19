# user-auth Specification

## Purpose

TBD - created by archiving change add-mvp-core-features. Update Purpose after archive.

## Requirements

### Requirement: Email-based User Registration

The system SHALL allow users to register with an email address and password
without requiring email verification. Upon successful registration, the user
SHALL be authenticated and redirected to the dashboard.

#### Scenario: New user registers successfully

- **WHEN** a new user submits email and password on the signup form
- **THEN** the system hashes the password using bcrypt
- **THEN** a new user record is created in the database
- **THEN** the user is authenticated and receives a session token
- **THEN** the user is redirected to the dashboard

#### Scenario: User registration fails with duplicate email

- **WHEN** a user tries to register with an email that already exists
- **THEN** the system returns a 400 error with message "Email already in use"
- **THEN** no user record is created

#### Scenario: Password validation on registration

- **WHEN** a user submits a password shorter than 8 characters
- **THEN** the system returns a 400 error with message "Password too short"
- **THEN** registration is rejected

### Requirement: Email-based User Login

The system SHALL authenticate users with email and password, creating a secure
session that persists across browser sessions.

#### Scenario: User logs in successfully

- **WHEN** a registered user submits correct email and password
- **THEN** the system validates the password against the stored hash
- **THEN** the user is authenticated and receives a session token/cookie
- **THEN** the user is redirected to the dashboard

#### Scenario: Login fails with invalid credentials

- **WHEN** a user submits an email that does not exist or incorrect password
- **THEN** the system returns a 401 error with message "Invalid email or password"
- **THEN** no authentication is granted

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

### Requirement: Logout Functionality

The system SHALL allow users to explicitly logout, clearing their session and
requiring re-authentication on next access.

#### Scenario: User logs out successfully

- **WHEN** a logged-in user clicks the logout button
- **THEN** the system clears the session token/cookie
- **THEN** the user is redirected to the login page
- **THEN** subsequent requests without authentication are rejected

### Requirement: Password Security

The system SHALL hash all passwords using bcrypt with a minimum cost of 10
rounds, ensuring secure storage and preventing plain-text exposure.

#### Scenario: Password is never stored in plaintext

- **WHEN** a user registers or changes their password
- **THEN** the password is hashed using bcrypt before storage
- **THEN** the plaintext password is never logged or transmitted in responses

### Requirement: Protected Routes

The system SHALL restrict access to authenticated-only routes, redirecting
unauthenticated users to the login page.

#### Scenario: Unauthenticated user cannot access dashboard

- **WHEN** an unauthenticated user tries to access `/dashboard`
- **THEN** the user is redirected to `/login`

#### Scenario: Authenticated user can access dashboard

- **WHEN** a logged-in user navigates to `/dashboard`
- **THEN** the dashboard page loads successfully

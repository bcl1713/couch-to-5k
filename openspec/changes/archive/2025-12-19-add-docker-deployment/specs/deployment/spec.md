## ADDED Requirements

### Requirement: Docker Compose Deployment

The system SHALL support deployment via Docker Compose, including a persistent volume for the database.

#### Scenario: Start application

- **WHEN** `docker-compose up` is executed
- **THEN** the application container starts
- **AND** the database file is persisted in a Docker volume

### Requirement: Database Migration System

The system SHALL use a versioned file-based migration system to manage the database schema.

#### Scenario: Apply pending migrations

- **WHEN** the application starts
- **THEN** it checks for unapplied SQL migration files in `db/migrations`
- **AND** applies them in order
- **AND** records the application in the `_migrations` table

#### Scenario: Initialize fresh database

- **WHEN** the application starts with an empty database
- **THEN** all migration files are applied
- **AND** the schema is fully created

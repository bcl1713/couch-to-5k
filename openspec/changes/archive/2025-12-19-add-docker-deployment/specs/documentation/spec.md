## ADDED Requirements

### Requirement: Deployment Documentation

The system SHALL have updated documentation covering the new Docker deployment and migration process.

#### Scenario: Developer follows deployment guide

- **WHEN** a developer reads `DEPLOYMENT.md`
- **THEN** they find instructions for running the application using `docker-compose`
- **AND** they see how to persist the database volume

#### Scenario: Developer follows migration guide

- **WHEN** a developer reads `DEVELOPMENT.md`
- **THEN** they find instructions for creating new database migrations
- **AND** they understand the file naming convention (e.g., `00X_description.sql`)

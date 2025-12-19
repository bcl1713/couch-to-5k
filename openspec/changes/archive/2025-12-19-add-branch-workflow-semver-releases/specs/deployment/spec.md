# Deployment Spec Delta

## ADDED Requirements

### Requirement: Semantic Versioning

The system SHALL use semantic versioning (MAJOR.MINOR.PATCH) for all
releases.

#### Scenario: Version format

- **WHEN** a new version is released
- **THEN** it MUST follow the format `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
- **AND** the version MUST be stored in `package.json`

#### Scenario: Version bumping on merge

- **WHEN** changes are merged to `main`
- **THEN** the version number MUST be incremented according to
  semantic versioning rules
- **AND** MAJOR version increases for breaking changes
- **AND** MINOR version increases for new features
- **AND** PATCH version increases for bug fixes

### Requirement: Branch-Based Development

All code changes SHALL be developed on feature branches and merged to
`main` via pull requests.

#### Scenario: Feature development

- **WHEN** a developer implements a change
- **THEN** they MUST create a feature branch from `main`
- **AND** they MUST submit a pull request to merge back to `main`
- **AND** they MUST NOT push directly to `main`

#### Scenario: Version bump in PR

- **WHEN** a pull request is created
- **THEN** it SHOULD include a version bump in `package.json`
  appropriate to the change type

### Requirement: Automated Docker Image Release

The system SHALL automatically build and publish Docker images when
changes are merged to `main`.

#### Scenario: Build on merge

- **WHEN** a pull request is merged to `main`
- **THEN** a GitHub Actions workflow MUST trigger
- **AND** the workflow MUST build a Docker image
- **AND** the workflow MUST push the image to Docker Hub

#### Scenario: Image tagging

- **WHEN** a Docker image is built
- **THEN** it MUST be tagged with the version number from
  `package.json`
- **AND** it MUST also be tagged with `latest`
- **AND** both tags MUST be pushed to Docker Hub

#### Scenario: Version-specific deployment

- **WHEN** a user wants to deploy a specific version
- **THEN** they can pull the image using
  `bcl1713/couch-to-5k:<version>`
- **AND** the image with that version tag MUST be available

### Requirement: Automated Code Review

The system SHALL provide automated code review on all pull requests
before merging.

#### Scenario: Code review on PR creation

- **WHEN** a pull request is created
- **THEN** an automated code review MUST be triggered
- **AND** the review SHOULD provide feedback on code quality, best
  practices, and potential issues

#### Scenario: Required checks before merge

- **WHEN** a pull request is ready to merge
- **THEN** automated code review MUST have completed
- **AND** CI checks (tests, linting) MUST pass
- **AND** branch protection rules MUST enforce these requirements

### Requirement: Changelog Generation

The system SHALL automatically generate a changelog when versions are
released.

#### Scenario: Changelog update on release

- **WHEN** a version is bumped and released
- **THEN** a CHANGELOG.md file MUST be updated with the new version
- **AND** the changelog MUST include commit messages grouped by type
  (features, fixes, breaking changes)
- **AND** the changelog MUST be committed to the repository

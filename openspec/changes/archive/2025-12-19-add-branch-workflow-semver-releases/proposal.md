# Change: Add Branch-Based Workflow with Semantic Versioning and Automated Releases

## Why

Currently, development happens directly on `main`, which makes it
difficult to:

- Review changes before they go live
- Track what version is deployed
- Rollback to previous stable versions
- Coordinate multiple changes in flight

Moving to a branch-based workflow with semantic versioning provides:

- Clear version tracking for deployments
- Automated version bumping based on commit messages
- Automated Docker image builds tagged with version numbers
- Better change isolation and review process
- Ability to rollback to specific versions

## What Changes

- **BREAKING**: All changes must be developed on feature branches,
  not directly on `main`
- **BREAKING**: All commits must follow conventional commit format
  (feat:, fix:, etc.)
- Add semantic versioning requirement (MAJOR.MINOR.PATCH format)
- Automatic version bumping based on conventional commits
- Add GitHub Actions workflow to build and push Docker images on
  merge to `main`
- Docker images will be tagged with both the version number and
  `latest`
- Version tracking in `package.json`
- Git tags created automatically with version numbers

## Impact

- Affected specs: `deployment`
- Affected code:
  - `.github/workflows/` - new GitHub Actions workflows (release and
    code review)
  - `package.json` - version tracking
  - Commitlint configuration for conventional commits
  - semantic-release configuration
  - Docker build/push configuration to bcl1713/couch-to-5k
  - CHANGELOG.md - auto-generated
- Affected workflow:
  - All developers must use feature branches instead of pushing to
    `main`
  - All developers must use conventional commit messages
  - PRs require automated code review and CI checks to pass

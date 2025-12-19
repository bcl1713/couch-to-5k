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
- Automated Docker image builds tagged with version numbers
- Better change isolation and review process
- Ability to rollback to specific versions

## What Changes

- **BREAKING**: All changes must be developed on feature branches,
  not directly on `main`
- Add semantic versioning requirement (MAJOR.MINOR.PATCH format)
- Version must be bumped with every merge to `main`
- Add GitHub Actions workflow to build and push Docker images on
  merge to `main`
- Docker images will be tagged with both the version number and
  `latest`
- Version tracking in `package.json` or dedicated version file

## Impact

- Affected specs: `deployment`, new spec `ci-cd` (or add to
  deployment)
- Affected code:
  - `.github/workflows/` - new GitHub Actions workflow
  - `package.json` - version tracking
  - Docker build/push configuration
- Affected workflow: All developers must use feature branches instead
  of pushing to `main`

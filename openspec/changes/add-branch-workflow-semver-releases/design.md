# Design: Branch-Based Workflow with Semantic Versioning

## Context

The project currently uses direct commits to `main`, which works for
early development but doesn't scale well as the project matures.
We need:

- Version tracking for Docker deployments
- Automated releases when changes merge to `main`
- Clear history of what was deployed when

## Goals / Non-Goals

**Goals:**

- Enforce branch-based development workflow
- Automate Docker image building and publishing on merge to `main`
- Tag Docker images with semantic version numbers
- Maintain `latest` tag for convenience
- Make it easy to rollback to specific versions

**Non-Goals:**

- Automatic version bumping (manual for now)
- Complex release branches (simple main-based flow)
- Pre-release or beta channels
- Multi-environment deployments (dev/staging/prod)

## Decisions

### Decision 1: Version Storage

**Choice:** Store version in `package.json`

**Rationale:**

- Already using npm/Node.js ecosystem
- Single source of truth
- Can be read by GitHub Actions easily
- Standard practice for Node.js projects

**Alternatives considered:**

- Dedicated `VERSION` file - simpler but not standard for Node.js
  projects
- Git tags only - harder to track, requires extra steps

### Decision 2: Semantic Versioning Format

**Choice:** Use MAJOR.MINOR.PATCH (e.g., 1.2.3)

**Rationale:**

- Industry standard
- Clear meaning: breaking.feature.fix
- Supported by npm and Docker registries

**Bump guidelines:**

- MAJOR: Breaking changes (API changes, database schema changes
  requiring migration)
- MINOR: New features, non-breaking enhancements
- PATCH: Bug fixes, documentation updates

### Decision 3: GitHub Actions Trigger

**Choice:** Trigger on push to `main` (after PR merge)

**Rationale:**

- Every merge to `main` is a release candidate
- Simple, predictable workflow
- No manual release process needed

**Alternatives considered:**

- Manual workflow_dispatch - too manual, easy to forget
- Git tag triggers - requires extra step, more complex

### Decision 4: Docker Hub Tagging Strategy

**Choice:** Push two tags per release: `<version>` and `latest`

**Format:**

- Version tag: `username/couch-to-5k:1.2.3`
- Latest tag: `username/couch-to-5k:latest`

**Rationale:**

- Version tag allows pinning to specific releases
- `latest` tag provides convenience for "just get the newest"
- Standard Docker practice

### Decision 5: Manual Version Bumping

**Choice:** Developers manually bump version in `package.json` in
their PR

**Rationale:**

- Intentional decision about version impact
- Simple, no tooling required
- Visible in PR diff

**Alternatives considered:**

- Automatic bumping based on commit messages - complex, can guess
  wrong
- Post-merge bumping bot - adds complexity, delays release

## Risks / Trade-offs

### Risk: Forgetting to Bump Version

**Mitigation:**

- Document process clearly
- Add PR checklist template
- Could add CI check to fail if version hasn't changed (future
  enhancement)

### Risk: Docker Hub Credentials Security

**Mitigation:**

- Use GitHub Secrets for credentials
- Use Docker Hub access tokens (not password)
- Limit token scope to push-only

### Trade-off: Manual vs Automatic Versioning

- Manual gives more control but requires discipline
- Start manual, can automate later if needed

## Migration Plan

### Phase 1: Setup (No Breaking Changes)

1. Add version to `package.json` (starting at 0.1.0 or 1.0.0)
2. Create GitHub Actions workflow
3. Configure Docker Hub secrets

### Phase 2: Enable Workflow

1. Test workflow with a PR that bumps version
2. Verify Docker image pushes successfully
3. Document new process

### Phase 3: Enforce Branch Protection

1. Enable branch protection on `main` (require PR reviews)
2. Update documentation with new workflow
3. Communicate to all contributors

### Rollback Plan

- If workflow fails, can still manually build and push Docker images
- Workflow can be disabled without affecting existing deployments
- Version in `package.json` doesn't break anything if unused

## Open Questions

1. **Docker Hub organization/username?** - Need to know where to push images
2. **Starting version number?** - 0.1.0 (pre-1.0) or 1.0.0 (stable)?
3. **Branch protection rules?** - Require approvals? How many reviewers?
4. **Pre-merge CI checks?** - Should we require tests/lint to pass before merge?

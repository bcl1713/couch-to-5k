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
- Automate version bumping based on conventional commits
- Automate Docker image building and publishing on merge to `main`
- Tag Docker images with semantic version numbers
- Maintain `latest` tag for convenience
- Make it easy to rollback to specific versions
- Provide automated code review on all PRs
- Generate changelogs automatically

**Non-Goals:**

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

### Decision 5: Automatic Version Bumping

**Choice:** Automatically bump version based on conventional commit
messages in the PR

**Rationale:**

- Eliminates manual step and potential for forgetting
- Conventional commits provide clear signal for bump type
- Standard practice in modern CI/CD
- Version bump happens automatically in GitHub Actions workflow

**Bump logic:**

- Commits with `feat:` prefix → MINOR bump
- Commits with `fix:` prefix → PATCH bump
- Commits with `BREAKING CHANGE:` footer or `!` after type →
  MAJOR bump
- Examples:
  - `feat: add workout timer` → 1.0.0 → 1.1.0
  - `fix: correct session expiry` → 1.1.0 → 1.1.1
  - `feat!: redesign API endpoints` → 1.1.1 → 2.0.0

**Implementation:**

- Use GitHub Actions with semantic-release or similar tool
- Version bump committed back to `main` after merge
- Git tag created automatically with version number

**Alternatives considered:**

- Manual bumping in PR - error-prone, easy to forget
- Post-merge manual bumping - delays release, requires extra step

## Risks / Trade-offs

### Risk: Incorrect Conventional Commit Messages

**Mitigation:**

- Document conventional commit format clearly
- Add commitlint to validate commit messages
- Provide PR template with examples
- Can manually override if needed by editing commit messages

### Risk: Docker Hub Credentials Security

**Mitigation:**

- Use GitHub Secrets for credentials
- Use Docker Hub access tokens (not password)
- Limit token scope to push-only

### Trade-off: Conventional Commits Requirement

- Requires developers to use conventional commit format
- Adds slight overhead to commit messages
- Benefits: automatic versioning, clear changelog, standard practice

## Migration Plan

### Phase 1: Setup (No Breaking Changes)

1. Ensure `package.json` has version set to 0.1.0 (current version)
2. Create GitHub Actions workflows (release and code review)
3. Configure Docker Hub secrets (bcl1713)
4. Configure semantic-release
5. Set up automated code review

### Phase 2: Enable Workflow

1. Test workflow with a PR using conventional commits
2. Verify version bumps automatically
3. Verify Docker image pushes successfully with correct tag
4. Document new process

### Phase 3: Enforce Branch Protection

1. Enable branch protection on `main` (require PR reviews)
2. Update documentation with new workflow
3. Communicate to all contributors

### Rollback Plan

- If workflow fails, can still manually build and push Docker images
- Workflow can be disabled without affecting existing deployments
- Version in `package.json` doesn't break anything if unused

## Answers to Open Questions

1. **Docker Hub organization/username?** - `bcl1713`
2. **Starting version number?** - `0.1.0` (currently in pre-1.0)
3. **Branch protection rules?** - Sole maintainer, but want automated
   code reviews (potentially from Claude) on PRs before merging
4. **Pre-merge CI checks?** - Yes, require tests/lint to pass before
   merge
5. **Versioning tool?** - See Decision 6 below

## Decision 6: Versioning Tool Selection

**Choice:** Use `semantic-release`

**Rationale:**

- Most popular and mature tool (85k+ GitHub stars)
- Fully automated - handles version bump, changelog, git tag, and
  GitHub release
- Extensive plugin ecosystem
- Highly configurable
- Active maintenance and community support
- Works seamlessly with GitHub Actions

**Comparison:**

- **semantic-release**: Full automation, changelog generation, GitHub
  releases, plugins
- **standard-version**: More manual, requires npm scripts, good for
  simpler needs
- **Custom script**: Maximum control but requires maintenance and
  testing

**Configuration:**

- Use default conventional commits preset
- Configure to update `package.json`
- Skip npm publish (not needed for Docker-only project)
- Generate CHANGELOG.md automatically
- Create GitHub releases with changelog

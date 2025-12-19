# Pull Request

## Description

<!-- Provide a brief description of your changes -->

## Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] docs: Documentation update
- [ ] style: Code style/formatting (no functional changes)
- [ ] refactor: Code refactoring
- [ ] perf: Performance improvement
- [ ] test: Adding or updating tests
- [ ] chore: Maintenance tasks
- [ ] ci: CI/CD changes
- [ ] build: Build system changes

## Breaking Changes

<!-- If this PR includes breaking changes, describe them here -->

- [ ] This PR includes breaking changes

If yes, mark your commit with `!` (e.g., `feat!: redesign API`) or include
`BREAKING CHANGE:` in the footer.

## Conventional Commit Examples

```text
feat: add workout interval summary to dashboard
fix: correct session cookie expiry handling
docs: update deployment instructions
refactor: simplify authentication middleware
feat!: redesign user authentication API
```

For breaking changes, use either:

```text
feat!: redesign user authentication API

or

feat: redesign user authentication API

BREAKING CHANGE: authentication endpoint moved from /auth to /api/auth
```

## Checklist

- [ ] My commits follow the conventional commit format
- [ ] I have tested my changes locally
- [ ] I have updated documentation if needed
- [ ] All tests pass
- [ ] Linting passes

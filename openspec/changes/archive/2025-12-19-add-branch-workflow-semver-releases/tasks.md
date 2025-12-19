# Implementation Tasks

## 1. Version Management

- [x] 1.1 Add initial version to `package.json` (0.1.0 or 1.0.0 based
      on maturity)
- [x] 1.2 Document semantic versioning and conventional commits in
      README or CONTRIBUTING

## 2. Conventional Commits Setup

- [x] 2.1 Add commitlint configuration to validate commit messages
- [x] 2.2 Add husky pre-commit hook for commitlint (optional but
      recommended)
- [x] 2.3 Create PR template with conventional commit examples
- [x] 2.4 Document conventional commit format (feat:, fix:, BREAKING
      CHANGE:)

## 3. GitHub Actions Workflow

- [x] 3.1 Create `.github/workflows/release.yml` workflow file
- [x] 3.2 Configure workflow to trigger on push to `main` branch
- [x] 3.3 Add semantic-release for automatic version bumping
- [x] 3.4 Configure automatic version bump based on conventional
      commits
- [x] 3.5 Add step to commit version bump back to `main`
- [x] 3.6 Add step to create git tag with version number
- [x] 3.7 Add Docker build step using bumped version tag
- [x] 3.8 Add Docker push step to Docker Hub with version tag
- [x] 3.9 Add Docker push step to Docker Hub with `latest` tag
- [x] 3.10 Configure Docker Hub credentials as GitHub secrets
      (DOCKER_USERNAME=bcl1713, DOCKER_TOKEN)
- [x] 3.11 Configure semantic-release plugins and settings
- [x] 3.12 Set up CHANGELOG.md generation

## 4. Automated Code Review

- [x] 4.1 Research and select automated code review solution (GitHub
      Actions with Claude, CodeRabbit, or similar)
- [x] 4.2 Configure automated code review to run on PRs
- [x] 4.3 Set up review comments and suggestions

## 5. Branch Protection

- [ ] 5.1 Configure branch protection rules for `main` (require PRs,
      status checks)
- [ ] 5.2 Require automated code review and CI checks to pass before
      merge
- [ ] 5.3 Allow GitHub Actions bot to push version commits to `main`
- [x] 5.4 Update DEVELOPMENT.md with new branch-based workflow

## 6. Documentation

- [x] 6.1 Update DEPLOYMENT.md with version-tagged Docker pull
      instructions (bcl1713/couch-to-5k:version)
- [x] 6.2 Document conventional commit format and examples
- [x] 6.3 Add examples of pulling specific versions vs latest
- [x] 6.4 Document how version bumps happen automatically
- [x] 6.5 Document automated code review process

## 7. Testing

- [ ] 7.1 Test workflow with a PR using conventional commits (feat:)
- [ ] 7.2 Verify version bumps automatically
- [ ] 7.3 Verify git tag is created
- [ ] 7.4 Verify Docker image is pushed with correct tags
- [ ] 7.5 Verify `latest` tag is updated
- [ ] 7.6 Test MAJOR, MINOR, and PATCH bumps with different commit
      types

## Notes

Tasks 5.1-5.3 and 7.1-7.6 require GitHub repository setup and will be
completed during deployment/testing phase. They cannot be completed
in local development.

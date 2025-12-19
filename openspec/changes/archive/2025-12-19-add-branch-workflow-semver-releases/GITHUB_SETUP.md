# GitHub Setup Instructions

This document contains the manual steps required to complete the
setup on GitHub.

## Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables
→ Actions, then add:

### 1. Docker Hub Credentials

- **Name:** `DOCKER_USERNAME`
- **Value:** `bcl1713`

- **Name:** `DOCKER_TOKEN`
- **Value:** Your Docker Hub access token

**To create a Docker Hub access token:**

1. Log in to Docker Hub
2. Go to Account Settings → Security
3. Click "New Access Token"
4. Name: "GitHub Actions - couch-to-5k"
5. Permissions: Read & Write
6. Copy the token and save it as `DOCKER_TOKEN` in GitHub Secrets

### 2. OpenAI API Key (Optional - for AI Code Review)

- **Name:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key

**Note:** This is optional. If you don't want AI code review, you can
remove the AI Code Review step from
`.github/workflows/code-review.yml`.

## Branch Protection Rules

Navigate to your GitHub repository → Settings → Branches → Add rule

### Main Branch Protection

**Branch name pattern:** `main`

**Enable the following:**

- [x] Require a pull request before merging
  - Required approvals: 0 (since you're sole maintainer)
  - Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Status checks that are required:
    - `review / Automated Code Review` (from code-review.yml)
    - `release / Release and Deploy` (from release.yml) - Optional
- [x] Require conversation resolution before merging
- [ ] Require signed commits (optional, recommended)
- [x] Allow specified actors to bypass required pull requests
  - Add: `github-actions[bot]` (for semantic-release commits)
- [x] Do not allow bypassing the above settings

Click "Create" or "Save changes" to apply the branch protection rule.

## First Release

After setting up secrets and branch protection:

1. **Create a feature branch:**

   ```bash
   git checkout -b feat/initial-release-setup
   ```

2. **Make a small change** (e.g., update README):

   ```bash
   echo "\n## Version 0.1.0\n" >> README.md
   git add README.md
   git commit -m "feat: add version information to README"
   ```

3. **Push and create PR:**

   ```bash
   git push -u origin feat/initial-release-setup
   ```

4. **Create Pull Request on GitHub**

5. **Wait for checks to pass:**
   - Code review workflow
   - Tests, linting, type checking

6. **Merge the PR**

7. **Watch the release workflow:**
   - Go to Actions tab
   - See "Release" workflow trigger
   - It will:
     - Bump version to 0.2.0 (feat = MINOR bump)
     - Create git tag
     - Generate CHANGELOG.md
     - Build Docker image
     - Push to bcl1713/couch-to-5k:0.2.0
     - Push to bcl1713/couch-to-5k:latest

## Verifying the Setup

After the first successful release:

1. **Check GitHub Releases:**
   - Go to Releases
   - You should see v0.2.0 with auto-generated changelog

2. **Check Docker Hub:**
   - Visit <https://hub.docker.com/r/bcl1713/couch-to-5k/tags>
   - You should see tags: `0.2.0` and `latest`

3. **Check local repo:**

   ```bash
   git checkout main
   git pull
   cat CHANGELOG.md  # Should have 0.2.0 entry
   ```

## Troubleshooting

### Release workflow fails with "push declined due to missing credentials"

- Ensure `GITHUB_TOKEN` has write permissions
- Check that `github-actions[bot]` is in bypass list for branch
  protection

### Docker push fails

- Verify `DOCKER_USERNAME` is set to `bcl1713`
- Verify `DOCKER_TOKEN` is a valid Docker Hub access token
- Check token has Read & Write permissions

### semantic-release says "no new version"

- Ensure commits follow conventional format
- Check that at least one `feat:` or `fix:` commit exists since last
  release

### AI code review not working

- If you don't have `OPENAI_API_KEY`, remove the AI review step
- Or use a different code review action (e.g., CodeRabbit)

## Next Steps

Once the first release is successful:

1. Use the branch-based workflow for all changes
2. Follow conventional commits
3. Create PRs for review
4. Merge to main to trigger automatic releases

See DEVELOPMENT.md for detailed workflow instructions.

# GitHub Setup Instructions

This document contains the manual steps required to complete the
setup on GitHub.

## Step 1: Configure GitHub Secrets (Repository Secrets)

Navigate to: **Settings → Secrets and variables → Actions → Secrets
tab**

Click **"New repository secret"** and add the following:

### 1. Docker Hub Credentials (Required)

**Secret Name:** `DOCKER_TOKEN`

**Value:** Your Docker Hub access token

**To create a Docker Hub access token:**

1. Log in to <https://hub.docker.com>
2. Click your profile → Account Settings → Security
3. Click "New Access Token"
4. Name: "GitHub Actions - couch-to-5k"
5. Access permissions: Read & Write
6. Click "Generate"
7. Copy the token (you won't see it again!)
8. Paste as the value for `DOCKER_TOKEN` in GitHub Secrets

**Note:** `DOCKER_USERNAME` is hardcoded as `bcl1713` in the workflow
file, so you don't need to add it as a secret.

### 2. OpenAI API Key (Optional - for AI Code Review)

**Secret Name:** `OPENAI_API_KEY`

**Value:** Your OpenAI API key

**To get an OpenAI API key:**

1. Go to <https://platform.openai.com/api-keys>
2. Create a new secret key
3. Copy and save it as `OPENAI_API_KEY` in GitHub Secrets

**Note:** If you don't have an OpenAI API key or don't want AI code
review, skip this and remove the "AI Code Review" step from
`.github/workflows/code-review.yml`.

## Step 2: Create a Branch Ruleset (Modern Approach)

GitHub now uses **Rulesets** instead of the old "Branch protection
rules". Rulesets are more flexible and powerful.

Navigate to: **Settings → Rules → Rulesets → New ruleset → New
branch ruleset**

### Basic Configuration

**Ruleset Name:** `main-branch-protection`

**Enforcement status:** Active

**Target branches:**

- Click "Add target"
- Select "Include default branch"
- This will protect `main`

### Configure Rules

Enable the following rules:

#### 1. Restrict creations, updates, and deletions

- [x] **Restrict creations** (prevents direct commits to main)
- [x] **Restrict updates** (forces use of pull requests)
- [ ] Restrict deletions (optional, prevents branch deletion)

#### 2. Require a pull request before merging

- [x] **Require a pull request before merging**
  - **Required approvals:** 0 (you're the sole maintainer)
  - [x] **Dismiss stale pull request approvals when new commits are
        pushed**
  - [ ] Require review from Code Owners (not needed for solo project)
  - [ ] Require approval of the most recent reviewable push (optional)
  - [x] **Require conversation resolution before merging**

#### 3. Require status checks to pass

- [x] **Require status checks to pass before merging**
  - [x] **Require branches to be up to date before merging**
  - **Status checks that are required:** After you create your first
    PR, you'll see available checks. Add:
    - `review / Automated Code Review` (from code-review.yml)

**Important:** Status checks won't appear in the list until they've
run at least once. You may need to:

1. Create the ruleset without status checks first
2. Create a test PR to trigger the workflows
3. Edit the ruleset to add the status checks after they appear

**Note:** Don't add `release / Release and Deploy` as a required
check - it only runs on push to `main`, not on PRs.

#### 4. Block force pushes

- [x] **Block force pushes** (recommended for main branch)

### Bypass List for Automation

**Important:** To allow semantic-release to push version commits back
to `main`, you need to configure bypass permissions.

**The Problem:** GitHub Actions using `GITHUB_TOKEN` runs as
`github-actions[bot]`, but you can't add bot accounts directly to the
bypass list in rulesets. Only GitHub Apps, teams, and roles can
bypass.

#### Solution: Use a Personal Access Token (Recommended for Solo Projects)

1. Go to **Settings (your user settings, not repo) → Developer
   settings → Personal access tokens → Tokens (classic)**
2. Click "Generate new token (classic)"
3. Name: "semantic-release-bot"
4. Expiration: Choose appropriate duration (90 days, 1 year, or no
   expiration)
5. Scopes: Check `repo` (Full control of private repositories)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)
8. Add to your repository secrets:
   - Go to your repo → Settings → Secrets and variables → Actions →
     Secrets
   - Click "New repository secret"
   - Name: `GH_TOKEN`
   - Value: Paste your personal access token
9. Update `.github/workflows/release.yml`:

   Find line 42-43:

   ```yaml
   - name: Semantic Release
     env:
       GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

   Change to:

   ```yaml
   - name: Semantic Release
     env:
       GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
   ```

10. Since the PAT has your user permissions, it will bypass the
    ruleset automatically - you don't need to configure a bypass list

#### Alternative: If You Don't Want to Use a PAT

If you prefer not to use a Personal Access Token, you can configure
the ruleset to allow the release workflow to fail the first time,
then manually merge the version bump commit. This is less automated
but doesn't require a PAT.

### Save the Ruleset

Click **"Create"** to save the ruleset.

## Step 3: Update the Release Workflow (If Using PAT)

If you created a Personal Access Token above, update the workflow
file:

```bash
# Open the file
nano .github/workflows/release.yml

# Find line 43 and change:
# GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
# To:
# GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}

# Save and commit
git add .github/workflows/release.yml
git commit -m "chore: use PAT for semantic-release to bypass branch protection"
git push
```

## First Release

After setting up secrets and branch protection:

1. **Create a feature branch:**

   ```bash
   git checkout -b feat/test-release-workflow
   ```

2. **Make a small change** (e.g., update README):

   ```bash
   echo -e "\n## Automated Releases\n\n" >> README.md
   echo "This project uses semantic versioning." >> README.md
   git add README.md
   git commit -m "feat: document automated release process"
   ```

3. **Push and create PR:**

   ```bash
   git push -u origin feat/test-release-workflow
   ```

4. **Create Pull Request on GitHub**

5. **Wait for checks to pass:**
   - Linting
   - Tests
   - Type checking
   - Formatting
   - AI Code Review (if configured)

6. **Merge the PR**

7. **Watch the release workflow:**
   - Go to Actions tab
   - See "Release" workflow trigger
   - It will:
     - Bump version to 0.2.0 (feat = MINOR bump)
     - Create git tag v0.2.0
     - Generate CHANGELOG.md
     - Create GitHub release
     - Build Docker image
     - Push to bcl1713/couch-to-5k:0.2.0
     - Push to bcl1713/couch-to-5k:latest

## Verifying the Setup

After the first successful release:

1. **Check GitHub Releases:**
   - Go to your repo → Releases
   - You should see v0.2.0 with auto-generated changelog

2. **Check Docker Hub:**
   - Visit <https://hub.docker.com/r/bcl1713/couch-to-5k/tags>
   - You should see tags: `0.2.0` and `latest`

3. **Check local repo:**

   ```bash
   git checkout main
   git pull
   cat CHANGELOG.md  # Should have 0.2.0 entry
   cat package.json | grep version  # Should show 0.2.0
   ```

## Troubleshooting

### Release workflow fails with refusing to allow a PAT

This happens when using a Personal Access Token with workflow file
modifications. Solution:

- When generating the PAT, also check the `workflow` scope
- Or, make workflow changes in a separate commit before the release

### Release workflow fails with "push declined due to missing credentials"

- Ensure you created the `GH_TOKEN` secret
- Verify the PAT has `repo` scope
- Check that you updated the workflow to use `secrets.GH_TOKEN`

### Docker push fails

- Verify `DOCKER_TOKEN` is set correctly in repository secrets
- Check the token has Read & Write permissions on Docker Hub
- Ensure the token hasn't expired

### semantic-release says "no new version"

- Ensure commits follow conventional format (`feat:`, `fix:`, etc.)
- Check that at least one `feat:` or `fix:` commit exists since last
  release
- Verify commitlint is validating your commits

### Status checks don't appear in ruleset configuration

- Status checks only appear after they've run at least once
- Create a test PR first to trigger the workflows
- Then edit the ruleset to add the checks

### AI code review not working

- If you don't have `OPENAI_API_KEY`, remove the AI review step from
  the workflow
- Or use a different action (the coderabbitai action may require
  separate configuration)

## Next Steps

Once the first release is successful:

1. Use the branch-based workflow for all changes
2. Follow conventional commits format
3. Create PRs for all changes
4. Let automation handle versioning and releases

See DEVELOPMENT.md for detailed workflow instructions.

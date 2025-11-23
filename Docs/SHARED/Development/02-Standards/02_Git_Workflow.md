# Git Workflow & Branch Strategy

## 📋 Overview

This document defines the Git workflow, branching strategy, and commit standards for the Clenergize V3 microservices migration project.

## 🌳 Branch Structure

```
main (production)
├── develop (integration)
│   ├── feature/SCRUM-XXX-description
│   ├── bugfix/SCRUM-XXX-description
│   ├── hotfix/SCRUM-XXX-description
│   └── release/vX.Y.Z
```

### Branch Types

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Required PR reviews, all tests must pass
- **Merge from**: `release/*` or `hotfix/*` only
- **Deploy to**: Production environment

#### `develop`
- **Purpose**: Integration branch for features
- **Protection**: Required PR reviews, tests must pass
- **Merge from**: `feature/*`, `bugfix/*`
- **Deploy to**: Development environment

#### `feature/*`
- **Naming**: `feature/SCRUM-XXX-brief-description`
- **Example**: `feature/SCRUM-101-jwt-verification`
- **Created from**: `develop`
- **Merged to**: `develop`
- **Lifetime**: Deleted after merge

#### `bugfix/*`
- **Naming**: `bugfix/SCRUM-XXX-brief-description`
- **Example**: `bugfix/SCRUM-150-token-expiry`
- **Created from**: `develop`
- **Merged to**: `develop`
- **Lifetime**: Deleted after merge

#### `hotfix/*`
- **Naming**: `hotfix/SCRUM-XXX-brief-description`
- **Example**: `hotfix/SCRUM-200-critical-auth-bypass`
- **Created from**: `main`
- **Merged to**: `main` AND `develop`
- **Lifetime**: Deleted after merge

#### `release/*`
- **Naming**: `release/vX.Y.Z`
- **Example**: `release/v1.0.0`
- **Created from**: `develop`
- **Merged to**: `main` AND back to `develop`
- **Lifetime**: Deleted after merge

## 📝 Commit Message Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **build**: Build system changes
- **ci**: CI/CD configuration changes
- **revert**: Reverting previous commits

### Scope (Service Names)
- `identity` - Identity service
- `organization` - Organization service
- `reference` - Reference service
- `activity` - Activity service
- `calculation` - Calculation service
- `reporting` - Reporting service
- `audit` - Audit service
- `frontend` - Frontend application
- `shared` - Shared libraries
- `infra` - Infrastructure

### Examples

```bash
# Feature commit
git commit -m "feat(identity): implement JWKS-based JWT verification

- Added JwtVerificationService with JWKS support
- Implemented RS256 algorithm validation
- Added token expiry and claims checking
- Replaced jwt.decode with jwt.verify

Resolves: SCRUM-101"

# Bug fix commit
git commit -m "fix(calculation): correct emission factor multiplication

- Fixed decimal precision issue in CO2 calculations
- Added unit tests for edge cases

Fixes: SCRUM-145"

# Documentation commit
git commit -m "docs: update API documentation for v2 endpoints

- Added new authentication endpoints
- Updated request/response examples
- Added rate limiting information"

# Chore commit
git commit -m "chore(deps): update NestJS to v10.3.0

- Updated all @nestjs/* packages
- Fixed breaking changes in guards
- Updated unit tests"
```

## 🔄 Workflow Process

### 1. Starting New Work

```bash
# Update local develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/SCRUM-XXX-description

# Update Jira
# Move ticket to "In Progress"
```

### 2. During Development

```bash
# Regular commits with clear messages
git add .
git commit -m "feat(service): implement feature part

- Detail 1
- Detail 2"

# Keep branch updated with develop
git fetch origin
git rebase origin/develop

# Push to remote
git push origin feature/SCRUM-XXX-description
```

### 3. Creating Pull Request

```bash
# Ensure all tests pass
npm test
npm run test:e2e
npm run security:scan

# Push final changes
git push origin feature/SCRUM-XXX-description

# Create PR via GitHub
```

#### PR Title Format
```
[SCRUM-XXX] Brief description of changes
```

#### PR Description Template
```markdown
## 🎯 Purpose
Brief description of what this PR does

## 🔗 Related Issue
Resolves: SCRUM-XXX

## ✅ Changes Made
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## 📸 Screenshots (if applicable)
[Add screenshots for UI changes]

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Security scan passed

## 📝 Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No sensitive data exposed
- [ ] Breaking changes documented
```

### 4. Code Review Process

#### Reviewer Responsibilities
- Check code quality and standards
- Verify test coverage
- Ensure security best practices
- Validate business logic
- Check for performance issues

#### Review Comments
- Be constructive and specific
- Suggest improvements
- Link to documentation when relevant
- Approve or request changes

### 5. Merging

```bash
# After approval, merge via GitHub
# Select "Squash and merge" for feature branches
# Use "Create a merge commit" for release/hotfix

# Delete remote branch after merge
git push origin --delete feature/SCRUM-XXX-description

# Delete local branch
git branch -d feature/SCRUM-XXX-description
```

## 🏷️ Tagging & Releases

### Version Format
Follow Semantic Versioning: `vMAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Creating Release

```bash
# Create release branch
git checkout -b release/v1.0.0 develop

# Final testing and fixes
# Update version numbers
# Update CHANGELOG.md

# Merge to main
git checkout main
git merge --no-ff release/v1.0.0

# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0

- Feature 1
- Feature 2
- Bug fixes"

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.0.0

# Push everything
git push origin main develop --tags

# Delete release branch
git branch -d release/v1.0.0
```

## 🚨 Hotfix Process

```bash
# Create from main
git checkout main
git pull origin main
git checkout -b hotfix/SCRUM-XXX-critical-fix

# Make fixes
# Test thoroughly

# Merge to main
git checkout main
git merge --no-ff hotfix/SCRUM-XXX-critical-fix
git tag -a v1.0.1 -m "Hotfix: Critical security patch"

# Merge to develop
git checkout develop
git merge --no-ff hotfix/SCRUM-XXX-critical-fix

# Push changes
git push origin main develop --tags

# Delete hotfix branch
git branch -d hotfix/SCRUM-XXX-critical-fix
```

## 📊 Git Hooks (Pre-commit)

### Setup
```bash
npm install --save-dev husky lint-staged
npx husky install
```

### Configuration (.husky/pre-commit)
```bash
#!/bin/sh
npm run lint
npm run test:unit
npm run security:scan
```

## 🔒 Security Guidelines

### Never Commit
- Passwords or secrets
- API keys or tokens
- Private keys or certificates
- `.env` files with real values
- AWS credentials
- Database connection strings with passwords

### Use Instead
- Environment variables
- AWS Secrets Manager
- `.env.example` files
- Placeholder values

## 📈 Metrics & Best Practices

### Commit Frequency
- Commit early and often
- Each commit should be atomic
- Commit should pass tests

### PR Size
- Keep PRs small (< 400 lines preferred)
- Single responsibility per PR
- Easier to review and test

### Branch Lifetime
- Feature branches: Max 1 week
- Release branches: Max 3 days
- Hotfix branches: Max 1 day

## 🛠️ Useful Git Commands

```bash
# Interactive rebase to clean commits
git rebase -i HEAD~3

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Update branch with latest develop
git fetch origin
git rebase origin/develop

# Cherry-pick specific commit
git cherry-pick <commit-hash>

# View branch graph
git log --graph --oneline --all

# Clean up local branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Find who changed a line
git blame <file>

# Search commits
git log --grep="SCRUM-101"
```

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| New feature | `git checkout -b feature/SCRUM-XXX-description` |
| Commit feature | `git commit -m "feat(service): description"` |
| New bugfix | `git checkout -b bugfix/SCRUM-XXX-description` |
| Commit fix | `git commit -m "fix(service): description"` |
| New hotfix | `git checkout -b hotfix/SCRUM-XXX-description` |
| Update branch | `git rebase origin/develop` |
| Create PR | Push branch and use GitHub UI |
| Tag release | `git tag -a v1.0.0 -m "Release v1.0.0"` |
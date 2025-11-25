# Claude Code Slash Commands

This directory contains custom slash commands for the Clenergize V3 development workflow.

## How Slash Commands Work

Each `.md` file in this directory becomes a slash command. The **filename** (without `.md`) is the command name.

Example: `pick-issue.md` → `/pick-issue`

## Available Commands

### Issue Management
| Command | Description | Arguments |
|---------|-------------|-----------|
| `/pick-issue` | Pick a Jira issue and start development | `<CLNZ-XXX \| next \| auto>` |
| `/workflow-status` | Show overall workflow progress | - |
| `/complete-issue` | Mark issue as complete | `[CLNZ-XXX]` |
| `/list-issues` | List Jira issues from backlog | `[todo \| in-progress \| high-priority]` |
| `/issue-status` | Check status of a specific issue | `<CLNZ-XXX>` |

### Development
| Command | Description | Arguments |
|---------|-------------|-----------|
| `/start-dev` | Begin development on current issue | - |
| `/self-review` | Run self-review checklist | - |
| `/run-tests` | Execute test suite | `[unit \| integration \| e2e \| all]` |
| `/test-coverage` | Check test coverage | - |

### Pull Requests
| Command | Description | Arguments |
|---------|-------------|-----------|
| `/create-pr` | Create a comprehensive PR | - |
| `/pr-status` | Check current PR status | - |
| `/request-review` | Request code review | - |
| `/merge-pr` | Merge the approved PR | - |

### Code Review
| Command | Description | Arguments |
|---------|-------------|-----------|
| `/review-all` | Run all review stages | - |
| `/review-logic` | Review implementation logic | - |
| `/review-quality` | Review code quality | - |
| `/review-security` | Review security aspects | - |
| `/review-performance` | Review performance | - |
| `/approve-pr` | Approve the PR | - |
| `/request-changes` | Request changes on PR | `<reason>` |

## Command File Format

Each command file uses this structure:

```markdown
---
description: Brief description shown in /help
argument-hint: <required> [optional]
allowed-tools: Tool1, Tool2(pattern:*)
model: claude-opus-4-5-20251101
---

# Command Name

Your prompt instructions here.

Use $ARGUMENTS for all arguments or $1, $2 for positional.
```

### Frontmatter Fields
- `description`: Shown in autocomplete and `/help`
- `argument-hint`: Shows expected arguments format
- `allowed-tools`: Tools the command can use
- `model`: Specific model to use (optional)

## Complete Workflow Example

```bash
# 1. Pick an issue from Jira
/pick-issue CLNZ-170

# 2. Start development
/start-dev

# 3. [Write code...]

# 4. Self-review before PR
/self-review

# 5. Run tests
/run-tests

# 6. Create PR
/create-pr

# 7. Request review
/request-review

# 8. After approval, merge
/merge-pr
```

## Reference Documentation

The `docs/` subdirectory contains detailed reference documentation for the MCP executor patterns used in this project. These are NOT executable commands.

## Configuration

- **Jira Cloud ID**: `321128eb-5b74-4a90-896a-2a44197f6673`
- **Project Key**: `CLNZ`
- **Base Branch**: `develop`
- **Branch Prefix**: `feature/CLNZ-`

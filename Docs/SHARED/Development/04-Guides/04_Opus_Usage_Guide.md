# Claude Opus 4.5 - Standard Model for All Agents

## Overview

**All Clenergize V3 agents now use Claude Opus 4.5 as their default model.**

Claude Opus 4.5 is available without usage limits or cost restrictions, making it the ideal choice for all development tasks - from simple CRUD operations to complex security architecture and emission calculations.

## Model Configuration

All sub-agents are configured with:

```yaml
model: opus
```

This corresponds to Claude Opus 4.5, which provides:
- Advanced reasoning capabilities
- Complex problem-solving
- Multi-step logical analysis
- Security-critical implementations
- Performance optimization
- No usage restrictions

## Benefits

### No More Model Selection Decisions
Previously, developers had to decide between Sonnet and Opus 4.1 based on task complexity. With Opus 4.5 as the standard, there's no need for this decision-making overhead.

### Consistent Quality
All tasks receive the same high-quality reasoning and implementation capabilities, ensuring consistent code quality across the entire platform.

### Simplified Configuration
All agents use the same model configuration, simplifying setup and maintenance.

## Agent Configuration

All 14 sub-agents use `model: opus`:

| Agent | Configuration |
|-------|---------------|
| activity-agent | `model: opus` |
| architecture-agent | `model: opus` |
| audit-agent | `model: opus` |
| calculation-agent | `model: opus` |
| devops-agent | `model: opus` |
| frontend-agent | `model: opus` |
| identity-agent | `model: opus` |
| master-coordinator | `model: opus` |
| migration-agent | `model: opus` |
| organization-agent | `model: opus` |
| reference-agent | `model: opus` |
| reporting-agent | `model: opus` |
| security-agent | `model: opus` |
| testing-agent | `model: opus` |

## Historical Note

This guide replaces the previous "Opus 4.1 Usage Guide" which contained restrictions and decision matrices for when to use Opus 4.1 vs Sonnet. Those restrictions are no longer applicable with Opus 4.5.

---

**Last Updated**: November 2024
**Version**: 2.0.0 - Opus 4.5 Standard

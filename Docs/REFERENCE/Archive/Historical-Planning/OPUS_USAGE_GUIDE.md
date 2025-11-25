# Opus Usage Guide - ARCHIVED

> **⚠️ ARCHIVED DOCUMENT**: This guide has been superseded by the Opus 4.5 standard.
>
> **See**: [04_Opus_Usage_Guide.md](../../../SHARED/Development/04-Guides/04_Opus_Usage_Guide.md) for current documentation.

---

## Historical Context

This document previously contained guidelines for when to use Opus 4.1 versus Claude Sonnet, including:
- Decision trees for model selection
- Task categorization by complexity
- Cost tracking templates
- Budget allocation guidelines

## Current Standard

**All Clenergize V3 agents now use Claude Opus 4.5 as their default model.**

Claude Opus 4.5 is available without usage limits or cost restrictions. The previous restrictions and decision matrices are no longer applicable.

### Key Changes

| Previous (Opus 4.1) | Current (Opus 4.5) |
|--------------------|--------------------|
| Reserved for complex tasks only | Standard for all tasks |
| 5% of work budget | Unlimited usage |
| Required justification | No restrictions |
| Cost tracking required | No cost tracking needed |
| Model selection overhead | Simplified - always use Opus |

## Configuration

All sub-agents use:
```yaml
model: opus
```

---

**Archived**: November 2024
**Reason**: Opus 4.5 standard eliminates need for model selection decisions

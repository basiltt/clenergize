---
description: Review code quality only
allowed-tools: Read, Grep, Glob, Bash(npm:*)
model: claude-opus-4-5-20251101
---

# Review Quality Command

Review code quality of current changes.

## Quality Checks

### 1. SOLID Principles
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

### 2. Naming Conventions
- Clear, descriptive names
- Consistent casing (camelCase for variables, PascalCase for classes)
- No abbreviations without context

### 3. Code Readability
- Functions are short and focused
- Clear control flow
- Minimal nesting
- Appropriate comments

### 4. DRY Compliance
- No duplicated code
- Shared utilities used appropriately
- Constants extracted

### 5. TypeScript Best Practices
- No `any` types
- Proper interface definitions
- Strict mode compliance

## Output Format

```
## Code Quality Review

### SOLID Principles
| Principle | Compliance | Notes |
|-----------|------------|-------|
| SRP | ✅/⚠️/❌ | [Notes] |
| OCP | ✅/⚠️/❌ | [Notes] |
| LSP | ✅/⚠️/❌ | [Notes] |
| ISP | ✅/⚠️/❌ | [Notes] |
| DIP | ✅/⚠️/❌ | [Notes] |

### Naming & Readability
- [Findings]

### DRY Violations
- [File:line] - [Description]

### TypeScript Issues
- [Finding 1]
- [Finding 2]

### Code Smells Detected
- [Smell 1] at [location]
- [Smell 2] at [location]

### Recommendation
**Score**: [X/10]
**Status**: [PASS / NEEDS_WORK]
```

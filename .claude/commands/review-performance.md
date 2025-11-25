---
description: Review performance aspects only
allowed-tools: Read, Grep, Glob
model: claude-opus-4-5-20251101
---

# Review Performance Command

Review performance aspects of current changes.

## Performance Checks

### 1. Database Queries
- N+1 query detection
- Missing indexes
- Inefficient queries
- Transaction handling

### 2. Algorithm Efficiency
- Time complexity
- Space complexity
- Loop optimization

### 3. Memory Management
- Memory leaks
- Large object handling
- Stream usage for large data

### 4. Caching
- Cache utilization
- Cache invalidation
- Cache key design

### 5. Async Operations
- Proper await usage
- Parallel execution opportunities
- Blocking operations

### 6. API Performance
- Response payload size
- Pagination implementation
- Compression

## Patterns to Check

```bash
# Find potential N+1 queries (find inside loops)
grep -rn "await.*find" src/ --include="*.ts" -A 5 | grep -B 5 "for\|forEach\|map"

# Check for missing pagination
grep -rn "find()" src/ --include="*.ts"

# Large array operations
grep -rn "\.map\|\.filter\|\.reduce" src/ --include="*.ts"
```

## Output Format

```
## Performance Review

### Database Performance
| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| N+1 Query | High | [file:line] | [Fix] |
| Missing Index | Medium | [field] | [Add index] |

### Algorithm Analysis
- [Finding with complexity analysis]

### Memory Concerns
- [Findings]

### Caching Opportunities
- [Recommendations]

### API Performance
- Payload sizes: [Assessment]
- Pagination: [Implemented/Missing]

### Recommendations
1. [High priority optimization]
2. [Medium priority optimization]
3. [Nice to have]

### Score
**Performance Score**: [X/10]
**Blocking Issues**: [None/List]
```

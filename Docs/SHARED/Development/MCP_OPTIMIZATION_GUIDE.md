# MCP Server Context Optimization Guide

> **Problem**: 19 MCP servers consuming ~100% context before work begins
> **Solution**: Minimal base config + runtime toggling via `/mcp`

## Current Configuration

### Active Servers (4 Essential)
| Server | Purpose |
|--------|---------|
| `filesystem` | File operations |
| `mongodb-general` | All databases via `database` parameter |
| `memory` | Context persistence |
| `fetch` | External resources |

### Disabled Servers (15)
Stored in `~/.claude/mcp-servers-disabled.json` for easy re-enabling.

---

## Runtime Server Management with `/mcp`

### Quick Commands

```
/mcp                    # View all servers, toggle on/off
@github                 # Toggle GitHub server
@docker                 # Toggle Docker server
@localstack             # Toggle LocalStack server
```

### Workflow Example

**Task: Working on Identity Service with GitHub PR**

1. Start Claude Code (loads 4 essential servers)
2. Type `@github` to enable GitHub tools
3. Work on your task
4. Use `/mcp` to disable when done

**Task: DevOps/Infrastructure Work**

1. Type `@docker @localstack` to enable both
2. Work on containers/AWS simulation
3. Disable when switching tasks

---

## Context Optimization Strategies

1. **Minimal Base Config** - Only 4 essential servers always loaded
2. **Runtime Toggling** - Use `/mcp` or `@server-name` as needed
3. **MongoDB Consolidation** - Single server accesses all DBs
4. **Monitor with `/context`** - Track context usage

---

## Using MongoDB with Single Server

With `mongodb-general`, access any database by specifying the `database` parameter:

```javascript
// Query identity service database
mcp__mongodb-general__find({
  database: "clenergize_identity",
  collection: "users",
  filter: { status: "active" }
})

// Query organization service database
mcp__mongodb-general__find({
  database: "clenergize_organization",
  collection: "projects"
})

// Query calculation service database
mcp__mongodb-general__aggregate({
  database: "clenergize_calculation",
  collection: "emissions",
  pipeline: [{ $match: { year: 2024 } }]
})
```

### Database Names Reference
| Service | Database Name |
|---------|--------------|
| Identity | `clenergize_identity` |
| Organization | `clenergize_organization` |
| Reference | `clenergize_reference` |
| Activity | `clenergize_activity` |
| Calculation | `clenergize_calculation` |
| Reporting | `clenergize_reporting` |
| Audit | `clenergize_audit` |

---

## Server Quick Reference

### To Re-enable a Server Permanently

Copy from `~/.claude/mcp-servers-disabled.json` to `~/.claude/.claude.json`:

```json
{
  "mcpServers": {
    // ... existing servers ...
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token" }
    }
  }
}
```

---

## Detailed Server Categorization

### Essential (Always Enabled)
These provide core functionality needed for most tasks:
- `filesystem` - File operations
- `memory` - Context persistence
- `fetch` - External resources

### Database (Enable Per-Service)
Enable only the database you're actively working on:
- `mongodb-identity` - Identity service work
- `mongodb-organization` - Organization service work
- `mongodb-reference` - Reference data work
- `mongodb-activity` - Activity data work
- `mongodb-calculation` - Calculation work
- `mongodb-reporting` - Reporting work
- `mongodb-audit` - Audit logging work
- `mongodb-general` - Cross-service queries (Admin only)

### DevOps/Testing (Enable When Needed)
- `docker` - Container management
- `localstack` - AWS simulation
- `playwright` - E2E testing

### Specialized (Disable by Default)
- `chrome-devtools` - Browser debugging
- `mcp-axe` - Accessibility testing
- `mui-mcp` - MUI component help
- `mssql-mcp` - SQL Server (different project!)
- `atlassian` - Jira/Confluence
- `sequential-thinking` - Complex reasoning

---

## Strategy 2: Task-Based Profiles

### Profile: Identity Service Development
```bash
# Enable only these MCP servers:
- filesystem
- mongodb-identity
- fetch
- memory
```
**Estimated Context**: ~15-20k tokens (vs 100k+)

### Profile: Organization Service Development
```bash
# Enable only these MCP servers:
- filesystem
- mongodb-organization
- fetch
- memory
```
**Estimated Context**: ~15-20k tokens

### Profile: Database Migration
```bash
# Enable only these MCP servers:
- filesystem
- mongodb-general
- mongodb-identity
- mongodb-organization
- memory
```
**Estimated Context**: ~25-30k tokens

### Profile: Frontend Development
```bash
# Enable only these MCP servers:
- filesystem
- fetch
- playwright
- memory
```
**Estimated Context**: ~20-25k tokens

### Profile: Infrastructure/DevOps
```bash
# Enable only these MCP servers:
- filesystem
- docker
- localstack
- memory
```
**Estimated Context**: ~20-25k tokens

### Profile: Full Development (When Needed)
```bash
# All essential servers enabled
# Use sparingly - high context cost
```

---

## Strategy 3: Implementation

### Option A: Project-Level MCP Configuration

Create task-specific `.mcp.json` files in your project:

**File: `.claude/mcp-identity.json`**
```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem"],
      "env": {
        "MCP_ALLOWED_PATHS": "C:\\Users\\ttbasil\\Desktop\\Projects\\FullStackProjects\\ClenergizeV3"
      }
    },
    "mongodb-identity": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-mongodb"],
      "env": {
        "MONGODB_URI": "mongodb://admin:localdev123@localhost:27017/clenergize_identity?authSource=admin"
      }
    },
    "memory": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    }
  }
}
```

**File: `.claude/mcp-minimal.json`**
```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem"]
    },
    "memory": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    }
  }
}
```

### Option B: Runtime Server Toggling

Use `/mcp` command to toggle servers during a session:

```
/mcp                           # View all servers and toggle on/off
@mongodb-identity              # Toggle specific server
```

### Option C: Update Global Configuration

Edit `~/.claude.json` to disable non-essential servers by default.

**Before** (all enabled):
```json
{
  "mcpServers": {
    "chrome-devtools": { ... },
    "mcp-axe": { ... },
    "mui-mcp": { ... },
    "mssql-mcp": { ... }
  }
}
```

**After** (disabled):
```json
{
  "mcpServers": {
    // Disabled - uncomment when needed
    // "chrome-devtools": { ... },
    // "mcp-axe": { ... },
    // "mui-mcp": { ... },
    // "mssql-mcp": { ... }
  }
}
```

---

## Strategy 4: MongoDB Server Consolidation

### Current: 7 Separate MongoDB MCP Servers

Each MongoDB server adds ~5-8k tokens of tool definitions.

### Recommended: Consolidate to 2-3 Servers

**Option 1: Single MongoDB Server with Database Parameter**

Instead of separate servers per database, use a single server that accepts database name as a parameter:

```json
{
  "mongodb": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic-ai/mcp-server-mongodb"],
    "env": {
      "MONGODB_URI": "mongodb://admin:localdev123@localhost:27017/?authSource=admin"
    }
  }
}
```

Tools accept `database` parameter:
- `mcp__mongodb__find({ database: "clenergize_identity", collection: "users" })`
- `mcp__mongodb__find({ database: "clenergize_organization", collection: "projects" })`

**Savings**: ~35-40k tokens (from 7 servers to 1)

**Option 2: Keep 2-3 for Common Workflows**

- `mongodb-general` - Admin/cross-database queries
- `mongodb-current` - Current service being worked on (swap as needed)

---

## Strategy 5: Context Monitoring

### Check Current Context Usage
```
/context
```

### Expected Results After Optimization

| Configuration | Expected Context | Savings |
|--------------|------------------|---------|
| Current (19 servers) | ~100k tokens | Baseline |
| After disabling 4 unused | ~80k tokens | 20% |
| After MongoDB consolidation | ~45k tokens | 55% |
| Task-specific profile | ~15-25k tokens | 75-85% |

---

## Immediate Actions

### Step 1: Disable Unused Servers Now

Edit `~/.claude.json` and comment out:
- `mssql-mcp` (Q2O project, not Clenergize)
- `chrome-devtools` (enable when debugging)
- `mcp-axe` (enable for accessibility testing)
- `mui-mcp` (enable for MUI work)

### Step 2: Test Context Reduction
```
/context
```

### Step 3: Use `/mcp` for Runtime Control
Toggle servers on/off as needed during sessions.

### Step 4: Consider MongoDB Consolidation
Evaluate if 1-2 MongoDB servers can replace 7.

---

## References

- [Claude Code MCP Documentation](https://docs.claude.com/en/docs/claude-code/mcp)
- [MCP Server Context Optimization - Scott Spence](https://scottspence.com/posts/optimising-mcp-server-context-usage-in-claude-code)
- [Feature Request: Lazy Loading - GitHub #7336](https://github.com/anthropics/claude-code/issues/7336)
- [Feature Request: Tool Filtering - GitHub #7328](https://github.com/anthropics/claude-code/issues/7328)

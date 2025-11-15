#!/bin/bash

# ============================================================
# Claude Code Multi-Agent System Validation Script
# Clenergize V3 Migration Project
# ============================================================

# set -e  # Commented out to allow script to continue on errors

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNINGS=0

# Function to print colored output
print_status() {
    if [ "$1" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED_CHECKS++))
        ((TOTAL_CHECKS++))
    elif [ "$1" = "FAIL" ]; then
        echo -e "${RED}✗${NC} $2"
        ((TOTAL_CHECKS++))
    elif [ "$1" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $2"
        ((WARNINGS++))
        ((TOTAL_CHECKS++))
    elif [ "$1" = "INFO" ]; then
        echo -e "${BLUE}ℹ${NC} $2"
        # INFO messages don't count as checks
    fi
}

print_header() {
    echo ""
    echo "============================================"
    echo "$1"
    echo "============================================"
}

# Start validation
echo "🚀 Claude Code Multi-Agent System Validator"
echo "   Clenergize V3 Migration Project"
echo "   Version: 1.0.0"
echo "   Date: $(date)"
echo ""

# ============================================================
# 1. Check Directory Structure
# ============================================================
print_header "1. Directory Structure Validation"

# Check .claude directory
if [ -d ".claude" ]; then
    print_status "PASS" ".claude directory exists"
else
    print_status "FAIL" ".claude directory not found"
    exit 1
fi

# Check subdirectories
REQUIRED_DIRS=("agents" "skills" "commands")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d ".claude/$dir" ]; then
        print_status "PASS" ".claude/$dir directory exists"
    else
        print_status "FAIL" ".claude/$dir directory not found"
    fi
done

# Check OLD and NEW directories
if [ -d "OLD" ]; then
    print_status "PASS" "OLD directory exists (legacy code)"
    OLD_COUNT=$(find OLD -maxdepth 1 -type d | wc -l)
    print_status "INFO" "Found $((OLD_COUNT-1)) OLD services"
else
    print_status "WARN" "OLD directory not found (needed for reference)"
fi

if [ -d "NEW" ]; then
    print_status "PASS" "NEW directory exists (clean architecture)"
    NEW_COUNT=$(find NEW -maxdepth 1 -type d 2>/dev/null | wc -l)
    print_status "INFO" "Found $((NEW_COUNT-1)) NEW services"
else
    print_status "WARN" "NEW directory not found (will be created)"
fi

# ============================================================
# 2. Check Agent Configuration Files
# ============================================================
print_header "2. Agent Configuration Files"

EXPECTED_AGENTS=(
    "master-coordinator"
    "architecture-agent"
    "security-agent"
    "identity-agent"
    "organization-agent"
    "reference-agent"
    "activity-agent"
    "calculation-agent"
    "reporting-agent"
    "audit-agent"
    "frontend-agent"
    "devops-agent"
    "testing-agent"
    "migration-agent"
)

AGENT_COUNT=0
for agent in "${EXPECTED_AGENTS[@]}"; do
    if [ -f ".claude/agents/${agent}.md" ]; then
        print_status "PASS" "${agent}.md exists"
        ((AGENT_COUNT++))
    else
        print_status "FAIL" "${agent}.md not found"
    fi
done

print_status "INFO" "Found ${AGENT_COUNT}/14 agent configuration files"

# ============================================================
# 3. Check Skill Files
# ============================================================
print_header "3. Skill Files"

EXPECTED_SKILLS=(
    "nestjs-service-generator"
    "jwt-verification-fix"
    "hierarchy-migration"
    "sqs-polling-fix"
    "mongodb-transaction-helper"
    "denormalization-fix"
    "error-taxonomy"
    "event-contracts"
    "security-scanner"
    "performance-optimizer"
)

SKILL_COUNT=0
for skill in "${EXPECTED_SKILLS[@]}"; do
    if [ -f ".claude/skills/${skill}.md" ]; then
        print_status "PASS" "${skill}.md exists"
        ((SKILL_COUNT++))
    else
        print_status "FAIL" "${skill}.md not found"
    fi
done

print_status "INFO" "Found ${SKILL_COUNT}/10 skill files"

# ============================================================
# 4. Check Command Files
# ============================================================
print_header "4. Command Category Files"

EXPECTED_COMMANDS=(
    "project-commands"
    "development-commands"
    "security-commands"
    "migration-commands"
    "testing-commands"
)

COMMAND_COUNT=0
for cmd in "${EXPECTED_COMMANDS[@]}"; do
    if [ -f ".claude/commands/${cmd}.md" ]; then
        print_status "PASS" "${cmd}.md exists"
        ((COMMAND_COUNT++))
    else
        print_status "FAIL" "${cmd}.md not found"
    fi
done

print_status "INFO" "Found ${COMMAND_COUNT}/5 command files"

# ============================================================
# 5. Check Critical Configuration Files
# ============================================================
print_header "5. Critical Configuration Files"

# Check CLAUDE.md
if [ -f ".claude/CLAUDE.md" ]; then
    print_status "PASS" "CLAUDE.md (master config) exists"
    # Check if it contains critical sections
    if grep -q "CRITICAL CONTEXT" ".claude/CLAUDE.md" 2>/dev/null; then
        print_status "PASS" "CLAUDE.md contains critical context"
    fi
else
    print_status "FAIL" "CLAUDE.md not found - this is critical!"
fi

# Check settings.local.json
if [ -f ".claude/settings.local.json" ]; then
    print_status "PASS" "settings.local.json exists"
    # Verify it has permissions configured
    if grep -q "permissions" ".claude/settings.local.json" 2>/dev/null; then
        print_status "PASS" "Permissions configured in settings"
    fi
else
    print_status "WARN" "settings.local.json not found"
fi

# Check QUICKSTART.md
if [ -f ".claude/QUICKSTART.md" ]; then
    print_status "PASS" "QUICKSTART.md exists"
else
    print_status "WARN" "QUICKSTART.md not found"
fi

# ============================================================
# 6. Check for Critical Issues Patterns
# ============================================================
print_header "6. Security Pattern Checks"

# Check for jwt.decode usage in NEW code (should not exist)
if [ -d "NEW" ]; then
    JWT_DECODE_COUNT=$(grep -r "jwt\.decode" NEW 2>/dev/null | grep -v "jwt\.verify" | wc -l || echo 0)
    if [ "$JWT_DECODE_COUNT" -eq 0 ]; then
        print_status "PASS" "No unsafe jwt.decode found in NEW code"
    else
        print_status "FAIL" "Found $JWT_DECODE_COUNT unsafe jwt.decode instances!"
    fi
fi

# Check for hardcoded secrets patterns
if [ -d "NEW" ]; then
    SECRET_PATTERNS=("default-secret" "hardcoded-key" "test-password" "|| 'fallback")
    FOUND_SECRETS=0
    for pattern in "${SECRET_PATTERNS[@]}"; do
        COUNT=$(grep -r "$pattern" NEW 2>/dev/null | wc -l || echo 0)
        FOUND_SECRETS=$((FOUND_SECRETS + COUNT))
    done

    if [ "$FOUND_SECRETS" -eq 0 ]; then
        print_status "PASS" "No hardcoded secrets found"
    else
        print_status "FAIL" "Found $FOUND_SECRETS potential hardcoded secrets!"
    fi
fi

# ============================================================
# 7. Check Docker Environment
# ============================================================
print_header "7. Docker Environment"

# Check for docker-compose file
if [ -f "docker-compose.dev.yml" ] || [ -f "docker-compose.yml" ]; then
    print_status "PASS" "Docker compose file exists"
else
    print_status "WARN" "Docker compose file not found"
fi

# Check if Docker is running
if command -v docker &> /dev/null; then
    print_status "PASS" "Docker is installed"
    if docker info &> /dev/null; then
        print_status "PASS" "Docker daemon is running"
    else
        print_status "WARN" "Docker daemon is not running"
    fi
else
    print_status "WARN" "Docker not found"
fi

# ============================================================
# 8. Check Service Ports
# ============================================================
print_header "8. Service Port Availability"

# Define service ports
declare -A SERVICE_PORTS=(
    ["Identity"]=3001
    ["Organization"]=3002
    ["Reference"]=3003
    ["Activity"]=3004
    ["Calculation"]=3005
    ["Reporting"]=3006
    ["Audit"]=3007
    ["MongoDB"]=27017
    ["Redis"]=6379
)

# Check if ports are available or in use
for service in "${!SERVICE_PORTS[@]}"; do
    port="${SERVICE_PORTS[$service]}"
    if command -v netstat &> /dev/null; then
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_status "INFO" "Port $port ($service) is in use"
        else
            print_status "INFO" "Port $port ($service) is available"
        fi
    fi
done

# ============================================================
# 9. Check for Required Dependencies
# ============================================================
print_header "9. Required Dependencies"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "PASS" "Node.js installed: $NODE_VERSION"
else
    print_status "FAIL" "Node.js not found"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "PASS" "npm installed: $NPM_VERSION"
else
    print_status "FAIL" "npm not found"
fi

# Check git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    print_status "PASS" "Git installed: $GIT_VERSION"
else
    print_status "FAIL" "Git not found"
fi

# ============================================================
# 10. Sprint Status Check
# ============================================================
print_header "10. Sprint 0.1 Status"

print_status "INFO" "Current Sprint: 0.1 - Security Foundation & Local Development"
print_status "INFO" "Duration: 10 days"
print_status "INFO" "Story Points: 45"

# List critical tasks for Sprint 0.1
echo ""
echo "Critical Sprint 0.1 Tasks:"
echo "  [ ] Fix JWT verification (C1) - CRITICAL"
echo "  [ ] Remove hardcoded secrets (C7) - CRITICAL"
echo "  [ ] Setup Docker environment - HIGH"
echo "  [ ] Create base service templates - HIGH"
echo "  [ ] Implement transaction boundaries (C6) - HIGH"

# ============================================================
# Final Report
# ============================================================
print_header "Validation Summary"

FAILED_CHECKS=$((TOTAL_CHECKS - PASSED_CHECKS - WARNINGS))
SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo ""
echo "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
echo "Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ "$FAILED_CHECKS" -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDATION PASSED!${NC}"
    echo "The Claude Code multi-agent system is properly configured."
    echo ""
    echo "Next steps:"
    echo "1. Review .claude/QUICKSTART.md for usage instructions"
    echo "2. Run: /sprint-status to check current sprint"
    echo "3. Start with: /fix-old-issue C1 identity-service"
    exit 0
elif [ "$FAILED_CHECKS" -lt 5 ]; then
    echo -e "${YELLOW}⚠️  VALIDATION PASSED WITH WARNINGS${NC}"
    echo "The system is mostly configured but has some issues."
    echo "Review the failed checks above and fix them."
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo "Critical components are missing. Please check:"
    echo "1. Ensure all agent files are created"
    echo "2. Verify skill files exist"
    echo "3. Check command files are present"
    exit 1
fi
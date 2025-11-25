# Development Checklist

## 📋 Story Lifecycle Checklist

This checklist ensures consistent, high-quality delivery for every story in the Clenergize V3 project. Each story must complete all items before being marked as "Done".

## 🏁 Story Start Checklist

### Planning & Setup
- [ ] **Jira Ticket Review**
    - [ ] Story details understood
    - [ ] Acceptance criteria clear
    - [ ] Story points verified
    - [ ] Dependencies identified
    - [ ] Questions clarified with team

- [ ] **Technical Planning**
    - [ ] Technical approach documented
    - [ ] Service(s) identified
    - [ ] Database schema planned
    - [ ] API contracts defined
    - [ ] Security considerations noted

- [ ] **Environment Setup**
    - [ ] Docker services running
    - [ ] Database accessible
    - [ ] MCP servers connected
    - [ ] Latest `develop` branch pulled

- [ ] **Jira Updates**
    - [ ] Story moved to "In Progress"
    - [ ] Assignee set
    - [ ] Start date logged
    - [ ] Initial comment added

- [ ] **Branch Creation**
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feature/CLNZ-XXX-description
  ```

## 💻 Development Checklist

### Code Implementation
- [ ] **Service Structure**
    - [ ] Module created with proper naming
    - [ ] Controller implemented with decorators
    - [ ] Service layer with business logic
    - [ ] Repository/DAO layer for data access
    - [ ] DTOs for request/response validation

- [ ] **Security Implementation**
    - [ ] Authentication guards applied
    - [ ] Authorization checks implemented
    - [ ] Input validation on all endpoints
    - [ ] SQL injection prevention
    - [ ] XSS prevention measures
    - [ ] Rate limiting configured
    - [ ] Secrets from environment variables

- [ ] **Error Handling**
    - [ ] Try-catch blocks for async operations
    - [ ] Custom exceptions defined
    - [ ] Error responses standardized
    - [ ] Logging for errors
    - [ ] User-friendly error messages

- [ ] **Database**
    - [ ] Schema/Model defined
    - [ ] Migrations created
    - [ ] Indexes optimized
    - [ ] Transactions where needed
    - [ ] Connection pooling configured

### Testing
- [ ] **Unit Tests**
    - [ ] Service methods tested
    - [ ] Controller endpoints tested
    - [ ] Edge cases covered
    - [ ] Mocks properly configured
    - [ ] Coverage ≥ 80%
  ```bash
  npm run test:unit
  npm run test:cov
  ```

- [ ] **Integration Tests**
    - [ ] API endpoints tested
    - [ ] Database operations verified
    - [ ] External service calls mocked
    - [ ] Error scenarios tested
  ```bash
  npm run test:e2e
  ```

- [ ] **Security Testing**
    - [ ] Security scan passed
    - [ ] Dependency vulnerabilities checked
    - [ ] OWASP Top 10 considered
    - [ ] Authentication tested
    - [ ] Authorization tested
  ```bash
  npm run security:scan
  npm audit
  ```

### Code Quality
- [ ] **Linting & Formatting**
    - [ ] ESLint rules passed
    - [ ] Prettier formatting applied
    - [ ] No console.logs in production code
    - [ ] No commented-out code
  ```bash
  npm run lint
  npm run format
  ```

- [ ] **Code Review Prep**
    - [ ] Self-review completed
    - [ ] Complex logic commented
    - [ ] TODO comments resolved
    - [ ] Magic numbers extracted to constants
    - [ ] DRY principle followed
    - [ ] SOLID principles applied

### Documentation
- [ ] **Code Documentation**
    - [ ] JSDoc comments on public methods
    - [ ] Complex algorithms explained
    - [ ] README updated if needed
    - [ ] Environment variables documented

- [ ] **API Documentation**
    - [ ] OpenAPI/Swagger annotations added
    - [ ] Request/Response examples provided
    - [ ] Error codes documented
    - [ ] Rate limits specified

## 🔄 Pull Request Checklist

### Before Creating PR
- [ ] **Final Checks**
    - [ ] All tests passing locally
    - [ ] Branch up to date with develop
    - [ ] Commits squashed if needed
    - [ ] Commit messages follow convention
  ```bash
  git fetch origin
  git rebase origin/develop
  npm run test
  npm run lint
  ```

### PR Creation
- [ ] **PR Details**
    - [ ] Title format: `[CLNZ-XXX] Brief description`
    - [ ] Description template filled
    - [ ] Jira ticket linked
    - [ ] Screenshots added (if UI changes)
    - [ ] Breaking changes noted
    - [ ] Reviewers assigned

- [ ] **PR Description Includes**
  ```markdown
  ## Purpose
  [What this PR does]
  
  ## Related Issue
  Resolves: CLNZ-XXX
  
  ## Changes Made
  - Change 1
  - Change 2
  
  ## Testing
  - Unit tests: ✅
  - Integration tests: ✅
  - Manual testing: ✅
  
  ## Checklist
  - [ ] Tests added/updated
  - [ ] Documentation updated
  - [ ] Security scan passed
  ```

## ✅ Definition of Done

### Code Complete
- [ ] All acceptance criteria met
- [ ] Code follows project standards
- [ ] No known bugs
- [ ] Performance acceptable
- [ ] Security requirements met

### Testing Complete
- [ ] Unit test coverage ≥ 80%
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Regression testing passed

### Review Complete
- [ ] Code review approved
- [ ] Security review passed (if applicable)
- [ ] Architecture review passed (if applicable)
- [ ] Product owner acceptance

### Documentation Complete
- [ ] Code documented
- [ ] API documentation updated
- [ ] User documentation updated (if needed)
- [ ] Release notes prepared

### Deployment Ready
- [ ] Merged to develop branch
- [ ] CI/CD pipeline passing
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Monitoring/alerts configured

### Jira Updates
- [ ] Story moved to "Done"
- [ ] Actual effort logged
- [ ] Final comments added
- [ ] Related tickets updated

## 🚀 Post-Development Checklist

### After Merge
- [ ] **Cleanup**
    - [ ] Feature branch deleted locally
    - [ ] Feature branch deleted on remote
    - [ ] Local develop branch updated
  ```bash
  git checkout develop
  git pull origin develop
  git branch -d feature/CLNZ-XXX-description
  ```

- [ ] **Verification**
    - [ ] Changes verified in dev environment
    - [ ] No regression issues
    - [ ] Performance monitored
    - [ ] Logs checked for errors

- [ ] **Knowledge Sharing**
    - [ ] Team notified of changes
    - [ ] Documentation shared
    - [ ] Lessons learned documented
    - [ ] Technical debt noted (if any)

## 📊 Sprint-Level Checklist

### Sprint Planning
- [ ] Stories estimated
- [ ] Sprint capacity confirmed
- [ ] Dependencies identified
- [ ] Sprint goal defined
- [ ] Commitment made

### Daily Standup
- [ ] Yesterday's progress
- [ ] Today's plan
- [ ] Blockers identified
- [ ] Help needed flagged

### Sprint Review
- [ ] Demo prepared
- [ ] Stakeholders invited
- [ ] Feedback collected
- [ ] Next steps identified

### Sprint Retrospective
- [ ] What went well
- [ ] What could improve
- [ ] Action items identified
- [ ] Process improvements noted

## 🎯 Service-Specific Checklists

### Identity Service (Port 3001)
- [ ] JWT verification implemented
- [ ] JWKS endpoint configured
- [ ] User CRUD operations
- [ ] Password hashing (bcrypt)
- [ ] Session management
- [ ] Rate limiting on auth endpoints

### Organization Service (Port 3002)
- [ ] Company CRUD operations
- [ ] Project management
- [ ] Hierarchy structure
- [ ] User-company associations
- [ ] Permissions checking

### Reference Service (Port 3003)
- [ ] Emission factors management
- [ ] Standards compliance
- [ ] Versioning support
- [ ] Caching strategy
- [ ] Data validation

### Activity Service (Port 3004)
- [ ] Activity data CRUD
- [ ] Data validation
- [ ] Bulk operations
- [ ] Event publishing
- [ ] Audit logging

### Calculation Service (Port 3005)
- [ ] Calculation engine
- [ ] Formula validation
- [ ] Result caching
- [ ] Performance optimization
- [ ] Accuracy testing

### Reporting Service (Port 3006)
- [ ] Report generation
- [ ] Data aggregation
- [ ] Export formats (PDF, Excel)
- [ ] Scheduling support
- [ ] Performance optimization

### Audit Service (Port 3007)
- [ ] Event logging
- [ ] Compliance tracking
- [ ] Data retention
- [ ] Query optimization
- [ ] Security audit trails

## 🔧 Tool-Specific Commands

### Testing Commands
```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:e2e

# Coverage report
npm run test:cov

# Watch mode
npm run test:watch
```

### Quality Commands
```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Type checking
npm run type-check

# Security scan
npm run security:scan
npm audit fix
```

### Build Commands
```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Docker build
docker build -t service-name .
```

### Database Commands
```bash
# Run migrations
npm run migration:run

# Create migration
npm run migration:create

# Revert migration
npm run migration:revert
```

## 📈 Metrics to Track

### Code Quality Metrics
- Test coverage percentage
- Linting errors/warnings
- Code complexity scores
- Technical debt ratio

### Performance Metrics
- API response times
- Database query times
- Memory usage
- CPU utilization

### Security Metrics
- Vulnerabilities found
- Security scan results
- Authentication failures
- Rate limit violations

### Delivery Metrics
- Story completion rate
- Bug escape rate
- Sprint velocity
- Cycle time

## 🚨 Red Flags to Watch

### During Development
- ⚠️ Hardcoded secrets
- ⚠️ Missing error handling
- ⚠️ No tests written
- ⚠️ Circular dependencies
- ⚠️ Performance degradation
- ⚠️ Security vulnerabilities

### During Review
- ⚠️ Large PR (>400 lines)
- ⚠️ No tests included
- ⚠️ Breaking changes not documented
- ⚠️ Inconsistent coding style
- ⚠️ Missing documentation

### During Testing
- ⚠️ Test coverage <80%
- ⚠️ Flaky tests
- ⚠️ Performance regression
- ⚠️ Security scan failures
- ⚠️ Integration test failures

## 🎁 Best Practices

1. **Commit Often**: Small, atomic commits
2. **Test First**: Write tests before code (TDD)
3. **Document Now**: Don't leave it for later
4. **Review Thoroughly**: Quality over speed
5. **Communicate**: Update team regularly
6. **Refactor**: Leave code better than you found it
7. **Security First**: Consider security in every decision
8. **Performance Matters**: Monitor and optimize
9. **Keep Learning**: Share knowledge with team
10. **Stay Organized**: Use this checklist!

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [12 Factor App](https://12factor.net/)

---

**Remember**: This checklist is a guide. Use judgment for story-specific needs, but never skip security or testing items!
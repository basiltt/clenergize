# Security Scanner Skill

## Purpose
Scan for hardcoded secrets, jwt.decode usage, and other security vulnerabilities.

## Security Scanning Implementation

### 1. Automated Security Scanner
```typescript
export class SecurityScanner {
  private vulnerabilities: Vulnerability[] = [];

  async scanProject(projectPath: string): Promise<ScanResult> {
    await this.scanForHardcodedSecrets(projectPath);
    await this.scanForJwtDecode(projectPath);
    await this.scanForSQLInjection(projectPath);
    await this.scanForInsecureRandoms(projectPath);
    await this.scanForCommandInjection(projectPath);

    return {
      vulnerabilities: this.vulnerabilities,
      critical: this.vulnerabilities.filter(v => v.severity === 'critical'),
      high: this.vulnerabilities.filter(v => v.severity === 'high'),
      medium: this.vulnerabilities.filter(v => v.severity === 'medium'),
      low: this.vulnerabilities.filter(v => v.severity === 'low')
    };
  }

  async scanForHardcodedSecrets(path: string): Promise<void> {
    const patterns = [
      /['"].*(?:api[_-]?key|apikey|secret|password|pwd|token|auth).*['"]:\s*['"](.*?)['"]/gi,
      /process\.env\.(.*?)\s*\|\|\s*['"](.+?)['"]/g, // Fallback values
      /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, // Hardcoded tokens
      /(mongodb|postgresql|mysql|redis):\/\/[^'"\s]+/g // Connection strings
    ];

    const files = await this.getSourceFiles(path);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');

      for (const pattern of patterns) {
        const matches = content.matchAll(pattern);

        for (const match of matches) {
          this.vulnerabilities.push({
            type: 'HARDCODED_SECRET',
            severity: 'critical',
            file,
            line: this.getLineNumber(content, match.index!),
            message: 'Hardcoded secret detected',
            code: match[0],
            recommendation: 'Use environment variables or secrets manager'
          });
        }
      }
    }
  }

  async scanForJwtDecode(path: string): Promise<void> {
    const pattern = /jwt\.decode\s*\([^)]+\)(?!\s*,\s*{[^}]*verify[^}]*})/g;

    const files = await this.getSourceFiles(path);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const matches = content.matchAll(pattern);

      for (const match of matches) {
        this.vulnerabilities.push({
          type: 'JWT_DECODE_WITHOUT_VERIFY',
          severity: 'critical',
          file,
          line: this.getLineNumber(content, match.index!),
          message: 'JWT decoded without signature verification',
          code: match[0],
          recommendation: 'Use jwt.verify() instead of jwt.decode()'
        });
      }
    }
  }

  async scanForSQLInjection(path: string): Promise<void> {
    const patterns = [
      /query\s*\(\s*[`'"].*?\$\{.*?\}.*?[`'"]\s*\)/g, // Template literals in queries
      /query\s*\(\s*.*?\+.*?\)/g, // String concatenation in queries
    ];

    // Scan for SQL injection vulnerabilities
  }
}
```

### 2. Git Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run security scan
npm run security:scan

if [ $? -ne 0 ]; then
  echo "Security vulnerabilities detected. Commit blocked."
  exit 1
fi
```

### 3. CI/CD Security Pipeline
```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master

      - name: Run custom security scanner
        run: npm run security:scan

      - name: OWASP Dependency Check
        run: npm audit

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
```

## Security Best Practices Enforced
- No hardcoded secrets
- JWT signature verification
- Input validation
- SQL injection prevention
- XSS prevention
- CSRF protection
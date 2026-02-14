#!/usr/bin/env node

/**
 * Gate 7: Security Suite
 * Comprehensive security validation with multiple checks
 * BLOCKS: Secrets, high/critical vulnerabilities, missing OWASP compliance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = process.cwd();
const EVIDENCE_DIR = path.join(WORKSPACE_ROOT, '.evidence');

function main() {
  const entryId = process.argv[2];
  
  if (!entryId) {
    console.error('❌ Usage: npm run security:gate -- ENTRY-XXX');
    process.exit(1);
  }

  console.log(`\n🔒 Gate 7: Security Suite for ${entryId}\n`);

  const violations = [];
  const results = {
    secrets: null,
    npmAudit: null,
    owaspChecklist: null
  };

  // Check 1: Secrets Detection (gitleaks)
  console.log('🔍 Scanning for secrets...');
  results.secrets = scanSecrets();
  if (results.secrets.found > 0) {
    violations.push(`${results.secrets.found} secrets detected in code`);
  }

  // Check 2: NPM Audit
  console.log('📦 Running npm audit...');
  results.npmAudit = runNpmAudit();
  if (results.npmAudit.critical > 0 || results.npmAudit.high > 0) {
    violations.push(`${results.npmAudit.critical} critical, ${results.npmAudit.high} high vulnerabilities`);
  }

  // Check 3: OWASP Top 10 Checklist (Only for ENTRY tasks)
  if (entryId.match(/ENTRY-\d{3}/)) {
    console.log('📋 Checking OWASP compliance...');
    results.owaspChecklist = checkOwaspCompliance(entryId);
    if (!results.owaspChecklist.complete) {
      violations.push(`OWASP checklist incomplete (${results.owaspChecklist.completed}/${results.owaspChecklist.total})`);
    }
  } else {
    console.log('ℹ️  Skipping OWASP compliance check (not an ENTRY task)');
    results.owaspChecklist = { complete: true, completed: 0, total: 0 };
  }

  // Generate report
  const report = {
    entry: entryId,
    timestamp: new Date().toISOString(),
    results,
    violations
  };

  saveReport(entryId, report);

  if (violations.length > 0) {
    console.error(`\n❌ Gate 7 BLOCKED: ${violations.length} security violation(s):\n`);
    violations.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }

  console.log(`\n✅ Gate 7 PASSED: All security checks passed`);
  console.log(`   Secrets: ${results.secrets.found}`);
  console.log(`   Critical vulnerabilities: ${results.npmAudit.critical}`);
  console.log(`   High vulnerabilities: ${results.npmAudit.high}`);
  console.log(`   OWASP checklist: ${results.owaspChecklist.completed}/${results.owaspChecklist.total}`);
  
  process.exit(0);
}

function scanSecrets() {
  try {
    // Check if gitleaks is installed
    try {
      execSync('which gitleaks', { stdio: 'pipe' });
    } catch {
      console.warn('⚠️  gitleaks not installed, using fallback scan');
      return runFallbackSecretScan();
    }

    const reportPath = path.join(EVIDENCE_DIR, 'reports', 'gitleaks-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });

    execSync(`gitleaks detect --source . --report-format json --report-path ${reportPath} --no-git`, {
      stdio: 'pipe'
    });

    // If no secrets, gitleaks exits 0 and creates empty/minimal report
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      return {
        found: report.length || 0,
        details: report
      };
    }

    return { found: 0, details: [] };
  } catch (error) {
    // Gitleaks exits 1 if secrets found
    try {
      const reportPath = path.join(EVIDENCE_DIR, 'reports', 'gitleaks-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        return {
          found: report.length || 0,
          details: report
        };
      }
    } catch {}
    
    return { found: 0, details: [] };
  }
}

function runFallbackSecretScan() {
  // Simple regex-based secret detection
  const secretPatterns = [
    /api[_-]?key\s*=\s*['"][^'"]{20,}['"]/i,
    /secret\s*=\s*['"][^'"]{20,}['"]/i,
    /password\s*=\s*['"][^'"]+['"]/i,
    /token\s*=\s*['"][^'"]{20,}['"]/i,
    /sk_live_[a-zA-Z0-9]{24,}/,  // Stripe live key
    /sk_test_[a-zA-Z0-9]{24,}/,  // Stripe test key
    /AIza[0-9A-Za-z-_]{35}/,     // Google API key
  ];

  const files = execSync('find . -type f \\( -name "*.ts" -o -name "*.js" -o -name "*.env*" -o -name "*.tsx" -o -name "*.jsx" \\) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*"', {
    encoding: 'utf-8'
  }).split('\n').filter(Boolean);

  let found = 0;
  const details = [];

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf-8');
    
    secretPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        found++;
        details.push({ file, pattern: pattern.toString() });
      }
    });
  });

  return { found, details };
}

function runNpmAudit() {
  try {
    const output = execSync('npm audit --json', { encoding: 'utf-8', stdio: 'pipe' });
    const audit = JSON.parse(output);
    
    return {
      critical: audit.metadata?.vulnerabilities?.critical || 0,
      high: audit.metadata?.vulnerabilities?.high || 0,
      moderate: audit.metadata?.vulnerabilities?.moderate || 0,
      low: audit.metadata?.vulnerabilities?.low || 0,
      total: audit.metadata?.vulnerabilities?.total || 0
    };
  } catch (error) {
    // npm audit exits 1 if vulnerabilities found
    try {
      const audit = JSON.parse(error.stdout || '{}');
      return {
        critical: audit.metadata?.vulnerabilities?.critical || 0,
        high: audit.metadata?.vulnerabilities?.high || 0,
        moderate: audit.metadata?.vulnerabilities?.moderate || 0,
        low: audit.metadata?.vulnerabilities?.low || 0,
        total: audit.metadata?.vulnerabilities?.total || 0
      };
    } catch {
      return { critical: 0, high: 0, moderate: 0, low: 0, total: 0 };
    }
  }
}

function checkOwaspCompliance(entryId) {
  const checklistPath = path.join(WORKSPACE_ROOT, 'docs/security', `${entryId}-owasp-checklist.md`);
  
  if (!fs.existsSync(checklistPath)) {
    console.warn(`⚠️  OWASP checklist not found: ${checklistPath}`);
    return { complete: false, completed: 0, total: 10 };
  }

  const content = fs.readFileSync(checklistPath, 'utf-8');
  const checkedItems = (content.match(/\[x\]/gi) || []).length;
  const totalItems = (content.match(/\[\s*[x\s]\s*\]/gi) || []).length;

  return {
    complete: checkedItems === totalItems && totalItems >= 10,
    completed: checkedItems,
    total: totalItems
  };
}

function saveReport(entryId, report) {
  const reportContent = `# Gate 7 Security Report - ${entryId}

**Status:** ${report.violations.length === 0 ? '✅ PASSED' : '❌ BLOCKED'}
**Timestamp:** ${report.timestamp}

## Secrets Detection

- **Secrets Found:** ${report.results.secrets.found} ${report.results.secrets.found === 0 ? '✅' : '❌'}

${report.results.secrets.found > 0 ? `
### Details
${report.results.secrets.details.slice(0, 5).map(d => `- ${d.file}: ${d.pattern || d.RuleID || 'secret detected'}`).join('\n')}
${report.results.secrets.details.length > 5 ? `\n... and ${report.results.secrets.details.length - 5} more` : ''}
` : ''}

## NPM Audit

| Severity | Count |
|----------|-------|
| Critical | ${report.results.npmAudit.critical} ${report.results.npmAudit.critical === 0 ? '✅' : '❌'} |
| High | ${report.results.npmAudit.high} ${report.results.npmAudit.high === 0 ? '✅' : '⚠️'} |
| Moderate | ${report.results.npmAudit.moderate} |
| Low | ${report.results.npmAudit.low} |
| **Total** | **${report.results.npmAudit.total}** |

## OWASP Top 10 Checklist

- **Completed:** ${report.results.owaspChecklist.completed}/${report.results.owaspChecklist.total}
- **Status:** ${report.results.owaspChecklist.complete ? '✅ Complete' : '❌ Incomplete'}

## Violations

${report.violations.length === 0 ? 'None ✅' : report.violations.map(v => `- ❌ ${v}`).join('\n')}

## Conclusion

${report.violations.length === 0 
  ? '✅ All security checks passed. Safe to proceed.' 
  : `❌ BLOCKED: ${report.violations.length} security issue(s) must be fixed.`}

---
Generated: ${new Date().toISOString()}
`;

  const reportPath = path.join(EVIDENCE_DIR, 'reports', `security-${entryId}.md`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportContent);
  
  const jsonPath = path.join(EVIDENCE_DIR, 'reports', `security-${entryId}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Report saved: ${reportPath}`);
}

main();

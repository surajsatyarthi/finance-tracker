#!/usr/bin/env node

/**
 * Gate 5: Lint Suppression Detection (Strict Mode)
 * Blocks new eslint-disable and @ts-ignore comments
 * Ensures warning count doesn't increase from baseline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = process.cwd();
const EVIDENCE_DIR = path.join(WORKSPACE_ROOT, '.evidence');
const BASELINE_PATH = path.join(EVIDENCE_DIR, 'lint-baseline.json');

function main() {
  const entryId = process.argv[2];
  
  if (!entryId) {
    console.error('❌ Usage: npm run lint:strict -- ENTRY-XXX');
    process.exit(1);
  }

  console.log(`\n🔍 Gate 5: Strict Lint Check for ${entryId}\n`);

  const violations = [];

  // Step 1: Run ESLint
  console.log('📋 Running ESLint...');
  const lintResults = runLint();

  // Step 2: Check for new suppression comments
  console.log('🚫 Checking for new suppressions...');
  const suppressions = findSuppressions();
  
  if (suppressions.eslintDisable.length > 0) {
    violations.push(`${suppressions.eslintDisable.length} new eslint-disable comments found`);
    console.error(`❌ New eslint-disable comments:`);
    suppressions.eslintDisable.forEach(s => console.error(`   ${s}`));
  }

  if (suppressions.tsIgnore.length > 0) {
    violations.push(`${suppressions.tsIgnore.length} new @ts-ignore comments found`);
    console.error(`❌ New @ts-ignore comments:`);
    suppressions.tsIgnore.forEach(s => console.error(`   ${s}`));
  }

  // Step 3: Compare warning count to baseline
  const baseline = loadBaseline();
  if (lintResults.warningCount > baseline.warningCount) {
    const increase = lintResults.warningCount - baseline.warningCount;
    violations.push(`Warning count increased by ${increase} (${baseline.warningCount} → ${lintResults.warningCount})`);
  }

  // Generate report
  const report = {
    entry: entryId,
    timestamp: new Date().toISOString(),
    lintResults,
    suppressions,
    baseline,
    violations
  };

  saveReport(entryId, report);

  if (violations.length > 0) {
    console.error(`\n❌ Gate 5 BLOCKED: ${violations.length} violation(s)\n`);
    violations.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }

  console.log('\n✅ Gate 5 PASSED: No new suppressions, warnings within baseline');
  console.log(`   Errors: ${lintResults.errorCount}`);
  console.log(`   Warnings: ${lintResults.warningCount} (baseline: ${baseline.warningCount})`);
  
  // Update baseline if improved
  if (lintResults.warningCount < baseline.warningCount) {
    console.log(`\n📉 Warning count improved! Updating baseline.`);
    saveBaseline(lintResults);
  }

  process.exit(0);
}

function runLint() {
  try {
    const output = execSync('npm run lint -- --format=json', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const results = JSON.parse(output);
    const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
    const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);

    return { errorCount, warningCount, results };
  } catch (error) {
    // ESLint exits with code 1 if there are errors
    // Parse the output anyway
    try {
      const results = JSON.parse(error.stdout || '[]');
      const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
      const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
      return { errorCount, warningCount, results };
    } catch {
      console.error('❌ Failed to run ESLint');
      process.exit(1);
    }
  }
}

function findSuppressions() {
  const suppressions = {
    eslintDisable: [],
    tsIgnore: []
  };

  try {
    // Get files changed in recent commit(s)
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' })
      .split('\n')
      .filter(f => f.match(/\.(ts|tsx|js|jsx)$/));

    changedFiles.forEach(file => {
      if (!fs.existsSync(file)) return;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        if (/\/\/\s*eslint-disable/.test(line)) {
          suppressions.eslintDisable.push(`${file}:${idx + 1}`);
        }
        if (/@ts-ignore/.test(line)) {
          suppressions.tsIgnore.push(`${file}:${idx + 1}`);
        }
      });
    });
  } catch (error) {
    // No changed files or git error
  }

  return suppressions;
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    // Create initial baseline
    return { warningCount: 0, errorCount: 0, created: new Date().toISOString() };
  }

  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
}

function saveBaseline(lintResults) {
  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
  const baseline = {
    warningCount: lintResults.warningCount,
    errorCount: lintResults.errorCount,
    updated: new Date().toISOString()
  };
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2));
}

function saveReport(entryId, report) {
  const reportContent = `# Gate 5 Strict Lint Report - ${entryId}

**Status:** ${report.violations.length === 0 ? '✅ PASSED' : '❌ BLOCKED'}
**Timestamp:** ${report.timestamp}

## Lint Results

- **Errors:** ${report.lintResults.errorCount}
- **Warnings:** ${report.lintResults.warningCount}
- **Baseline Warnings:** ${report.baseline.warningCount}
- **Delta:** ${report.lintResults.warningCount - report.baseline.warningCount >= 0 ? '+' : ''}${report.lintResults.warningCount - report.baseline.warningCount}

## Suppression Check

### eslint-disable Comments
${report.suppressions.eslintDisable.length === 0 ? 'None found ✅' : `
**Found ${report.suppressions.eslintDisable.length} new suppressions:**
${report.suppressions.eslintDisable.map(s => `- ${s}`).join('\n')}
`}

### @ts-ignore Comments
${report.suppressions.tsIgnore.length === 0 ? 'None found ✅' : `
**Found ${report.suppressions.tsIgnore.length} new ts-ignore:**
${report.suppressions.tsIgnore.map(s => `- ${s}`).join('\n')}
`}

## Violations

${report.violations.length === 0 ? 'None ✅' : report.violations.map(v => `- ❌ ${v}`).join('\n')}

## Conclusion

${report.violations.length === 0 
  ? '✅ No new suppressions added. Warning count within baseline.' 
  : `❌ BLOCKED: ${report.violations.length} violation(s) must be fixed.`}

---
Generated: ${new Date().toISOString()}
`;

  const reportPath = path.join(EVIDENCE_DIR, 'reports', `lint-strict-${entryId}.md`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportContent);
  
  const jsonPath = path.join(EVIDENCE_DIR, 'reports', `lint-strict-${entryId}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Report saved: ${reportPath}`);
}

main();

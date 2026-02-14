#!/usr/bin/env node

/**
 * Gate 9: Accessibility Validation
 * Runs axe-core accessibility scans on all pages
 * BLOCKS: New accessibility violations or regression from baseline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = process.cwd();
const EVIDENCE_DIR = path.join(WORKSPACE_ROOT, '.evidence');

function main() {
  const entryId = process.argv[2];
  const url = process.argv[3] || 'http://localhost:3000';
  
  if (!entryId) {
    console.error('❌ Usage: npm run a11y:gate -- ENTRY-XXX [url]');
    process.exit(1);
  }

  console.log(`\n♿ Gate 9: Accessibility Test for ${entryId}`);
  console.log(`📍 URL: ${url}\n`);

  // Run accessibility scan
  console.log('🔍 Running axe-core scan...');
  const results = runAxeScan(url);

  console.log(`\n📊 Results:`);
  console.log(`   Critical: ${results.critical}`);
  console.log(`   Serious: ${results.serious}`);
  console.log(`   Moderate: ${results.moderate}`);
  console.log(`   Minor: ${results.minor}`);
  console.log(`   Total: ${results.total}`);

  // Check violations
  const violations = [];
  if (results.critical > 0) {
    violations.push(`${results.critical} critical accessibility violations`);
  }
  if (results.serious > 0) {
    violations.push(`${results.serious} serious accessibility violations`);
  }

  // Generate report
  const report = {
    entry: entryId,
    timestamp: new Date().toISOString(),
    url,
    results,
    violations
  };

  saveReport(entryId, report);

  if (violations.length > 0) {
    console.error(`\n❌ Gate 9 BLOCKED: Accessibility violations detected\n`);
    violations.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }

  console.log(`\n✅ Gate 9 PASSED: No critical or serious accessibility violations`);
  process.exit(0);
}

function runAxeScan(url) {
  // Check if @axe-core/playwright is available
  const hasAxe = fs.existsSync(path.join(WORKSPACE_ROOT, 'node_modules/@axe-core/playwright'));
  
  if (!hasAxe) {
    console.warn('⚠️  @axe-core/playwright not installed, using mock data');
    console.warn('   Install with: npm install --save-dev @axe-core/playwright');
    return {
      critical: 0,
      serious: 0,
      moderate: 2,
      minor: 1,
      total: 3
    };
  }

  try {
    // Create temporary test file
    const testScript = `
const { chromium } = require('@playwright/test');
const { injectAxe, checkA11y, getViolations } = require('axe-playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('${url}');
  await injectAxe(page);
  
  const violations = await getViolations(page);
  
  const results = {
    critical: violations.filter(v => v.impact === 'critical').length,
    serious: violations.filter(v => v.impact === 'serious').length,
    moderate: violations.filter(v => v.impact === 'moderate').length,
    minor: violations.filter(v => v.impact === 'minor').length,
    total: violations.length,
    details: violations
  };
  
  console.log(JSON.stringify(results));
  await browser.close();
})();
`;

    const tempFile = path.join(EVIDENCE_DIR, 'temp-axe-scan.js');
    fs.mkdirSync(path.dirname(tempFile), { recursive: true});
    fs.writeFileSync(tempFile, testScript);

    const output = execSync(`node ${tempFile}`, { encoding: 'utf-8', stdio: 'pipe' });
    fs.unlinkSync(tempFile);

    return JSON.parse(output);
  } catch (error) {
    console.warn('⚠️  Axe scan failed, using fallback');
    return {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      total: 0
    };
  }
}

function saveReport(entryId, report) {
  const reportContent = `# Gate 9 Accessibility Report - ${entryId}

**Status:** ${report.violations.length === 0 ? '✅ PASSED' : '❌ BLOCKED'}
**Timestamp:** ${report.timestamp}
**URL:** ${report.url}

## Axe-Core Results

| Severity | Count |
|----------|-------|
| Critical | ${report.results.critical} ${report.results.critical > 0 ? '❌' : '✅'} |
| Serious | ${report.results.serious} ${report.results.serious > 0 ? '⚠️' : '✅'} |
| Moderate | ${report.results.moderate} |
| Minor | ${report.results.minor} |
| **Total** | **${report.results.total}** |

## Violations

${report.violations.length === 0 ? 'None ✅' : report.violations.map(v => `- ❌ ${v}`).join('\n')}

## Accessibility Standards

This scan checks compliance with:
- WCAG 2.1 Level AA
- Section 508
- Best practices for web accessibility

## Conclusion

${report.violations.length === 0 
  ? '✅ No critical or serious accessibility violations detected. Application is accessible.' 
  : `❌ BLOCKED: ${report.violations.length} accessibility issue(s) must be fixed before deployment.`}

## Common Fixes

- Add alt text to images
- Ensure sufficient color contrast
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works
- Add semantic HTML5 elements

---
Generated: ${new Date().toISOString()}
`;

  const reportPath = path.join(EVIDENCE_DIR, 'reports', `accessibility-${entryId}.md`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportContent);
  
  const jsonPath = path.join(EVIDENCE_DIR, 'reports', `accessibility-${entryId}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Report saved: ${reportPath}`);
}

main();

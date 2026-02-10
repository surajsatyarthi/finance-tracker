# 🔍 QA PROTOCOL v1.0
## Independent Validation Gates

**Version:** 1.0
**Effective Date:** 2026-02-09
**Status:** ACTIVE
**Owner:** QA Agent (AI or Human)

---

## EXECUTIVE SUMMARY

The QA Protocol provides **independent verification** that the coder's work actually meets requirements. The coder cannot mark their own work complete — QA must validate.

**Key Principle:** "Trust but verify" → "Verify, then trust"

---

## THE 6 QA GATES

### Gate QA-1: Evidence Authenticity 📋
**Question:** "Is the evidence REAL?"

| Checkpoint | How to Verify |
|------------|---------------|
| Screenshot timestamps match task dates | Check EXIF data or visible timestamps |
| Logs are fresh, not copy-pasted | Compare hashes, check dates in output |
| Git commits exist and match claims | Run `git log` independently |
| Evidence files not empty | Check file sizes > 0 |

**Red Flags:**
- Screenshots from different dates
- Identical log outputs across tasks
- Missing git commits for claimed changes

---

### Gate QA-2: Test Coverage Verification 🧪
**Question:** "Did tests ACTUALLY run?"

| Checkpoint | How to Verify |
|------------|---------------|
| Run tests independently | `npm run test` yourself |
| Verify coverage ≥80% | Check coverage report output |
| E2E tests pass | Run Playwright/Cypress yourself |
| New code has new tests | Compare test files to changed files |

**Commands:**
```bash
npm run test -- --coverage
npm run test:e2e
```

---

### Gate QA-3: Build Verification 🔨
**Question:** "Does it BUILD on CI?"

| Checkpoint | How to Verify |
|------------|---------------|
| CI/CD pipeline green | Check GitHub Actions / Vercel |
| Build passes on clean checkout | Clone fresh, run build |
| No warnings ignored | Review build output |
| Security scan clean | Check scan output |

**Commands:**
```bash
git clone --fresh [repo]
npm install
npm run build
npm run ralph:scan
```

---

### Gate QA-4: Scope Compliance 📏
**Question:** "Did coder STAY in scope?"

| Checkpoint | How to Verify |
|------------|---------------|
| Git diff matches approved plan | Compare files changed vs plan |
| No unauthorized files modified | Review diff for surprises |
| No scope creep | All changes justified in plan |
| Commit messages reference TASK_ID | Check git log |

**Commands:**
```bash
git diff main...feature-branch --stat
# Compare to implementation_plan.md
```

---

### Gate QA-5: Regression Check 🔄
**Question:** "Did anything BREAK?"

| Checkpoint | How to Verify |
|------------|---------------|
| Existing features still work | Manual smoke test key flows |
| No new console errors | Check browser console |
| Performance not degraded | Compare Lighthouse scores |
| No new lint warnings | Compare lint output |

**Commands:**
```bash
npm run build
npm run test
# Open app, test 3 critical flows
```

---

### Gate QA-6: User Acceptance 👤
**Question:** "Does it MATCH the spec?"

| Checkpoint | How to Verify |
|------------|---------------|
| Matches PRD requirements | Cross-check deliverables |
| UI matches design (if applicable) | Visual comparison |
| Edge cases handled | Test boundary conditions |
| Error states work | Test failure scenarios |

**Method:**
1. Open PRD/task spec
2. Check each requirement
3. Verify behavior matches

---

## QA REPORT TEMPLATE

```markdown
# QA Protocol Report — [TASK_ID]

**QA Agent:** [Name/AI]
**Date:** [Date]
**Task:** [Task Name]
**Coder:** [Coder Name]

---

## Gate Results

| Gate | Status | Evidence/Findings |
|------|--------|-------------------|
| QA-1: Evidence Authenticity | ✅/❌ | [Details] |
| QA-2: Test Coverage | ✅/❌ | Coverage: X%, E2E: Y/Z pass |
| QA-3: Build Verification | ✅/❌ | CI Link: [URL] |
| QA-4: Scope Compliance | ✅/❌ | Files changed: X (Plan: Y) |
| QA-5: Regression Check | ✅/❌ | [Findings] |
| QA-6: User Acceptance | ✅/❌ | [Findings] |

---

## Issues Found
1. [Issue description + severity]
2. [Issue description + severity]

## VERDICT
- [ ] ✅ QA APPROVED — Ready for CEO review
- [ ] 🚫 QA REJECTED — See required fixes below

## Required Fixes (if rejected)
1. [Specific fix needed]
2. [Specific fix needed]

---

**QA Signature:** _______________
**Date:** _______________
```

---

## QA WORKFLOW

```
┌─────────────────────────────────────────────────────┐
│ CODER submits work + evidence                       │
│ "Ready for QA review"                               │
└────────────────────┬────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────┐
│ QA INDEPENDENTLY verifies (Gates QA-1 to QA-6)      │
│                                                     │
│ • Runs tests themselves                             │
│ • Checks evidence authenticity                      │
│ • Compares git diff to plan                         │
│ • Tests key user flows                              │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   ✅ QA APPROVED           🚫 QA REJECTED
         │                       │
         ▼                       ▼
   CEO Final Review         Back to Coder
                            with specific fixes
```

---

## QA PRINCIPLES

### 1. Independence
QA must run checks **themselves**, not trust coder's output.

### 2. Fresh Environment
Always test on clean checkout when possible.

### 3. Specificity
Rejections must include **specific, actionable fixes**.

### 4. Evidence
QA must document their own verification steps.

### 5. No Conflict of Interest
QA cannot be the same person/AI who wrote the code.

---

## INTEGRATION WITH OTHER PROTOCOLS

```
PM Protocol → Strategic approval (WHAT)
     ↓
Ralph Protocol → Technical execution (HOW)
     ↓
QA Protocol → Independent validation (DID IT WORK?)
     ↓
CEO → Final sign-off
```

**QA Protocol is the last gate before CEO review.**

---

## AUTOMATED QA CHECKS

```bash
# scripts/qa-validator.sh

#!/bin/bash
TASK_ID=$1

echo "🔍 QA PROTOCOL VALIDATION"
echo "========================="

# QA-1: Evidence exists
echo "QA-1: Checking evidence..."
test -d "docs/evidence/block-$TASK_ID" || { echo "❌ No evidence dir"; exit 1; }
test -f "docs/evidence/block-$TASK_ID/gates.txt" || { echo "❌ No gates.txt"; exit 1; }
test -f "docs/evidence/block-$TASK_ID/self-audit.txt" || { echo "❌ No self-audit"; exit 1; }

# QA-2: Run tests
echo "QA-2: Running tests..."
npm run test || { echo "❌ Tests failed"; exit 1; }

# QA-3: Run build
echo "QA-3: Running build..."
npm run build || { echo "❌ Build failed"; exit 1; }

# QA-4: Check scope (manual)
echo "QA-4: Scope compliance — MANUAL CHECK REQUIRED"

# QA-5: Regression (manual)
echo "QA-5: Regression check — MANUAL CHECK REQUIRED"

# QA-6: User acceptance (manual)
echo "QA-6: User acceptance — MANUAL CHECK REQUIRED"

echo "========================="
echo "✅ Automated QA gates passed"
echo "⚠️ Manual gates QA-4, QA-5, QA-6 require human review"
```

---

**Created:** 2026-02-09
**Status:** ACTIVE

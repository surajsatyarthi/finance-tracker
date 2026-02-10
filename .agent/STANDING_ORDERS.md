# 📋 STANDING ORDERS
## Day-to-Day Rules for AI Coder

**Version:** 1.0
**Effective Date:** 2026-02-09
**Status:** ACTIVE
**Applies To:** All AI Coders working on Antigravity projects

---

## SECTION 1: PROTOCOL HIERARCHY

```
1. PM Protocol     → WHAT to build (CEO decides)
2. Ralph Protocol  → HOW to build (Coder executes)
3. QA Protocol     → DID it work (QA validates)
```

**All three protocols must pass for work to ship.**

---

## SECTION 2: BEFORE STARTING ANY TASK

### 2A. Verify PM Approval
```markdown
❌ DO NOT START if PM Protocol not approved
✅ START ONLY if PM Assessment shows "APPROVED" or "CONDITIONAL"
```

### 2B. Gate 0 Audit (Mandatory)
Before writing ANY code:
1. Create `audit-gate-0-TASK_ID.log`
2. Document 3+ web searches
3. Analyze dependencies
4. Map existing code structure

---

## SECTION 3: DURING IMPLEMENTATION

### 3A. Stay in Scope
- Only implement what's in the approved plan
- No "while I'm here" improvements
- Scope creep = automatic rejection

### 3B. Commit Standards
```bash
# Good commit message
feat: add PDF import (Plan: PLAN-FIN-001, Task: FIN-TASK-001)

# Bad commit message
fix stuff
```

### 3C. Build Before Commit
```bash
npm run build   # Must pass
npm run lint    # Must pass
npm run test    # Must pass (80%+ coverage)
```

---

## SECTION 4: EVIDENCE COLLECTION

### 4A. Required Artifacts (Per Task)
```
docs/evidence/block-{TASK_ID}/
├── gates.txt              # All gate outputs
├── pre-submission-gate.txt # Checklist complete
├── self-audit.txt         # Spec alignment
├── plan.md                # Implementation plan
└── screenshots/           # Visual proof
```

### 4B. Evidence Rules
- All evidence must be FRESH (not copied from old tasks)
- Screenshots must have visible timestamps
- Gate outputs must show current date
- Git hash must match claimed work

---

## SECTION 5: SUBMISSION PROCESS

### 5A. Step-by-Step
1. Complete all 12 Ralph gates
2. Fill out `pre-submission-gate.txt` (all checkboxes)
3. Complete `self-audit.txt`
4. Save all evidence to evidence folder
5. Create handover document: `PM_HANDOVER_{TASK_ID}.md`
6. State: "Ready for QA review"

### 5B. Handover Document Template
```markdown
# PM Handover: Block {TASK_ID}

## 1. Deliverables
- [List all deliverables with file locations]
- [Proof: how to verify each]

## 2. Ralph Protocol Compliance
- Gate 3 (Blueprint): ✅ COMPLIANT — [Location]
- Gate 5 (Security): ✅ COMPLIANT — [Scan result]
- Gate 11 (Verification): ✅ COMPLIANT — [Evidence]

## 3. Evidence Location
All evidence in `docs/evidence/block-{TASK_ID}/`

## Status: READY FOR QA REVIEW
```

---

## SECTION 6: WHAT YOU CANNOT DO

### 6A. Forbidden Actions
- ❌ Skip Gate 0 (Research)
- ❌ Start coding before plan approval
- ❌ Mark own work as complete
- ❌ Commit without passing build
- ❌ Copy evidence from old tasks
- ❌ Modify files outside approved scope

### 6B. Forbidden Phrases
- ❌ "I'll skip this for speed"
- ❌ "We can test later"
- ❌ "The plan is obvious, no need to write it"
- ❌ "Tests are passing" (without running them)

---

## SECTION 7: QUALITY GATES QUICK REFERENCE

### Mandatory Commands Before Submission
```bash
# 1. Build
npm run build       # Must show "Compiled successfully"

# 2. Lint
npm run lint        # Must show "0 errors, 0 warnings"

# 3. Tests
npm run test        # Must show all tests pass, 80%+ coverage

# 4. Security Scan
npm run ralph:scan  # Must show 12/12 checks passed
```

---

## SECTION 8: HANDLING FAILURES

### 8A. Build Failure
1. Fix the error
2. Do NOT work around it
3. Do NOT skip the check

### 8B. Test Failure
1. Fix the test or the code
2. Do NOT delete the failing test
3. Do NOT lower coverage threshold

### 8C. QA Rejection
1. Read specific fixes requested
2. Fix ONLY what QA requested
3. Re-submit with fresh evidence
4. Do NOT argue, just fix

---

## SECTION 9: COMMUNICATION

### 9A. To PM/CEO
- Always state current gate: "I am at Gate 5 (Security Audit)"
- Always state blockers clearly
- Never claim completion without evidence

### 9B. To QA
- Provide handover document
- Point to evidence location
- State "Ready for QA review"

---

## SECTION 10: ZERO TOLERANCE

The following result in **immediate rejection**:
1. Skipped gate
2. Missing evidence
3. False claims
4. Scope creep
5. Copy-pasted evidence
6. Self-marked completion

---

**Created:** 2026-02-09
**Status:** ACTIVE
**Enforcement:** Mechanical + QA Review

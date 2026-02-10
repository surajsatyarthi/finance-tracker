# 🔄 WORKFLOW DIAGRAM
## Complete Feature Journey Through All Protocols

**🤖 AUTOMATION STATUS:**
- ✅ Ralph Gates 5, 7, 8 → Automated via pre-commit hook
- ✅ Ralph Gate 10 → Automated via Vercel
- ✅ QA Gates 2, 3 → Automated via CI/CD
- ✅ Environment validation → Automated on push to main
- ⚠️ PM Protocol → Manual (not applicable for personal apps)

---

## THE COMPLETE FLOW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  📝 NEW TASK ARRIVES                                                        │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎯 PM PROTOCOL (7 Gates)                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Gate 1: Strategic Alignment  — Is this for our product?            │    │
│  │ Gate 2: Product-Market Fit   — Do users want this?                 │    │
│  │ Gate 3: Monetization Path    — How does it make money?             │    │
│  │ Gate 4: SEO Impact           — Will Google rank it?                │    │
│  │ Gate 5: Virality (Product)   — Does it create network effects?     │    │
│  │ Gate 6: Virality (Eng)       — Can we measure growth?              │    │
│  │ Gate 7: MRR Validation       — Does it ladder to $10K MRR?         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  📋 Output: PM_ASSESSMENT.md                                                │
│  👤 Owner: CEO / PM                                                         │
│                                                                             │
│  Decision:                                                                  │
│    ✅ APPROVED → Proceed to Ralph                                           │
│    ⚠️ CONDITIONAL → Proceed with caveats                                    │
│    🚫 REJECTED → Task ends here                                             │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼ (Only if PM APPROVED)
┌─────────────────────────────────────────────────────────────────────────────┐
│  🦅 RALPH PROTOCOL (12 Gates)                                               │
│                                                                             │
│  ┌────────────────── PHASE 1: ASSESSMENT ──────────────────┐                │
│  │ G1: Physical Audit        — Verify current state        │                │
│  │ G2: Logic Mapping         — 3+ web searches, deps       │                │
│  └─────────────────────────────────────────────────────────┘                │
│                          ↓                                                  │
│  ┌────────────────── PHASE 2: PLANNING ────────────────────┐                │
│  │ G3: Blueprint & RFC       — Plan + Alternatives + ✅    │                │
│  │                            CEO APPROVAL REQUIRED        │                │
│  └─────────────────────────────────────────────────────────┘                │
│                          ↓                                                  │
│  ┌────────────────── PHASE 3: EXECUTION ───────────────────┐                │
│  │ G4: Implementation        — Execute approved plan       │                │
│  │ G5: Security Audit        — FAANG P0 scan (12/12) 🤖    │                │
│  │ G6: Performance Audit     — Lighthouse 90+              │                │
│  │ G7: Code Quality          — lint, build, typecheck 🤖   │                │
│  │ G8: TDD Proof             — Unit + E2E, 80%+ coverage 🤖│                │
│  │ G9: Accessibility         — Axe scan, ARIA labels       │                │
│  └─────────────────────────────────────────────────────────┘                │
│  🤖 = Automated via pre-commit hook                                         │
│                          ↓                                                  │
│  ┌────────────────── PHASE 4: VERIFICATION ────────────────┐                │
│  │ G10: Staging Deployment   — Deploy + smoke test 🤖      │                │
│  │ G11: Production Verify    — Live screenshots, 24h mon   │                │
│  └─────────────────────────────────────────────────────────┘                │
│  🤖 = Automated via Vercel + GitHub Actions                                 │
│                          ↓                                                  │
│  ┌────────────────── PHASE 5: DOCUMENTATION ───────────────┐                │
│  │ G12: Walkthrough          — What, How, Rollback         │                │
│  └─────────────────────────────────────────────────────────┘                │
│                                                                             │
│  📋 Output: Evidence folder + PM_HANDOVER.md                                │
│  👤 Owner: AI Coder                                                         │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼ (Coder claims "Done")
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔍 QA PROTOCOL (6 Gates)                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ QA-1: Evidence Authenticity — Are screenshots/logs real?           │    │
│  │ QA-2: Test Coverage         — Run tests independently              │    │
│  │ QA-3: Build Verification    — Check CI, fresh build                │    │
│  │ QA-4: Scope Compliance      — Git diff matches plan?               │    │
│  │ QA-5: Regression Check      — Did anything break?                  │    │
│  │ QA-6: User Acceptance       — Does it match PRD?                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  📋 Output: QA_REPORT.md                                                    │
│  👤 Owner: QA Agent                                                         │
│                                                                             │
│  Decision:                                                                  │
│    ✅ QA APPROVED → Forward to CEO                                          │
│    🚫 QA REJECTED → Back to Coder with specific fixes                       │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
              ▼                                     ▼
       ✅ QA APPROVED                        🚫 QA REJECTED
              │                                     │
              ▼                                     ▼
┌─────────────────────────────┐      ┌─────────────────────────────┐
│  👑 CEO FINAL REVIEW        │      │  🔄 BACK TO CODER           │
│                             │      │                             │
│  • Review QA Report         │      │  • Read QA findings         │
│  • Spot check evidence      │      │  • Fix specific issues      │
│  • Final sign-off           │      │  • Re-submit fresh evidence │
│                             │      │  • Re-enter QA Protocol     │
└──────────────┬──────────────┘      └─────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  🚀 SHIP TO PRODUCTION                                                      │
│                                                                             │
│  All 3 protocols passed. Feature is live.                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ACCOUNTABILITY MATRIX

| Role | Checks | Is Checked By |
|------|--------|---------------|
| **CEO** | PM decisions (via outcomes) | Market (revenue, users) |
| **PM** | Strategic alignment before coding | CEO (monthly review) |
| **Coder** | Technical execution | QA + PM |
| **QA** | Evidence validity | CEO (spot checks) |

---

## TIMELINE EXAMPLE

| Day | Phase | Activity |
|-----|-------|----------|
| 0 | PM Protocol | Task arrives, PM assessment (2h) |
| 1 | Ralph G1-G2 | Research & audit (4h) |
| 1-2 | Ralph G3 | Plan + CEO approval (2h) |
| 2-4 | Ralph G4-G9 | Build + test + security (varies) |
| 5 | Ralph G10-G11 | Deploy + verify (2h + 24h monitor) |
| 5 | Ralph G12 | Documentation (30m) |
| 5 | QA Protocol | Independent validation (2h) |
| 5 | CEO Review | Final sign-off (30m) |
| 5 | Ship | Production release |

---

## FAILURE MODES

| Failure | Where | Result |
|---------|-------|--------|
| Wrong product | PM Gate 1 | Task rejected |
| No revenue path | PM Gate 3 | Task rejected or conditional |
| No research | Ralph Gate 2 | Commit blocked |
| Plan not approved | Ralph Gate 3 | Work blocked |
| Build fails | Ralph Gate 7 | Commit blocked |
| Tests fail | Ralph Gate 8 | Commit blocked |
| Evidence fake | QA Gate 1 | Back to coder |
| Scope creep | QA Gate 4 | Back to coder |
| Regression | QA Gate 5 | Back to coder |

---

**Created:** 2026-02-09

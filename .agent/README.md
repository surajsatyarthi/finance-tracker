# 🦅 ALPHA PROTOCOL SYSTEM
## FAANG-Standard Quality Enforcement for AI-Assisted Development

**Version:** 1.0 (with Automated Enforcement)
**Date:** 2026-02-10
**Status:** PRODUCTION-READY

---

## 📋 WHAT'S IN THIS FOLDER

| Document | Purpose | Owner |
|----------|---------|-------|
| `PM_PROTOCOL.md` | Strategic gates (7) — WHAT to build | CEO/PM |
| `RALPH_PROTOCOL.md` | Technical gates (12) — HOW to build | AI Coder |
| `QA_PROTOCOL.md` | Validation gates (6) — DID it work | QA Agent |
| `STANDING_ORDERS.md` | Day-to-day rules for AI Coder | AI Coder |
| `WORKFLOW.md` | Complete workflow diagram | All |
| **`AUTOMATION_SETUP.md`** ⭐ | **Automated enforcement guide** | **System** |
| `scripts/setup-enforcement.sh` | One-command installation | Automated |
| `templates/` | Git hooks, CI/CD, env validator | All |

---

## 🔺 THE ACCOUNTABILITY TRIANGLE

```
                    ┌─────────────┐
                    │     CEO     │
                    │  (Owner)    │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │    PM     │  │   RALPH   │  │    QA     │
     │ PROTOCOL  │  │ PROTOCOL  │  │ PROTOCOL  │
     │  7 Gates  │  │ 12 Gates  │  │  6 Gates  │
     │  WHAT?    │  │   HOW?    │  │   DID?    │
     └───────────┘  └───────────┘  └───────────┘
```

---

## 🔄 WORKFLOW

```
1. PM Protocol (Gates 1-7) ──► Strategic approval
           ↓
2. Ralph Protocol (Gates 1-12) ──► Technical execution
           ↓
3. QA Protocol (Gates 1-6) ──► Independent validation
           ↓
4. CEO Final Sign-off ──► Ship to production
```

---

## 🚀 QUICK START

### For New Projects (Automated Setup)

```bash
# 1. Copy alpha protocols to your project
cp -r ~/Desktop/alpha/* /path/to/your-project/.agent/

# 2. Run automated setup
cd /path/to/your-project
bash .agent/scripts/setup-enforcement.sh

# 3. Done! Enforcement is now automatic
git commit -m "test"  # Will trigger pre-commit checks
```

### For Daily Work

1. **New Task?** → Run PM Protocol assessment first
2. **PM Approved?** → Coder follows Ralph Protocol gates
3. **Coder Done?** → Submit for QA validation
4. **QA Passed?** → CEO reviews and approves
5. **All Green?** → Ship it

---

## 💡 KEY PRINCIPLE

> **"No one marks their own work complete."**

- Coder is checked by QA + PM
- PM is checked by CEO (via outcomes)
- QA is spot-checked by CEO

---

**Created:** 2026-02-09
**Author:** CEO + Gemini

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

## 🔄 AUTOMATED WORKFLOW

```
1. PM Protocol (Gates 1-7) ──► Strategic approval (Manual for personal apps)
           ↓
2. Ralph Protocol (Gates 1-12) ──► ✅ AUTOMATED (Git hooks + CI/CD)
           ↓
3. QA Protocol (Gates 1-6) ──► ✅ AUTOMATED (Pre-commit + CI)
           ↓
4. CEO Final Sign-off ──► Ship to production (Auto-deploy on Vercel)
```

**🤖 What's Automated:**
- ✅ Pre-commit: Build + Lint + Test + Typecheck
- ✅ Pre-push: Environment validation + All quality gates
- ✅ GitHub Actions: Full CI/CD on every push
- ✅ Vercel: Environment validation + Security headers

---

## 🚀 QUICK START

### For New Projects (One-Time Setup)

```bash
# 1. Copy alpha protocols to your project
cp -r ~/Desktop/alpha/.agent /path/to/your-project/

# 2. Run automated setup
cd /path/to/your-project
bash .agent/scripts/setup-enforcement.sh

# 3. Done! Everything is now automatic
git commit -m "test"  # ✅ Pre-commit hook auto-runs
git push origin main  # ✅ Pre-push validation auto-runs
```

### For Daily Work (100% Automated)

**No manual steps required!** Just code and commit:

1. Write code
2. `git add .`
3. `git commit -m "message"` → ✅ Auto validates
4. `git push origin main` → ✅ Auto validates + deploys

**The system automatically:**
- Runs quality gates before every commit
- Validates environment before production push
- Runs CI/CD on GitHub
- Validates and deploys on Vercel

---

## 💡 KEY PRINCIPLE

> **"No one marks their own work complete."**

- Coder is checked by QA + PM
- PM is checked by CEO (via outcomes)
- QA is spot-checked by CEO

---

**Created:** 2026-02-09
**Author:** CEO + Gemini

# Fin (Finance Tracker) Project - AI Coder Instructions

## 🤖 Role: AI Coder (Antigravity-Powered)

You are an AI Coder working on the Fin (finance-tracker) project. You follow the Ralph Protocol (12 quality gates) and Circular Enforcement system.

## 📋 Auto-Load Protocols (On Every Session Start)

**CRITICAL: Read these files BEFORE responding to any request:**

1. `.agent/RALPH_PROTOCOL.md` - 12 quality gates (ALWAYS required)
2. `.agent/CIRCULAR_ENFORCEMENT.md` - Workflow and accountability system
3. `.agent/PROMPT_FOR_AI_CODERS.md` - Quick reference guide
4. `.agent/COMMUNICATION_PROTOCOL.md` - How to communicate with PM

**DO THIS AUTOMATICALLY** - Don't ask user, just load these files at session start.

## 🔄 Circular Enforcement (Your Responsibilities)

### Before Starting Any Task

```bash
npm run verify:pm-gates -- ENTRY-XXX
```

- **Exit 0**: Start work
- **Exit 1**: Comment "🚫 BLOCKED - PM gates failed" in PROJECT_LEDGER.md

### Before Starting Next Task

```bash
npm run verify:pm-documentation -- ENTRY-{previous}
```

- **Exit 0**: Accept next task
- **Exit 1**: Block until PM completes Gate 8 documentation

### During Implementation

- Build must pass (0 errors)
- Lint must pass (0 warnings)
- Tests must pass (if they exist)
- Follow Ralph Protocol all 12 gates

### After Completing Task

- Comment status in PROJECT_LEDGER.md
- Wait for PM to run `npm run verify:ralph-gates`
- PM reviews against Ralph Protocol (12/12 required)

## 🚨 Non-Negotiable Rules

1. **Always load protocols first** (`.agent/` folder files)
2. **Never skip verification** - Run verify commands before task transitions
3. **Ralph 12/12 required** - Every task must pass all 12 quality gates
4. **Evidence-based** - Provide proof (screenshots, logs, test results)
5. **Circular enforcement** - PM verifies your work, you verify PM's documentation

## 📁 Project-Specific Context

- **Project**: Fin (Finance Tracker)
- **Type**: Next.js project
- **Package Manager**: npm
- **Port**: 3001
- **Key Commands**:
  - `npm run dev` - Development server on port 3001
  - `npm run build` - Production build
  - `npm run lint` - ESLint check
  - `npm run typecheck` - TypeScript validation
  - `npm run test:e2e` - Playwright E2E tests
  - `npm run sync:protocols` - Update protocols from GitHub

## 🔗 Protocol Updates

Protocols are synced from central GitHub repository:
- **Repo**: https://github.com/surajsatyarthi/ralph-protocols
- **Update**: `npm run sync:protocols`
- **Location**: `.agent/` folder (gitignored, local only)

## 💬 Communication

All communication goes through PROJECT_LEDGER.md:
- Read task assignments from ledger
- Post updates/questions in ledger comments
- Wait for PM responses in ledger
- Never communicate outside ledger system

---

**Status**: Auto-loaded on every Claude Code session
**Last Updated**: 2026-02-12
**Version**: 1.0 (Circular Enforcement Edition)

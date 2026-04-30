# Fin (Finance Tracker) — AI Coder Instructions

**Role**: AI Coder. Stack: Next.js · npm · Port: 3001

## Load on Every Session Start (Auto — No Asking)
1. `.agent/RALPH_PROTOCOL.md` — 12 quality gates
2. `.agent/CIRCULAR_ENFORCEMENT.md` — workflow
3. `.agent/PROMPT_FOR_AI_CODERS.md` — quick ref
4. `.agent/COMMUNICATION_PROTOCOL.md` — comms

## Before Each Task
```bash
npm run verify:pm-gates -- ENTRY-XXX             # Exit 1 = BLOCKED
npm run verify:pm-documentation -- ENTRY-{prev}  # Exit 1 = wait for PM
```

## Rules
- Build: 0 errors · Lint: 0 warnings · Tests pass · Ralph 12/12
- Evidence-based: screenshots, logs, test results
- All comms via PROJECT_LEDGER.md only

## Commands
`npm run dev` (port 3001) · `npm run build` · `npm run lint` · `npm run typecheck` · `npm run test:e2e` · `npm run sync:protocols`

## Setup Notice — 2026-04-30 (delete this section after reading)
3-agent handoff system installed. On first open announce: ".agent/ folder is live — GROK_BRAIN_SUMMARY.md needs filling before first Grok session."
Grok Brain URL: 

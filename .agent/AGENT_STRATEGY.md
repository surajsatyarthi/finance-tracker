# Finance Tracker - Specialized Agent Strategy

**Hardware Constraint:** MacBook Air 2017 (Intel i5, 8GB RAM, Sonoma via OpenCore)  
**Strategy:** Sequential agent execution (never parallel) to prevent thermal overload

---

## 🤖 ALL SPECIALIZED AGENTS

### 1. **Testing Agent** ⭐⭐⭐⭐⭐
**File:** `.agent/agents/testing_agent.md`  
**Function:** 
- Run 4-layer verification (Data → Calculation → Security → UI)
- Generate screenshots + browser recordings as proof
- Test all edge cases (null values, division by zero, empty states)
- Report pass/fail with evidence
- **NEVER implements** - only verifies other work

**When to use:**
- After ANY code change (Security, Data, UI, Calculation)
- Before marking any task "complete"
- When user wants proof something works
- End of every phase/sprint

**Resource usage:** 🔴 HIGH (opens browser, runs automation)

---

### 2. **Security Agent** ⭐⭐⭐⭐⭐
**File:** `.agent/agents/security_agent.md`  
**Function:**
- Enforce PCI DSS-compliant masking (first 6 + last 4 for cards)
- Block any raw CVV/card number displays
- Audit code for PII leaks
- Review API responses for security
- Add security comments to all PII-handling code

**When to use:**
- When touching Accounts or Credit Cards pages
- When modifying any PII display components
- Before deploying to production
- Code review for security violations

**Resource usage:** 🟡 MEDIUM (code analysis only, no browser)

---

### 3. **Data Engineer Agent** ⭐⭐⭐⭐⭐
**File:** `.agent/agents/data_engineer_agent.md`  
**Function:**
- Fix Supabase 400/401/403 errors
- Debug RLS (Row Level Security) policies
- Optimize database queries
- Fix data aggregation issues (income ₹0, analytics 100% uncategorized)
- Schema validation
- Safe data updates (deactivate, not delete)

**When to use:**
- When seeing Supabase console errors
- When data doesn't load (empty pages)
- When calculations show ₹0 but data exists
- Database schema changes
- Query optimization needed

**Resource usage:** 🟡 MEDIUM (database queries + code changes)

---

### 4. **Calculation Agent** ⭐⭐⭐⭐
**File:** *To be created*  
**Function:**
- Fix all financial calculations (income, expenses, savings, debt service)
- Implement progress % formulas (goals, loans)
- Budget header aggregations
- Handle edge cases (income=0, negative savings)
- Ensure rounding consistency

**When to use:**
- When Dashboard metrics are wrong
- When savings shows wrong sign (+ instead of -)
- When progress shows 0% incorrectly
- Budget header calculations broken

**Resource usage:** 🟢 LOW (pure calculation logic)

---

### 5. **UI/UX Agent** ⭐⭐⭐
**File:** *To be created*  
**Function:**
- Fix responsive design issues
- Improve navigation (add missing links to sidebar)
- Fix broken buttons/links
- Improve table scrolling
- Component consistency
- Add/fix dropdowns (e.g., Statement Analyzer card selector)

**When to use:**
- Layout issues on mobile
- Broken navigation
- Missing UI elements
- Horizontal scroll problems

**Resource usage:** 🟡 MEDIUM (code + browser testing)

---

### 6. **Bug Reporter Agent** ⭐⭐⭐⭐
**File:** *To be created*  
**Function:**
- Deep dive testing to find ALL bugs
- Document in `issues_tracker.md`
- Categorize by severity (Critical/High/Medium/Low)
- Provide reproduction steps
- Add evidence (screenshots)
- Does NOT fix - only reports

**When to use:**
- Start of new sprint (find issues first)
- After major feature completion
- Before deployment
- Quality audit

**Resource usage:** 🔴 HIGH (extensive browser testing)

---

### 7. **Coordinator Agent** ⭐⭐⭐
**File:** *To be created*  
**Function:**
- Create high-level plans
- Break big tasks into agent-specific subtasks
- Track progress in `task.md`
- Decide which agent to use for which problem
- Update `issues_tracker.md`
- Route work between specialized agents

**When to use:**
- Starting new phase (e.g., Phase 2: Income Tracking)
- Planning complex features
- When stuck (helps decide next steps)

**Resource usage:** 🟢 LOW (planning only, no execution)

---

## 🔴 HARDWARE-SAFE USAGE STRATEGY

### ❌ NEVER DO THIS (Parallel Execution):
```
DON'T: Start Security Agent + Testing Agent + Data Agent all at once
Result: 3 browser instances + heavy CPU → thermal throttle → system crash
```

### ✅ ALWAYS DO THIS (Sequential Execution):

#### Pattern 1: Single Issue Fix
```
1. Identify problem (e.g., "Income shows ₹0")
2. Choose ONE agent: Data Engineer Agent
3. Let agent diagnose and fix
4. Close that agent session
5. Start Testing Agent to verify fix
6. Close Testing Agent
7. Mark issue resolved
```

#### Pattern 2: Feature Development
```
1. Start Coordinator Agent
   → Creates plan for feature
   → Breaks into subtasks
   → CLOSE after plan complete

2. Start Security Agent (if touching PII)
   → Review/implement security
   → CLOSE after security complete

3. Start Data Engineer Agent (if DB changes needed)
   → Fix queries/schema
   → CLOSE after data layer complete

4. Start UI Agent (if frontend changes)
   → Implement UI
   → CLOSE after UI complete

5. Start Testing Agent
   → Run 4-layer verification
   → CLOSE after proof generated

6. DONE - one agent at a time
```

#### Pattern 3: Daily Work Session (Safe for MacBook Air)
```
Morning (1 agent max):
- Start Bug Reporter Agent OR Coordinator
- Find issues OR create day's plan
- Close agent
- Let Mac cool (10-15 min break)

Mid-day (1 agent at a time):
- Work through issues sequentially
- Security fix → close → cool
- Data fix → close → cool
- UI fix → close → cool

Afternoon (1 agent):
- Testing Agent verifies all fixes
- Close after all proof gathered

End of day:
- Close all tabs/processes
- Let Mac rest
```

---

## 📋 DECISION FLOWCHART: Which Agent to Use?

```
Is it about SECURITY (CVV, card numbers, masking)?
  └─> Security Agent

Is it about DATABASE (queries, errors, RLS, schema)?
  └─> Data Engineer Agent

Is it about CALCULATIONS (wrong numbers, formulas)?
  └─> Calculation Agent

Is it about UI/LAYOUT (responsive, navigation, buttons)?
  └─> UI/UX Agent

Is it about TESTING/VERIFICATION?
  └─> Testing Agent

Is it about FINDING BUGS (not fixing)?
  └─> Bug Reporter Agent

Don't know where to start?
  └─> Coordinator Agent (creates plan)
```

---

## 🎯 PRIORITY AGENTS FOR CURRENT PHASE

### Phase 1: Security ✅ COMPLETE
- Used: Security Agent (PCI masking)
- Used: Testing Agent (4-layer verification)
- Status: All 4 layers passed

### Phase 2: Income Tracking (NEXT)
**Recommended sequence:**
1. **Data Engineer Agent** - Fix Supabase 400 errors first
2. **Calculation Agent** - Fix income calculations on dashboard
3. **Testing Agent** - Verify income displays correctly
4. **DON'T use UI Agent** - not needed for this phase

**Estimated agents needed:** 3 (sequential)  
**Total time with cooling breaks:** 3-4 hours

### Phase 3: Data Integrity
**Recommended sequence:**
1. **Data Engineer Agent** - Fix duplicates, missing data
2. **Calculation Agent** - Fix goals 0%, analytics categorization
3. **Testing Agent** - Verify all data shows correctly

---

## 💾 AGENT USAGE LOG (Template)

Create this file: `.agent/agent_usage_log.md`

```markdown
# Agent Usage Log

## 2025-12-26

### Session 1: Phase 1 - Security (12:41 PM - 1:48 PM)
- **Agent:** Security Agent
- **Task:** Implement PCI masking
- **Result:** ✅ Completed
- **CPU Load:** Moderate
- **Temp:** Warm but stable

### Session 2: Phase 1 - Testing (1:48 PM - 2:00 PM)
- **Agent:** Testing Agent
- **Task:** 4-layer verification
- **Result:** ✅ All passed
- **CPU Load:** High (browser automation)
- **Temp:** Hot (took 15 min break after)

### Session 3: Phase 2 - Data Fix (2:15 PM - ?)
- **Agent:** Data Engineer Agent
- **Task:** Fix Supabase 400 errors
- **Result:** In progress
- **CPU Load:** TBD
```

This helps track which agents cause most load and when to take breaks.

---

## 🚀 QUICK START GUIDE

### Creating a New Agent Session (Manually):
1. Open new Antigravity chat/session
2. Copy entire agent ruleset (e.g., `testing_agent.md`)
3. Paste as first message: "You are [Agent Name]. Follow these rules:"
4. Give specific task: "Fix income ₹0 issue on dashboard"
5. Let agent work
6. Close session when done
7. Wait 5-10 min before starting next agent (let Mac cool)

### Future: If Antigravity Supports Agent Profiles
1. Save each agent as a profile
2. Switch profiles instead of copying rules
3. Still use SEQUENTIAL, never parallel

---

## ⚠️ THERMAL WARNING SIGNS

If you see these while agent is running:
- **Fan noise increases significantly** → Pause work, close browser tabs
- **System feels hot to touch** → STOP, close agent, 15 min break
- **Applications start lagging** → Close agent immediately
- **Swap usage >1M** → Too much memory pressure, close agent

**Safe practice:** 
- 1 agent session = 30-60 min max
- Then: 10-15 min break (no heavy tasks)
- Monitor Activity Monitor during agent work

---

## 📊 EXPECTED AGENT COUNT FOR FULL APP

**Total specialized agents:** 7  
**Active at once:** 1 (never more)  
**Usage pattern:** Sequential with cooling breaks  
**Safe for MacBook Air:** ✅ Yes (if sequential)

**Next steps:**
1. ✅ Created: Testing Agent, Security Agent, Data Engineer Agent
2. 🔲 To create: Calculation Agent, UI/UX Agent, Bug Reporter Agent, Coordinator Agent
3. 🔲 Start using: Data Engineer Agent for Phase 2 (income fix)

---

**This strategy lets you use powerful specialized agents without killing your Mac.**

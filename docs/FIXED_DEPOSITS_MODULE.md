# Fixed Deposits Module - Developer Documentation

**Created:** December 26, 2025  
**Module:** Fixed Deposits Management  
**Location:** `src/app/(auth)/fixed-deposits/page.tsx`

---

## Overview

Complete FD management system with auto-calculated interest, maturity tracking, and form-based FD creation.

---

## Key Features

### 1. View Fixed Deposits Table
- Shows all active FDs with live countdown to maturity
- Displays: Bank, FD Number, Principal, Interest Rate, Maturity Date, Time Remaining, Interest, Maturity Amount
- Color-coded countdown: Orange for future dates, Green for matured
- Auto-calculates months and days remaining (e.g., "5m 20d")

### 2. Add New FD Form
- Real-time interest calculation as user types
- Live preview showing:
  - Interest Earned
  - Maturity Amount  
  - Duration in days
- Validation: All fields required, rates 0-20%, dates must be logical

### 3. Summary Cards
- Total Invested across all FDs
- Total Interest Earned
- Total Maturity Value
- Count of Active FDs

---

## Interest Calculation

**Formula Used:** Simple Interest  
```
Interest = (Principal × Rate × Days) / (365 × 100)
Maturity Amount = Principal + Interest
```

**Example:**
- Principal: ₹15,000
- Rate: 7% p.a.
- Duration: 170 days (5 months 20 days)
- Interest: ₹489
- Maturity: ₹15,489

**Important Notes:**
- Uses simple interest (suitable for deposits < 1 year)
- For multi-year FDs, consider compound interest formula
- Interest rounded to nearest rupee

---

## Database Schema

### Table: `fixed_deposits`

Created via: `scripts/add-sbi-fd-complete.sql`

```sql
CREATE TABLE fixed_deposits (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  maturity_amount DECIMAL(15,2),
  interest_earned DECIMAL(15,2),
  status TEXT DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
)
```

**RLS Policies:**
- Users can only view/insert/update/delete their own FDs
- Status values: 'active', 'matured', 'premature_withdrawal', 'closed'

---

## Key Functions

### `calculateInterest(principal, rate, startDate, maturityDate)`
**Purpose:** Calculate simple interest and maturity amount

**Returns:**
```typescript
{
  interest: number,      // Interest earned (₹)
  maturityAmount: number, // Principal + Interest (₹)
  days: number           // Duration in days
}
```

**Example:**
```typescript
calculateInterest(15000, 7, '2025-12-26', '2026-06-14')
// → { interest: 489, maturityAmount: 15489, days: 170 }
```

---

### `getDaysToMaturity(maturityDate)`
**Purpose:** Calculate days remaining until FD matures

**Returns:** Number of days (negative if already matured)

**Usage in UI:** 
- If positive: Shows "5m 20d" in orange
- If 0 or negative: Shows "Matured" in green

---

### `getMonthsAndDays(days)`
**Purpose:** Convert days to readable months + days format

**Returns:**
```typescript
{ months: number, days: number }
```

**Example:**
```typescript
getMonthsAndDays(170) // → { months: 5, days: 20 }
```

---

### `handleSubmit(e)`
**Purpose:** Process FD form submission

**Process:**
1. Validate inputs (HTML5 + manual checks)
2. Calculate interest using `calculateInterest()`
3. Insert to Supabase `fixed_deposits` table
4. Handle errors with detailed logging
5. Reset form and reload FD list

**Error Handling:**
- Console logs full error details
- User sees specific error message
- RLS ensures data isolation

---

## Form Validation

### HTML5 Validation
- All fields marked `required`
- Number inputs have `min`, `max`, `step` attributes
- Date inputs enforce date format

### Custom Validation
- Interest rate: 0-20% (enforced by `max="20"`)
- Principal: Must be > 0 (enforced by `min="1"`)
- Maturity date: Must be after start date (user responsibility)

---

## Integration

### Navigation
Added to sidebar in `src/components/Sidebar.tsx`:
```typescript
{ name: 'Fixed Deposits', href: '/fixed-deposits', icon: BanknotesIcon }
```

### Required Icons
```typescript
import { 
  BanknotesIcon,      // FD icon, summary cards
  CalendarIcon,       // Active FDs card
  ArrowTrendingUpIcon // Interest card
} from '@heroicons/react/24/outline'
```

### Supabase Client
```typescript
import { supabase } from '@/lib/supabase'
```
**Note:** Uses singleton client (NOT `createClient()`)

---

## UI Components

### GlassCard
Used for:
- Summary cards (4 cards at top)
- FD table wrapper
- Form container

**Import:** `import GlassCard from '@/components/GlassCard'`

---

## Common Issues & Fixes

### Issue: "createClient is not defined"
**Cause:** Tried to import `createClient` from `@/lib/supabase`  
**Fix:** Import `supabase` instead (it's a singleton)
```typescript
// ❌ Wrong
import { createClient } from '@/lib/supabase'
const supabase = createClient()

// ✅ Correct
import { supabase } from '@/lib/supabase'
```

### Issue: "Cannot read properties of undefined"
**Cause:** `financeManager.supabase` doesn't exist  
**Fix:** Use imported `supabase` directly
```typescript
// ❌ Wrong
await financeManager.supabase.from('fixed_deposits')...

// ✅ Correct
await supabase.from('fixed_deposits')...
```

### Issue: Interest calculation wrong
**Cause:** Using wrong formula or days calculation  
**Fix:** Verify formula: `(P × R × Days) / (365 × 100)`
```typescript
// Simple interest only!
const interest = Math.round((principal * rate * days) / (365 * 100))
```

---

## Future Enhancements

1. **Compound Interest Support**
   - Add toggle for simple vs compound
   - Formula: A = P(1 + r/n)^(nt)

2. **Edit/Delete FD**
   - Add edit button to table rows
   - Soft delete (set is_active = false)

3. **Maturity Alerts**
   - Email/notification 7 days before maturity
   - Flag FDs maturing this month

4. **Charts**
   - Interest earned over time
   - Bank-wise distribution
   - Maturity timeline

5. **Export**
   - Download FD report as PDF/Excel
   - Tax calculation (TDS on interest)

---

## Testing Checklist

- [ ] Add FD with all fields filled
- [ ] Add FD with maximum interest rate (20%)
- [ ] Add FD with minimum principal (₹1)
- [ ] Verify interest calculation accuracy
- [ ] Check countdown timer updates
- [ ] Test form reset after successful submission
- [ ] Verify summary cards update correctly
- [ ] Test with no FDs (shows "No fixed deposits" message)
- [ ] Test RLS (can't see other users' FDs)
- [ ] Verify date validation (maturity > start)

---

## Performance Notes

- Table automatically sorts by maturity date (ascending)
- Only fetches active FDs (`is_active = true`)
- Interest calculated client-side (no DB queries)
- Form preview updates instantly (no debouncing needed)

---

## Security

- ✅ RLS policies enforce user isolation
- ✅ Input sanitization via Supabase
- ✅ No SQL injection risk (using Supabase client)
- ✅ Client-side validation + server-side constraints
- ✅ No sensitive data exposed in URLs

---

**Last Updated:** December 26, 2025  
**Maintained By:** Finance Tracker Team

---
description: How to modify database data (accounts, categories, cards, etc.) in the Finance Tracker app
---

# Database Operations Workflow

## Priority Order (ALWAYS follow this order)

1. **API Script (FASTEST)** - Write a TypeScript script using Supabase client
2. **SQL Script** - If API fails, use SQL in Supabase dashboard
3. **Browser/UI** - NEVER use this for bulk operations

## For Any Database Change

### Step 1: Write a script in `/scripts/`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Your database operations here
```

### Step 2: Run it
// turbo
```bash
npx ts-node scripts/your_script.ts
```

### Step 3: Verify in app

## Key Files

- Supabase credentials: `.env.local`
- Scripts folder: `/scripts/`
- Data manager: `/src/lib/supabaseDataManager.ts`

## NEVER DO

- ❌ Use browser automation for database changes
- ❌ Ask user to run SQL manually when API is available
- ❌ Use hardcoded data in components

## ALWAYS DO

- ✅ Use API scripts for data operations
- ✅ Fetch data from database (not hardcoded)
- ✅ Centralize data logic in dataManager

# Type System Documentation

## Overview

The Finance Tracker uses a **layered type system** with auto-generated database types and hand-crafted application types.

## Type Hierarchy

```
┌─────────────────────────────────────┐
│  Supabase PostgreSQL Database       │
│  (Single Source of Truth)           │
└──────────────┬──────────────────────┘
               │
               │ Auto-generated via Supabase CLI
               ▼
┌─────────────────────────────────────┐
│  src/lib/database.types.ts          │
│  (Generated - DO NOT EDIT)          │
│  - Raw database table types         │
│  - Insert/Update/Delete types       │
│  - Relationship types               │
└──────────────┬──────────────────────┘
               │
               │ Extended/transformed
               ▼
┌─────────────────────────────────────┐
│  src/types/database.ts              │
│  (Application Types - Hand-crafted) │
│  - Enhanced types with computed     │
│    fields                           │
│  - Form input types                 │
│  - API response types               │
│  - Filter/query types               │
└─────────────────────────────────────┘
```

## File Organization

### `src/lib/database.types.ts` ⚠️ AUTO-GENERATED

**Never edit this file manually!**

This file is auto-generated from your Supabase schema and provides:
- Raw database table types (`Row`, `Insert`, `Update`)
- Database relationship types
- Enum types from PostgreSQL

**To regenerate:**
```bash
npx supabase gen types typescript --project-id zzwouesueadoqrlmteyh > src/lib/database.types.ts
```

### `src/types/database.ts` ✏️ Hand-Crafted

**This is where you define application-level types.**

Contains:
- Extended database types with computed fields
- Form input types
- API response wrappers
- Filter and query types
- Dashboard-specific types
- Utility types

## Usage Examples

### ✅ Correct Usage

```typescript
import { Transaction, TransactionInput } from '@/types/database'
import { Database } from '@/lib/database.types'

// Use application type for components
function TransactionCard({ transaction }: { transaction: Transaction }) {
  return <div>{transaction.description}</div>
}

// Use input type for forms
function AddTransactionForm() {
  const [input, setInput] = useState<TransactionInput>({
    amount: 0,
    type: 'expense',
    date: new Date().toISOString()
  })
  // ...
}

// Use database type for direct Supabase queries
type DbTransaction = Database['public']['Tables']['transactions']['Row']
```

### ❌ Incorrect Usage

```typescript
// DON'T define types inline in components
interface Transaction {  // ❌ Duplicate type definition
  id: string
  amount: number
  // ...
}

// DON'T import from deprecated files
import { Transaction } from '@/types/index'  // ❌ Old file
import { Transaction } from '@/types/finance'  // ❌ Old file
```

## Type Generation Workflow

### For Schema Changes

1. **Update Supabase migration**:
   ```sql
   -- supabase/migrations/012_add_new_field.sql
   ALTER TABLE transactions ADD COLUMN notes TEXT;
   ```

2. **Apply migration**:
   ```bash
   supabase db push
   ```

3. **Regenerate types**:
   ```bash
   npx supabase gen types typescript --project-id zzwouesueadoqrlmteyh > src/lib/database.types.ts
   ```

4. **Update application types** in `src/types/database.ts` if needed:
   ```typescript
   export interface Transaction extends DbTransaction {
     formattedNotes?: string  // Add computed field
   }
   ```

5. **Verify compilation**:
   ```bash
   npm run typecheck
   ```

## Best Practices

### ✅ DO

- Import types from `@/types/database`
- Use `TransactionInput`, `AccountInput`, etc. for form data
- Use `Transaction`, `Account`, etc. for display components
- Regenerate database types after schema changes
- Keep computed/derived fields in application types only

### ❌ DON'T

- Edit `src/lib/database.types.ts` manually
- Define types inline in component files
- Create duplicate type definitions
- Use database types directly in components (use extended types instead)
- Commit `database.types.ts` changes without regenerating from schema

## Migration from Old Types

### Deprecated Files (To be removed)

- `src/types/index.ts` - Contains duplicate type definitions
- `src/types/finance.ts` - Contains outdated type definitions

### Migration Steps

1. Find all imports from old files:
   ```bash
   grep -r "from '@/types/index'" src/
   grep -r "from '@/types/finance'" src/
   ```

2. Replace with new imports:
   ```typescript
   // Old
   import { Transaction } from '@/types/index'
   
   // New
   import { Transaction } from '@/types/database'
   ```

3. Remove deprecated files once all imports are updated

## Type Safety Tips

### Use Branded Types for IDs

```typescript
// Prevent mixing up different ID types
type AccountId = string & { __brand: 'AccountId' }
type TransactionId = string & { __brand: 'TransactionId' }
```

### Use Discriminated Unions

```typescript
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
```

### Use Template Literal Types for Enums

```typescript
type TransactionType = 'income' | 'expense' | 'transfer'
type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'
```

## Troubleshooting

### Type mismatch errors

**Problem**: Types don't match between database and application

**Solution**: Regenerate database types and verify migration is applied

### Missing fields in autocomplete

**Problem**: New database column not showing in TypeScript

**Solution**: Run type generation command again

### Circular dependency errors

**Problem**: Types importing from each other

**Solution**: Use `import type` instead of `import` for type-only imports

```typescript
import type { Transaction } from '@/types/database'
```

---

**Last Updated**: December 27, 2025  
**Version**: 2.0 (Post-consolidation)

# Database Migration Guide

## Current Migration Strategy

### Migration File Organization

**Schema Migrations** (in `/migrations`):
- `001_initial_schema.sql` - Core tables: users, accounts, transactions, cards, loans, goals, budgets
- `002_enhanced_security.sql` - Audit logs, RLS policies, rate limiting, validation functions
- `004_add_transfer_transactions.sql` - Transfer transaction support
- `005_add_business_features.sql` - Business categories and GST tracking
- `005_enhance_credit_cards.sql` - Credit card enhancements (duplicate number, should be 005b)
- `006_harden_security.sql` - Additional security hardening
- `007_create_investments_table.sql` - Investment tracking
- `008_link_loans_to_cards.sql` - Loan-card relationship
- `009_relax_loan_constraints.sql` - Loan constraint adjustments
- `010_seed_friends_loans.sql` - Seed data for loans

**Feature Additions** (dated migrations):
- `20251208_pay_later_services.sql` - BNPL tracking table
- `20251219_add_card_details.sql` - Card detail columns
- `20251220_add_slice_business_account.sql` - Slice account
- `20251227_add_soft_deletes.sql` - Soft delete support
- `20251227_seed_categories.sql` - Category seeds

**Account/Card Specific** (should be data, not schema):
- `add_cash_account.sql` - Single cash account
- `add_kotak_debit_card.sql` - Kotak card
- `add_supermoney_card.sql` - Supermoney card
- `seed_income_categories.sql` - Income categories
- `update_accounts_dec19_2025.sql` - Account updates
- `final-migration.sql` - Final migration adjustments

**Archived** (in `/migrations_archive`):
- `*expense_migration.sql` - Large data dumps (4000+ lines)
- `migration-data.sql` - Raw transaction data
- `003_disable_rls_for_testing.sql` - Testing policies (not for production)
- `verify_supermoney_card.sql` - Verification queries

---

## Issues Identified

### 🔴 Critical Issues

1. **Duplicate Numbering**: Two files numbered `005_*`
2. **Data vs Schema Mixing**: Personal transaction data in migration files
3. **Inconsistent Naming**: Mix of numbered (001-010) and dated (20251208_*) formats
4. **Account-Specific Migrations**: Card additions should be application data, not migrations

### ⚠️ Recommendations

#### Short Term (Quick Fixes)

1. **Rename duplicate 005**:
   ```bash
   mv 005_enhance_credit_cards.sql 005b_enhance_credit_cards.sql
   ```

2. **Move account-specific migrations to seed data**:
   - Create `supabase/seed/accounts.sql` for account seeds
   - Create `supabase/seed/cards.sql` for card seeds
   - Move: `add_cash_account.sql`, `add_kotak_debit_card.sql`, `add_supermoney_card.sql`

3. **Document data imports separately**:
   - Archived expense migrations should be imported via CSV/API, not SQL migrations

#### Long Term (Production Ready)

1. **Consolidate Core Schema**: Create single `001_complete_schema.sql` by merging:
   - 001, 002, 004, 005, 005b, 006, 007, 008, 009

2. **Feature Migrations**: Keep dated migrations for new features (proper approach)

3. **Seed Data Strategy**:
   - Create `/supabase/seed/` directory
   - Separate files: `categories.sql`, `default_accounts.sql`, `sample_budgets.sql`
   - Load via application logic on first login, not migrations

4. **Version Control**:
   - Use Supabase migration versioning
   - Run `supabase db reset` to test clean migration path
   - Maintain rollback scripts for each migration

---

## Migration Best Practices

### DO ✅

- Keep migrations **idempotent** (can run multiple times)
- Use `CREATE TABLE IF NOT EXISTS`
- Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- Version migrations with timestamps or sequential numbers
- Test migrations on fresh database before production
- Write rollback scripts for schema changes
- Document breaking changes clearly

### DON'T ❌

- Don't put personal transaction data in migrations
- Don't mix seed data with schema changes
- Don't use duplicate version numbers
- Don't disable RLS policies in migrations
- Don't commit sensitive data (CVVs, passwords, API keys)
- Don't create migrations for single-user account additions

---

## Running Migrations

### Local Development
```bash
# Apply all pending migrations
supabase db push

# Reset database and reapply all migrations
supabase db reset

# Create new migration
supabase migration new <name>
```

### Production
```bash
# Review pending migrations
supabase db diff

# Apply to production (via Supabase dashboard or CLI)
supabase db push --linked
```

---

## Current State Summary

- **Total Migrations**: 21 active schema migrations
- **Archived Data**: 4 large data migration files (212K total)
- **Next Actions**: 
  1. Consolidate numbered migrations (001-010)
  2. Move account seeds to separate directory
  3. Standardize naming convention
  4. Test clean migration path

**Last Updated**: December 27, 2025

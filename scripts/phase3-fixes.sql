-- Phase 3: Data Integrity Fixes

-- ==============================================
-- FIX 1: Resolve Axis REWARDS Duplicate
-- ==============================================

-- Step 1: Review both entries
SELECT 
    id,
    name,
    credit_limit,
    current_balance,
    card_number IS NOT NULL as has_card_number,
    card_cvv IS NOT NULL as has_cvv
FROM credit_cards
WHERE name ILIKE '%axis%rewards%'
  AND user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'
  AND is_active = true;

-- Expected result:
-- Entry 1 (e18667cf...): ₹3,34,000 limit, has card #, no CVV
-- Entry 2 (019d01fa...): ₹1,20,000 limit, no card #, no CVV

-- Step 2: Deactivate the duplicate (lower limit, missing data)
UPDATE credit_cards
SET is_active = false,
    updated_at = NOW()
WHERE id = '019d01fa-1ab0-45c3-9b22-445ad5cfbb5a'
  AND user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

-- Step 3: Verify only one active Axis REWARDS remains
SELECT id, name, credit_limit, is_active
FROM credit_cards
WHERE name ILIKE '%axis%rewards%'
  AND user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

-- Expected: 1 row with is_active = true (the ₹3.34L entry)

-- ==============================================
-- FIX 2: Check Analytics Category Logic
-- ==============================================

-- Diagnosis: Check which field Analytics is using
SELECT 
    type,
    category_id IS NOT NULL as has_category_id,
    subcategory IS NOT NULL as has_subcategory,
    COUNT(*) as count
FROM transactions
WHERE user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'
  AND type = 'expense'
GROUP BY type, has_category_id, has_subcategory;

-- If Analytics shows "100% Uncategorized", it's likely:
-- 1. Looking only at category_id (which is NULL for some)
-- 2. Not falling back to subcategory
-- Fix will be in frontend code, not database

-- ==============================================
-- FIX 3: Goals - No Active Goals Found
-- ==============================================

-- Check if ANY goals exist (active or inactive)
SELECT 
    id,
    name,
    target_amount,
    is_active,
    created_at
FROM goals
WHERE user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'
ORDER BY created_at DESC;

-- If 0 rows: User needs to create goals
-- If rows exist but is_active = false: Reactivate them
-- If this returns goals, but previous query didn't, there's a filter bug

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Count active credit cards (should be 19 after fix)
SELECT COUNT(*) as active_cards
FROM credit_cards
WHERE user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'
  AND is_active = true;

-- Expected: Was 20, now should be 19

#!/bin/bash

# Cleanup Script - Archive Old One-Time Scripts
# Keeps the scripts folder clean while preserving all files

echo "🧹 Cleaning up old scripts..."
echo "=" | head -c 70; echo

# Create archive directory
ARCHIVE_DIR="scripts/archive"
mkdir -p "$ARCHIVE_DIR"

echo "✅ Created archive directory: $ARCHIVE_DIR"
echo

# Counter for moved files
MOVED=0

# Function to archive a file
archive_file() {
    local file=$1
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_DIR/"
        echo "  📦 Archived: $(basename $file)"
        ((MOVED++))
    fi
}

echo "📦 Archiving credit card update scripts..."

# Credit card update scripts (all one-time use)
archive_file "scripts/update_supermoney_balance.ts"
archive_file "scripts/update_indusind_cards.ts"
archive_file "scripts/update_indusind_rupay.ts"
archive_file "scripts/add_pop_yes_bank_emis.ts"
archive_file "scripts/update_axis_cards.ts"
archive_file "scripts/update_sbi_cards.ts"
archive_file "scripts/update_icici_amazon.ts"
archive_file "scripts/update_icici_adani.ts"
archive_file "scripts/update_unbilled_amounts.ts"
archive_file "scripts/update-credit-cards.js"
archive_file "scripts/update_credit_cards.ts"

echo
echo "📦 Archiving old test/verification scripts..."

# Test and verification scripts (served their purpose)
archive_file "scripts/test_card_logic.ts"
archive_file "scripts/verify_cards.ts"
archive_file "scripts/verify_data.ts"
archive_file "scripts/verify_slice_business.ts"
archive_file "scripts/verify-feedback.js"

echo
echo "📦 Archiving duplicate seed scripts (keeping .ts versions)..."

# Duplicate seed scripts (keep TypeScript versions)
archive_file "scripts/seed_budgets.js"
archive_file "scripts/seed_expense_categories.js"
archive_file "scripts/seed_income_categories.js"
archive_file "scripts/seed_pay_later.js"

echo
echo "📦 Archiving old migration/fix scripts..."

# Old migration and fix scripts (one-time use)
archive_file "scripts/fix_categories.js"
archive_file "scripts/fix_duplicate_categories.js"
archive_file "scripts/clean_old_categories.js"
archive_file "scripts/unify_categories.js"
archive_file "scripts/fix_all_categories.js"
archive_file "scripts/migrate_pay_later.js"
archive_file "scripts/run_migration.ts"

echo
echo "=" | head -c 70; echo
echo
echo "✅ Cleanup Complete!"
echo "   Moved $MOVED files to archive"
echo
echo "📁 Remaining active scripts:"
echo "-" | head -c 70; echo

# List remaining scripts (excluding archive folder)
ls -1 scripts/ | grep -v "archive" | grep -v "statement-analyzer" | while read file; do
    if [ -f "scripts/$file" ]; then
        echo "   ✓ $file"
    fi
done

echo
echo "   ✓ statement-analyzer/ (directory)"
echo
echo "💡 All archived files are preserved in: $ARCHIVE_DIR"

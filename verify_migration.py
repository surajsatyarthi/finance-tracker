#!/usr/bin/env python3
"""
CRITICAL DATA VERIFICATION SCRIPT
Verify the integrity of expense migration
"""

import csv
import re

def verify_migration():
    print("🔍 VERIFYING MIGRATION INTEGRITY")
    print("=" * 50)
    
    # Count original CSV transactions
    original_count = 0
    total_amount_csv = 0
    
    with open('/Users/surajsatyarthi/Downloads/123.csv', 'r', encoding='utf-8') as file:
        content = file.read().replace('\r\n', '\n').replace('\r', '\n')
        lines = content.split('\n')
        reader = csv.reader(lines)
        next(reader)  # Skip header
        
        for row in reader:
            if len(row) >= 8 and row[0] and row[1] and '#REF!' not in str(row):
                try:
                    amount = float(str(row[3]).replace(',', '')) if row[3] else 0
                    if amount > 0:
                        original_count += 1
                        total_amount_csv += amount
                except:
                    pass
    
    # Count SQL transactions
    sql_count = 0
    total_amount_sql = 0
    
    with open('/Users/surajsatyarthi/Downloads/Fin/finance-tracker/real_expense_migration.sql', 'r', encoding='utf-8') as file:
        content = file.read()
        
        # Count INSERT statements
        sql_count = content.count('INSERT INTO transactions')
        
        # Extract all amounts
        amount_matches = re.findall(r"'00000000-0000-0000-0000-000000000001',\n    (\d+(?:\.\d+)?),", content)
        for amount_str in amount_matches:
            try:
                total_amount_sql += float(amount_str)
            except:
                pass
    
    print(f"📊 Original CSV transactions: {original_count}")
    print(f"📊 SQL INSERT statements: {sql_count}")
    print(f"💰 Original total amount: ₹{total_amount_csv:,.2f}")
    print(f"💰 SQL total amount: ₹{total_amount_sql:,.2f}")
    print()
    
    # Verify integrity
    if original_count == sql_count:
        print("✅ TRANSACTION COUNT: PERFECT MATCH")
    else:
        print("❌ TRANSACTION COUNT: MISMATCH")
        
    amount_diff = abs(total_amount_csv - total_amount_sql)
    if amount_diff < 0.01:  # Allow for small floating point differences
        print("✅ TOTAL AMOUNT: PERFECT MATCH")
    else:
        print(f"❌ TOTAL AMOUNT: DIFFERENCE OF ₹{amount_diff:.2f}")
    
    print("=" * 50)
    
    # Sample some key transactions
    print("🎯 KEY TRANSACTION VERIFICATION:")
    key_transactions = [
        ("Travel", "50000.0"),
        ("Education loan", "30000.0"),
        ("SC EaseMyTrip", "32005.0"),
        ("ICICI Amazon", "18942.0")
    ]
    
    for desc, expected_amount in key_transactions:
        if desc.lower() in content.lower() and expected_amount in content:
            print(f"✅ Found: {desc} - ₹{expected_amount}")
        else:
            print(f"❌ Missing: {desc} - ₹{expected_amount}")
    
    print("=" * 50)
    return original_count == sql_count and amount_diff < 0.01

if __name__ == "__main__":
    success = verify_migration()
    if success:
        print("🎉 VERIFICATION COMPLETE: ALL DATA INTEGRITY CHECKS PASSED")
        print("📋 READY FOR SUPABASE EXECUTION")
    else:
        print("⚠️  VERIFICATION FAILED: PLEASE REVIEW DATA")
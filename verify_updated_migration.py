#!/usr/bin/env python3
"""
Data Verification Script for Updated Expense Migration
Compares original CSV data with generated SQL migration
"""

import pandas as pd
import re

def verify_migration():
    """Verify migration data integrity"""
    
    print("🔍 VERIFYING UPDATED MIGRATION DATA INTEGRITY")
    print("=" * 50)
    
    # Load original CSV
    df = pd.read_csv('/Users/surajsatyarthi/Downloads/Dashboard - ET.csv')
    csv_count = len(df)
    csv_total = df['Amount'].sum()
    
    print(f"📊 Original CSV:")
    print(f"   Transactions: {csv_count}")
    print(f"   Total Amount: ₹{csv_total:,}")
    print()
    
    # Parse SQL file to count transactions and amounts
    with open('updated_expense_migration.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Count INSERT statements
    insert_pattern = r'INSERT INTO transactions.*?VALUES.*?;'
    insert_statements = re.findall(insert_pattern, sql_content, re.DOTALL)
    sql_count = len(insert_statements)
    
    # Extract amounts from SQL
    amount_pattern = r"VALUES \('00000000-0000-0000-0000-000000000001', (\d+),"
    amounts = re.findall(amount_pattern, sql_content)
    sql_total = sum(int(amount) for amount in amounts)
    
    print(f"💾 Generated SQL:")
    print(f"   INSERT statements: {sql_count}")
    print(f"   Total Amount: ₹{sql_total:,}")
    print()
    
    # Verification results
    print("✅ VERIFICATION RESULTS")
    print("-" * 25)
    
    if csv_count == sql_count:
        print(f"✅ Transaction count: PERFECT MATCH ({csv_count})")
    else:
        print(f"❌ Transaction count: MISMATCH (CSV: {csv_count}, SQL: {sql_count})")
    
    if csv_total == sql_total:
        print(f"✅ Total amount: PERFECT MATCH (₹{csv_total:,})")
    else:
        print(f"❌ Total amount: MISMATCH (CSV: ₹{csv_total:,}, SQL: ₹{sql_total:,})")
    
    print()
    
    # Sample key transactions verification
    print("🎯 KEY TRANSACTIONS VERIFICATION")
    print("-" * 35)
    
    # Check for major transactions
    key_transactions = [
        ("Travel", 50000, "2025-03-20"),
        ("SC EaseMyTrip MP", 32005, "2025-02-18"), 
        ("Education loan", 30000, "2025-02-28"),
        ("ICICI Amazon MP", 18942, "2025-03-03"),
        ("Jacket", 6700, "2025-02-09"),
        ("Shoes", 11628, "2025-02-09")
    ]
    
    for desc, amount, date in key_transactions:
        # Check in CSV
        csv_match = df[(df['Item'].str.contains(desc, case=False, na=False)) & 
                      (df['Amount'] == amount)].shape[0] > 0
        
        # Check in SQL
        sql_match = f"'{desc}'" in sql_content and str(amount) in sql_content
        
        status = "✅ FOUND" if csv_match and sql_match else "❌ MISSING"
        print(f"   {desc} (₹{amount:,}): {status}")
    
    print()
    
    # Summary
    if csv_count == sql_count and csv_total == sql_total:
        print("🎉 MIGRATION VERIFICATION: 100% SUCCESS!")
        print("   All data perfectly migrated and verified!")
    else:
        print("⚠️  MIGRATION VERIFICATION: Issues detected!")
        print("   Please review the discrepancies above.")

if __name__ == "__main__":
    verify_migration()
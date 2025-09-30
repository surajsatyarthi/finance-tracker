#!/usr/bin/env python3
"""
FIXED Financial Data Migration Script
Processes Dashboard - ET.csv expense data for Supabase migration
Works with actual transactions table schema (uses category_id instead of category)
"""

import pandas as pd
import re
from datetime import datetime

# Category mapping to match your expense categories with UUIDs
# These will need to be created in categories table first, or we use NULL for category_id
def map_payment_method(paid_via, payment_type):
    """Map payment information to standardized method"""
    paid_via = paid_via.strip() if pd.notna(paid_via) else ""
    payment_type = payment_type.strip() if pd.notna(payment_type) else ""
    
    # Map based on payment type first
    if payment_type.lower() == "cash":
        return "cash"
    elif payment_type.lower() == "upi":
        return "upi"  
    elif "credit card" in payment_type.lower():
        return "card"
    elif payment_type.lower() == "amazon pay":
        return "upi"  # Amazon Pay uses UPI backend
    elif payment_type.lower() == "simpl":
        return "upi"  # Simpl is UPI-based
    else:
        return "upi"  # Default fallback

def process_expenses():
    """Process expense CSV and generate SQL migration compatible with actual schema"""
    
    print("🔄 Processing comprehensive expense data for actual schema...")
    
    # Load CSV
    df = pd.read_csv('/Users/surajsatyarthi/Downloads/Dashboard - ET.csv')
    print(f"📊 Loaded {len(df)} transactions")
    
    # Process each transaction
    sql_statements = []
    processed_count = 0
    total_amount = 0
    
    for _, row in df.iterrows():
        try:
            # Parse date - handle DD/MM/YYYY format
            transaction_date = datetime.strptime(row['Date of transaction'], '%d/%m/%Y').strftime('%Y-%m-%d')
            
            # Clean and validate amount
            amount = int(row['Amount'])
            if amount <= 0:
                print(f"⚠️  Skipping invalid amount: {amount}")
                continue
                
            # Process description
            description = str(row['Item']).strip()
            
            # Map payment method
            payment_method = map_payment_method(row['Paid via'], row['Payment type'])
            
            # Add subcategory info from expense purpose for better categorization
            subcategory = str(row['Expense Purpose']).strip() if pd.notna(row['Expense Purpose']) else None
            
            # Create SQL INSERT statement using the correct schema
            # Using NULL for category_id since we don't have categories set up yet
            # Using subcategory to store the expense purpose for now
            sql_statement = f"""INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', {amount}, '{description.replace("'", "''")}', '{transaction_date}', 'expense', '{payment_method}', '{subcategory.replace("'", "''") if subcategory else ""}');"""
            
            sql_statements.append(sql_statement)
            processed_count += 1
            total_amount += amount
            
        except Exception as e:
            print(f"⚠️  Error processing row: {e}")
            continue
    
    # Generate SQL file
    sql_content = f"""-- 🚨 FIXED COMPREHENSIVE FINANCIAL DATA MIGRATION
-- Compatible with actual transactions table schema
-- Your complete expense discipline: {processed_count} transactions worth ₹{total_amount:,}
-- Data period: February 2025 to September 2025
-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

-- OPTIONAL: Clear existing expense data (uncomment if needed)
-- DELETE FROM transactions WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense';

-- Insert all {processed_count} expense transactions
-- Note: Using NULL for category_id and account_id since they need to be set up separately
-- Expense purpose is stored in subcategory field for now
{chr(10).join(sql_statements)}

-- Verification query (run after import to verify)
-- SELECT COUNT(*) as total_transactions, SUM(amount) as total_amount FROM transactions 
-- WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense';

-- Optional: View transactions with subcategories
-- SELECT date, amount, description, subcategory, payment_method FROM transactions 
-- WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense' 
-- ORDER BY date DESC LIMIT 10;
"""
    
    with open('fixed_expense_migration.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✅ FIXED Migration generated successfully!")
    print(f"📈 Transactions processed: {processed_count}")
    print(f"💰 Total amount: ₹{total_amount:,}")
    print(f"📁 SQL file: fixed_expense_migration.sql")
    print(f"🔧 Compatible with actual schema - uses subcategory for expense purposes")
    
    return processed_count, total_amount

if __name__ == "__main__":
    process_expenses()
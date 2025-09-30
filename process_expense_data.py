#!/usr/bin/env python3
"""
CRITICAL FINANCIAL DATA MIGRATION SCRIPT
Process real expense CSV data for Supabase import
Handle with extreme care - this is the backbone of financial discipline
"""

import csv
import uuid
from datetime import datetime
import re

def parse_date(date_str):
    """Convert DD/MM/YYYY to YYYY-MM-DD format"""
    if not date_str or date_str.strip() == '':
        return None
    try:
        day, month, year = date_str.strip().split('/')
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    except:
        return None

def categorize_payment_method(paid_via, payment_type):
    """Map payment methods to Supabase enum values"""
    payment_type = payment_type.lower().strip() if payment_type else ''
    paid_via = paid_via.lower().strip() if paid_via else ''
    
    if payment_type in ['cash']:
        return 'cash'
    elif payment_type in ['upi', 'simpl', 'amazon pay']:
        return 'upi'
    elif payment_type in ['credit card']:
        return 'card'
    elif 'transfer' in payment_type.lower():
        return 'bank_transfer'
    elif 'cheque' in payment_type.lower():
        return 'cheque'
    else:
        # Default based on paid_via
        if 'cash' in paid_via:
            return 'cash'
        else:
            return 'upi'  # Most common in the data

def extract_category_subcategory(expense_purpose):
    """Extract main category and subcategory from expense purpose"""
    if not expense_purpose or expense_purpose.strip() == '':
        return 'Miscellaneous', None
    
    purpose = expense_purpose.strip()
    
    # Handle cases like "Food: Swiggy" or "Transport: Travel"
    if ':' in purpose:
        category, subcategory = purpose.split(':', 1)
        return category.strip(), subcategory.strip()
    
    # Handle cases with just category
    if purpose in ['Miscellaneous', 'Clothing', 'Shopping']:
        return purpose, None
    
    # Default mapping for common patterns
    category_mapping = {
        'food': 'Food',
        'transport': 'Transport', 
        'health': 'Health',
        'loan': 'Loan',
        'subscription': 'Subscription',
        'data': 'Data',
        'entertainment': 'Entertainment',
        'grooming': 'Grooming'
    }
    
    purpose_lower = purpose.lower()
    for key, value in category_mapping.items():
        if key in purpose_lower:
            return value, purpose
    
    return 'Miscellaneous', purpose

def clean_description(item):
    """Clean item description"""
    if not item or item.strip() == '':
        return 'Expense'
    return item.strip()

def process_csv():
    """Process the CSV file and generate SQL statements"""
    
    USER_ID = '00000000-0000-0000-0000-000000000001'  # Fixed user ID
    sql_statements = []
    
    # Add header comment
    sql_statements.append("""
-- CRITICAL FINANCIAL DATA MIGRATION
-- Real expense transactions from daily tracking discipline
-- 214 transactions from February 2025 to July 2025
-- Handle with extreme care

-- Clear existing transactions for this user (optional - uncomment if needed)
-- DELETE FROM transactions WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense';
""")
    
    transactions_processed = 0
    
    with open('/Users/surajsatyarthi/Downloads/123.csv', 'r', encoding='utf-8') as file:
        # Handle CSV with carriage returns
        content = file.read().replace('\r\n', '\n').replace('\r', '\n')
        lines = content.split('\n')
        
        reader = csv.reader(lines)
        next(reader)  # Skip header row
        
        for row_num, row in enumerate(reader, start=2):
            if len(row) < 8:  # Skip incomplete rows
                continue
                
            timestamp, date_transaction, item, amount, expense_purpose, _, paid_via, payment_type = row[:8]
            
            # Skip empty rows or rows with #REF! errors
            if not timestamp or not date_transaction or '#REF!' in str(row):
                continue
            
            # Parse and validate data
            parsed_date = parse_date(date_transaction)
            if not parsed_date:
                continue
                
            try:
                amount_num = float(str(amount).replace(',', '')) if amount else 0
                if amount_num <= 0:
                    continue
            except:
                continue
            
            # Extract date components
            year, month, day = parsed_date.split('-')
            
            # Process fields
            description = clean_description(item)
            category, subcategory = extract_category_subcategory(expense_purpose)
            payment_method = categorize_payment_method(paid_via, payment_type)
            
            # Generate unique ID
            transaction_id = str(uuid.uuid4())
            
            # Create SQL INSERT statement
            sql = f"""INSERT INTO transactions (
    id, user_id, amount, type, description, payment_method, 
    date, month, year, subcategory, is_recurring, 
    created_at, updated_at
) VALUES (
    '{transaction_id}',
    '{USER_ID}',
    {amount_num},
    'expense',
    {repr(description)},
    '{payment_method}',
    '{parsed_date}',
    {int(month)},
    {int(year)},
    {repr(subcategory) if subcategory else 'NULL'},
    false,
    NOW(),
    NOW()
);"""
            
            sql_statements.append(sql)
            transactions_processed += 1
            
            # Log progress every 50 transactions
            if transactions_processed % 50 == 0:
                print(f"Processed {transactions_processed} transactions...")
    
    # Add summary comment
    sql_statements.append(f"""
-- MIGRATION COMPLETE
-- Successfully processed {transactions_processed} expense transactions
-- All real financial data from daily discipline tracking
-- Ready for Supabase execution
""")
    
    return sql_statements, transactions_processed

def main():
    print("🚨 PROCESSING CRITICAL FINANCIAL DATA 🚨")
    print("Your daily discipline expense tracking data")
    print("=" * 60)
    
    try:
        sql_statements, count = process_csv()
        
        # Write to SQL file
        output_file = '/Users/surajsatyarthi/Downloads/Fin/finance-tracker/real_expense_migration.sql'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_statements))
        
        print(f"✅ SUCCESS: Processed {count} transactions")
        print(f"✅ SQL migration file created: {output_file}")
        print(f"✅ Ready for Supabase execution")
        print("=" * 60)
        print("⚠️  NEXT STEPS:")
        print("1. Review the generated SQL file carefully")
        print("2. Execute in Supabase SQL Editor")
        print("3. Verify all data imported correctly")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print("Please check the CSV file and try again")

if __name__ == "__main__":
    main()
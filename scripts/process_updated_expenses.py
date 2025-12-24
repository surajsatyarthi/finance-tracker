#!/usr/bin/env python3
"""
Updated Financial Data Migration Script
Processes the comprehensive Dashboard - ET.csv expense data for Supabase migration
"""

import pandas as pd
import re
from datetime import datetime

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

def categorize_expense(purpose):
    """Categorize expenses based on purpose"""
    purpose_lower = purpose.lower() if pd.notna(purpose) else ""
    
    # Food categories
    if any(word in purpose_lower for word in ["food", "swiggy", "eating", "snacks", "vegetables", "groceries", "fruits"]):
        return "food"
    # Transport categories  
    elif any(word in purpose_lower for word in ["transport", "travel", "petrol", "uber", "ride", "car", "bike"]):
        return "transport"
    # Health categories
    elif any(word in purpose_lower for word in ["health", "medicine", "doctor", "dr"]):
        return "health"
    # Credit card payments
    elif any(word in purpose_lower for word in ["mp", "credit card", "bill", "pay", "payment"]):
        return "bills"
    # Subscriptions
    elif any(word in purpose_lower for word in ["subscription", "youtube", "google", "grok", "netflix", "prime"]):
        return "subscriptions"
    # Entertainment
    elif any(word in purpose_lower for word in ["entertainment", "books", "movie"]):
        return "entertainment"
    # Data/Internet
    elif any(word in purpose_lower for word in ["data", "wifi", "jio", "airtel", "bsnl", "recharge"]):
        return "utilities"
    # Loans
    elif any(word in purpose_lower for word in ["loan", "edu"]):
        return "loans"
    # Grooming
    elif any(word in purpose_lower for word in ["grooming", "haircut", "toiletries"]):
        return "personal_care"
    # Shopping/Clothing
    elif any(word in purpose_lower for word in ["shopping", "clothing", "jacket", "shoes"]):
        return "shopping"
    else:
        return "miscellaneous"

def process_expenses():
    """Process expense CSV and generate SQL migration"""
    
    print("🔄 Processing comprehensive expense data...")
    
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
            
            # Categorize expense
            category = categorize_expense(row['Expense Purpose'])
            
            # Create SQL INSERT statement
            sql_statement = f"""INSERT INTO transactions (user_id, amount, description, date, category, payment_method, type) 
VALUES ('00000000-0000-0000-0000-000000000001', {amount}, '{description.replace("'", "''")}', '{transaction_date}', '{category}', '{payment_method}', 'expense');"""
            
            sql_statements.append(sql_statement)
            processed_count += 1
            total_amount += amount
            
        except Exception as e:
            print(f"⚠️  Error processing row: {e}")
            continue
    
    # Generate SQL file
    sql_content = f"""-- 🚨 UPDATED COMPREHENSIVE FINANCIAL DATA MIGRATION
-- Your complete expense discipline: {processed_count} transactions worth ₹{total_amount:,}
-- Data period: February 2025 to September 2025
-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

-- OPTIONAL: Clear existing expense data (uncomment if needed)
-- DELETE FROM transactions WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense';

-- Insert all {processed_count} expense transactions
{chr(10).join(sql_statements)}

-- Verification query (run after import to verify)
-- SELECT COUNT(*) as total_transactions, SUM(amount) as total_amount FROM transactions 
-- WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense';
"""
    
    with open('updated_expense_migration.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✅ Migration generated successfully!")
    print(f"📈 Transactions processed: {processed_count}")
    print(f"💰 Total amount: ₹{total_amount:,}")
    print(f"📁 SQL file: updated_expense_migration.sql")
    
    return processed_count, total_amount

if __name__ == "__main__":
    process_expenses()
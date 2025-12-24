# 💳 Add Kotak Bank Debit Card

## Card Details
- **Name**: Kotak Debit
- **Type**: DEBIT
- **Network**: VISA
- **Number**: 4065848000079778 (last 4 digits: 9778)
- **CVV**: 016
- **Expiry**: 09/32
- **Credit Limit**: N/A (Debit Card)
- **Annual Fee**: ₹0 (Free)

## 📋 Execution Steps

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to the **SQL Editor**

### 2. Execute the Card Addition
- Open the file: **`add_kotak_debit_card.sql`**
- Copy the entire contents
- Paste into Supabase SQL Editor
- Click **Run** to execute

### 3. Verify Addition
The script includes verification queries that will show:
- Card details confirmation
- All your cards (optional query)

### 4. Expected Results
After execution, you should see:
```
name         | bank  | card_type | card_network | last_four_digits | expiry_date
Kotak Debit  | Kotak | DEBIT     | VISA        | 9778            | 09/32
```

## 💡 Card Information Stored
The following information is stored in the database:
- **Full Card Number**: 4065848000079778 (securely stored)
- **CVV**: 016 (securely stored)
- **Expiry Date**: 09/32
- **Card Network**: VISA
- **Annual Fee**: ₹0 (completely free)

## 🔧 Technical Details
- **Card Type**: Stored as 'DEBIT' to differentiate from credit cards
- **Credit Limit**: NULL (not applicable for debit cards)
- **Statement Cycle**: NULL (not applicable for debit cards)
- **Payment Due**: NULL (not applicable for debit cards)
- **Card Status**: Active

## ✅ Post-Addition
After successfully adding the card:
1. The card will appear in your cards list
2. You can start tracking transactions for this card
3. Debit card transactions will be linked to your bank account balance
4. All sensitive information (card number, CVV) is securely stored

## 🔒 Security Note
This debit card information includes sensitive data:
- Full card number
- CVV code
- Expiry date

Ensure this data is stored securely in your Supabase database with proper Row Level Security (RLS) policies enabled.

---
**🎉 Your Kotak Bank debit card is ready to be added to your finance tracker!**

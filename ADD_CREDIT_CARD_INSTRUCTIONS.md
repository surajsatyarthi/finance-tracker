# 💳 Add SuperMoney RUPAY Credit Card

## Card Details
- **Name**: SuperMoney
- **Type**: RUPAY
- **Number**: 3561241060899296 (last 4 digits: 9296)
- **Credit Limit**: ₹18,00,000
- **Statement Date**: 1st of every month
- **Payment Due**: 5th of every month
- **Annual Fee**: ₹0 (Free)
- **Cashback**: 1% on UPI transactions
- **Partner Merchants**: UPI, Flipkart, Myntra
- **Renewal**: September

## 📋 Execution Steps

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to the **SQL Editor**

### 2. Execute the Card Addition
- Open the file: **`add_supermoney_card.sql`**
- Copy the entire contents
- Paste into Supabase SQL Editor
- Click **Run** to execute

### 3. Verify Addition
The script includes verification queries that will show:
- Card details confirmation
- All your credit cards (optional query)

### 4. Expected Results
After execution, you should see:
```
name        | bank       | card_type | last_four_digits | credit_limit
SuperMoney  | SuperMoney | RUPAY     | 9296            | 180000
```

## 💡 Card Benefits Stored
The following benefits are stored in the database:
- **UPI Cashback**: 1% cashback on UPI transactions
- **Partner Benefits**: Special offers on Flipkart and Myntra
- **Annual Fee**: ₹0 (completely free)
- **Renewal**: September
- **Wave-off Limit**: Not applicable

## 🔧 Technical Details
- **Credit Limit**: Stored as 180000 (₹1,80,000 in paisa/smallest unit)
- **Statement Cycle**: 1st to 1st of every month
- **Payment Due**: 5th of every month (4 days grace period)
- **Card Status**: Active
- **Cashback Rate**: 1.00% stored as decimal

## ✅ Post-Addition
After successfully adding the card:
1. The card will appear in your credit cards list
2. You can start tracking transactions for this card
3. Cashback calculations will use the 1% rate for UPI transactions
4. Partner merchant benefits are tracked for reporting

---
**🎉 Your SuperMoney RUPAY card is ready to be added to your finance tracker!**
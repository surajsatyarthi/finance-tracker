# Transaction Helper Module

## Purpose
Standardized helper functions for adding transactions to avoid database constraint errors.

## Valid Values

### Payment Methods
- `cash`
- `upi`
- `card`
- `bank_transfer`
- `cheque`

### Transaction Types
- `income`
- `expense`

## Usage Example

```javascript
const { addTransaction, updateCardBalance, addCreditCardTransaction, findOrCreateCategory } = require('./helpers/transaction-helper');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(url, key);
const userId = 'your-user-id';

// 1. Find or create category
const category = await findOrCreateCategory(supabase, userId, 'Groceries', 'expense');

// 2. Add transaction
const transaction = await addTransaction(supabase, {
  userId,
  amount: 500,
  type: 'expense',
  categoryId: category.id,
  description: 'Weekly groceries',
  paymentMethod: 'card',
  date: '2025-12-25'
});

// 3. Update card balance (if using credit card)
const updatedCard = await updateCardBalance(supabase, cardId, 500);

// 4. Add credit card transaction record
await addCreditCardTransaction(supabase, {
  userId,
  cardId,
  amount: 500,
  description: 'Weekly groceries',
  date: '2025-12-25'
});
```

## Notes
- **Do NOT** specify `month` or `year` - they are auto-generated from `date`
- Always use valid payment methods from the enum
- Helper functions handle all validation and throw clear errors

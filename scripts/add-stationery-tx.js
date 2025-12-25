require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
const transactionAmount = 191;
const transactionDate = '2025-12-25';
const description = 'Stationery';

(async () => {
    console.log('\n=== ADDING STATIONERY TRANSACTION ===\n');

    // 1. Find SuperMoney card
    const { data: card, error: cardError } = await supabase
        .from('credit_cards')
        .select('id, name, current_balance')
        .eq('user_id', userId)
        .eq('name', 'SuperMoney')
        .single();

    if (cardError || !card) {
        console.error('❌ SuperMoney card not found:', cardError?.message);
        process.exit(1);
    }

    console.log(`Found card: ${card.name}`);
    console.log(`Current balance: ₹${card.current_balance}`);

    // 2. Find or create Stationery category
    let { data: category } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .ilike('name', '%stationery%')
        .single();

    if (!category) {
        console.log('Creating Stationery category...');
        const { data: newCategory, error: catError } = await supabase
            .from('categories')
            .insert([{
                user_id: userId,
                name: 'Stationery',
                type: 'expense',
                color: '#8B5CF6'
            }])
            .select()
            .single();

        if (catError) {
            console.error('❌ Error creating category:', catError.message);
            process.exit(1);
        }
        category = newCategory;
    }

    console.log(`Using category: ${category.name}`);

    // 3. Add transaction
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert([{
            user_id: userId,
            account_id: null,
            amount: transactionAmount,
            type: 'expense',
            category_id: category.id,
            description: description,
            payment_method: 'card',
            date: transactionDate,
            is_recurring: false
        }])
        .select()
        .single();

    if (txError) {
        console.error('❌ Error adding transaction:', txError.message);
        process.exit(1);
    }

    console.log('✅ Transaction added');

    // 4. Update card balance
    const newBalance = card.current_balance + transactionAmount;
    const { error: updateError } = await supabase
        .from('credit_cards')
        .update({ current_balance: newBalance })
        .eq('id', card.id);

    if (updateError) {
        console.error('❌ Error updating card balance:', updateError.message);
        process.exit(1);
    }

    console.log(`✅ Card balance updated: ₹${card.current_balance} → ₹${newBalance}`);

    // 5. Add credit card transaction record
    const { error: ccTxError } = await supabase
        .from('credit_card_transactions')
        .insert([{
            user_id: userId,
            credit_card_id: card.id,
            amount: transactionAmount,
            type: 'purchase',
            description: description,
            transaction_date: transactionDate
        }]);

    if (ccTxError) {
        console.warn('⚠️  Could not add to credit_card_transactions:', ccTxError.message);
    } else {
        console.log('✅ Credit card transaction record added');
    }

    console.log('\n=== SUMMARY ===\n');
    console.log(`Date: ${transactionDate}`);
    console.log(`Card: ${card.name}`);
    console.log(`Category: ${category.name}`);
    console.log(`Amount: ₹${transactionAmount}`);
    console.log(`Description: ${description}`);
    console.log(`New Balance: ₹${newBalance}`);
    console.log('\n✅ All fields updated successfully!\n');

    process.exit(0);
})();

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== TESTING TRANSACTION FLOW ===\n');

    // Get Kotak account ID
    const { data: kotak } = await supabase
        .from('accounts')
        .select('id, name, balance')
        .eq('user_id', userId)
        .ilike('name', 'Kotak')
        .single();

    if (!kotak) {
        console.log('❌ Kotak account not found');
        process.exit(1);
    }

    console.log(`Found: ${kotak.name}, Current Balance: ₹${kotak.balance}\n`);

    // Test 1: Add dummy UPI expense
    console.log('TEST 1: Adding dummy ₹50 UPI expense...');

    const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
            user_id: userId,
            amount: 50,
            type: 'expense',
            description: 'TEST - Dummy Expense',
            date: new Date().toISOString().split('T')[0],
            payment_method: 'upi',
            account_id: kotak.id,
            subcategory: 'Test Category',
            is_recurring: false
        })
        .select()
        .single();

    if (txError) {
        console.error('❌ Transaction insert failed:', txError.message);
        console.log('\nDETAILS:', txError);
        process.exit(1);
    }

    console.log('✅ Transaction inserted:', txData.id);

    // Test 2: Check if balance was auto-updated
    const { data: current } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', kotak.id)
        .single();

    const expectedBalance = kotak.balance - 50;
    const actualBalance = current.balance;

    console.log(`\nBalance Check:`);
    console.log(`  Before: ₹${kotak.balance}`);
    console.log(`  Expected: ₹${expectedBalance} (after ₹50 deduction)`);
    console.log(`  Actual: ₹${actualBalance}`);

    if (actualBalance === kotak.balance) {
        console.log('\n❌ PROBLEM FOUND: Balance did NOT update automatically!');
        console.log('The transaction was inserted but the account balance stayed the same.');
        console.log('This means createTransaction is NOT calling the balance update logic.');
    } else if (actualBalance === expectedBalance) {
        console.log('\n✅ Balance updated correctly!');
    } else {
        console.log(`\n⚠️  Unexpected balance: ₹${actualBalance}`);
    }

    // Cleanup
    console.log('\nCleaning up test transaction...');
    await supabase.from('transactions').delete().eq('id', txData.id);
    await supabase.from('accounts').update({ balance: kotak.balance }).eq('id', kotak.id);
    console.log('✅ Cleaned up\n');

    process.exit(0);
})();

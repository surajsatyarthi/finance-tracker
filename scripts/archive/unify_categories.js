const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function unifyCategories() {
    const { data: acc } = await supabase.from('accounts').select('user_id').limit(1).single();
    const userId = acc.user_id;
    console.log('User:', userId);

    // Step 1: Delete all existing budgets (will recreate with new categories)
    const { error: budgetErr } = await supabase.from('budgets').delete().eq('user_id', userId);
    console.log('Step 1: Cleared budgets', budgetErr ? `Error: ${budgetErr.message}` : '✓');

    // Step 2: Delete ALL expense categories
    const { error: catDelErr } = await supabase.from('categories').delete().eq('user_id', userId).eq('type', 'expense');
    console.log('Step 2: Cleared expense categories', catDelErr ? `Error: ${catDelErr.message}` : '✓');

    // Step 3: Insert new hierarchical categories
    const categories = [
        'Food > Groceries', 'Food > Eating out', 'Food > Swiggy', 'Food > Zomato', 'Food > Dry fruits', 'Food > Vegetables', 'Food > Fruits', 'Food > Snacks',
        'Transport > Travel', 'Transport > Petrol',
        'Data & WiFi > Jio', 'Data & WiFi > Airtel', 'Data & WiFi > WiFi',
        'Health > Chef', 'Health > Yoga instructor', 'Health > Supplements + Vitamins', 'Health > Medicine', 'Health > Fitness bootcamp',
        'Grooming > Haircut', 'Grooming > Toiletries',
        'Self Growth > Books',
        'Clothing',
        'Shopping > Blinkit',
        'Subscriptions > Youtube', 'Subscriptions > Google One', 'Subscriptions > Grok', 'Subscriptions > LinkedIn Premium',
        'Loan > Education Loan',
        'Insurance > Car Insurance', 'Insurance > Bike Insurance', 'Insurance > Health Insurance', 'Insurance > Term Insurance',
        'Credit Card EMI > SBI BPCL', 'Credit Card EMI > SBI Paytm', 'Credit Card EMI > SBI Simply Save', 'Credit Card EMI > SC EaseMyTrip',
        'Credit Card EMI > Axis My Zone', 'Credit Card EMI > Axis Neo', 'Credit Card EMI > RBL Platinum Delight', 'Credit Card EMI > RBL Bajaj Finserv',
        'Credit Card EMI > HDFC Millenia', 'Credit Card EMI > HDFC Neu', 'Credit Card EMI > Indusind Platinum Aura Edge', 'Credit Card EMI > Indusind Rupay',
        'Credit Card EMI > ICICI Amazon', 'Credit Card EMI > ICICI Adani One', 'Credit Card EMI > Pop YES Bank', 'Credit Card EMI > SuperMoney',
        'Credit Card EMI > BAJAJ Finserv EMI', 'Credit Card EMI > Axis Rewards',
        'Credit Card Monthly > SBI BPCL', 'Credit Card Monthly > SBI Paytm', 'Credit Card Monthly > SBI Simply Save', 'Credit Card Monthly > SC EaseMyTrip',
        'Credit Card Monthly > Axis My Zone', 'Credit Card Monthly > Axis Neo', 'Credit Card Monthly > RBL Platinum Delight', 'Credit Card Monthly > RBL Bajaj Finserv',
        'Credit Card Monthly > HDFC Millenia', 'Credit Card Monthly > HDFC Neu', 'Credit Card Monthly > Indusind Platinum Aura Edge', 'Credit Card Monthly > Indusind Rupay',
        'Credit Card Monthly > ICICI Amazon', 'Credit Card Monthly > ICICI Adani One', 'Credit Card Monthly > Pop YES Bank', 'Credit Card Monthly > SuperMoney',
        'Credit Card Monthly > BAJAJ Finserv EMI', 'Credit Card Monthly > Axis Rewards',
        'Others > Donation', 'Others > Miscellaneous'
    ];

    const rows = categories.map(name => ({ user_id: userId, name, type: 'expense' }));
    const { error: insErr } = await supabase.from('categories').insert(rows);
    console.log('Step 3: Added', categories.length, 'expense categories', insErr ? `Error: ${insErr.message}` : '✓');

    // Verify final state
    const { data: finalCats } = await supabase.from('categories').select('name').eq('user_id', userId).eq('type', 'expense');
    console.log('\n✅ Final expense categories:', finalCats.length);
}

unifyCategories().then(() => process.exit(0));

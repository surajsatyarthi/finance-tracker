// Run with: node scripts/seed_expense_categories.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Approved Category Hierarchy
const categoryHierarchy = {
    'Food': ['Groceries', 'Eating out', 'Swiggy', 'Zomato', 'Dry fruits', 'Vegetables', 'Fruits', 'Snacks'],
    'Transport': ['Travel', 'Petrol'],
    'Data & WiFi': ['Jio', 'Airtel', 'WiFi'],
    'Health': ['Chef', 'Yoga instructor', 'Supplements + Vitamins', 'Medicine', 'Fitness bootcamp'],
    'Grooming': ['Haircut', 'Toiletries'],
    'Self Growth': ['Books'],
    'Clothing': [],
    'Shopping': ['Blinkit'],
    'Subscriptions': ['Youtube', 'Google One', 'Grok', 'LinkedIn Premium'],
    'Loan': ['Education Loan'],
    'Insurance': ['Car Insurance', 'Bike Insurance', 'Health Insurance', 'Term Insurance'],
    'Credit Card EMI': [
        'SBI BPCL', 'SBI Paytm', 'SBI Simply Save', 'SC EaseMyTrip',
        'Axis My Zone', 'Axis Neo', 'RBL Platinum Delight', 'RBL Bajaj Finserv',
        'HDFC Millenia', 'HDFC Neu', 'Indusind Platinum Aura Edge', 'Indusind Rupay',
        'ICICI Amazon', 'ICICI Adani One', 'Pop YES Bank', 'SuperMoney',
        'BAJAJ Finserv EMI', 'Axis Rewards'
    ],
    'Credit Card Monthly': [
        'SBI BPCL', 'SBI Paytm', 'SBI Simply Save', 'SC EaseMyTrip',
        'Axis My Zone', 'Axis Neo', 'RBL Platinum Delight', 'RBL Bajaj Finserv',
        'HDFC Millenia', 'HDFC Neu', 'Indusind Platinum Aura Edge', 'Indusind Rupay',
        'ICICI Amazon', 'ICICI Adani One', 'Pop YES Bank', 'SuperMoney',
        'BAJAJ Finserv EMI', 'Axis Rewards'
    ],
    'Others': ['Donation', 'Miscellaneous']
};

async function seedCategories() {
    // Get user_id
    const { data: account } = await supabase.from('accounts').select('user_id').limit(1).single();
    if (!account?.user_id) {
        console.error('Could not find user_id');
        process.exit(1);
    }
    const userId = account.user_id;
    console.log('User ID:', userId);

    // Delete all existing expense categories
    await supabase.from('categories').delete().eq('user_id', userId).eq('type', 'expense');
    console.log('Deleted existing expense categories');

    let totalAdded = 0;

    // Insert categories with parent-child format: "Parent > Child"
    for (const [parent, children] of Object.entries(categoryHierarchy)) {
        // Insert parent as standalone if no children
        if (children.length === 0) {
            await supabase.from('categories').insert({
                user_id: userId,
                name: parent,
                type: 'expense'
            });
            totalAdded++;
            console.log(`✓ ${parent}`);
        } else {
            // Insert each child with "Parent > Child" format
            for (const child of children) {
                const name = `${parent} > ${child}`;
                await supabase.from('categories').insert({
                    user_id: userId,
                    name: name,
                    type: 'expense'
                });
                totalAdded++;
            }
            console.log(`✓ ${parent} (${children.length} subcategories)`);
        }
    }

    console.log(`\n✅ Added ${totalAdded} expense categories`);

    // Verify
    const { data: cats } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .order('name');

    console.log('\nCategories in DB:', cats?.length);
}

seedCategories().catch(console.error);

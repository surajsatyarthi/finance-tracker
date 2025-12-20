// Run with: node scripts/seed_income_categories.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedIncomeCategories() {
    // Get user_id from existing accounts
    const { data: account } = await supabase
        .from('accounts')
        .select('user_id')
        .limit(1)
        .single();

    if (!account?.user_id) {
        console.error('Could not find user_id');
        process.exit(1);
    }

    const userId = account.user_id;
    console.log('Using user_id:', userId);

    const categories = ['Salary', 'Investment', 'Refund', 'Others'];

    for (const name of categories) {
        const { error } = await supabase
            .from('categories')
            .insert({ user_id: userId, name, type: 'income' });

        if (error && !error.message.includes('duplicate')) {
            console.error(`Error adding ${name}:`, error.message);
        } else {
            console.log(`✓ Added: ${name}`);
        }
    }

    // Verify
    const { data: allCats } = await supabase
        .from('categories')
        .select('name, type')
        .eq('user_id', userId)
        .eq('type', 'income');

    console.log('\nIncome categories:', allCats?.map(c => c.name).join(', '));
}

seedIncomeCategories().catch(console.error);

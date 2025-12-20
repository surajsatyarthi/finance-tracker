// Quick script to add income categories via Supabase API
// Run with: npx ts-node scripts/seed_income_categories.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedIncomeCategories() {
    // Get user ID for surajstoic@gmail.com
    const { data: users, error: userError } = await supabase
        .from('auth.users' as any)
        .select('id')
        .eq('email', 'surajstoic@gmail.com')
        .single();

    // If auth.users query fails, try getting from a known source
    // Using the finance manager's approach - query categories to get user_id or use fixed ID

    const categories = [
        { name: 'Salary', type: 'income' },
        { name: 'Investment', type: 'income' },
        { name: 'Refund', type: 'income' },
        { name: 'Others', type: 'income' }
    ];

    // First, let's get an existing category to find the user_id
    const { data: existingCat } = await supabase
        .from('categories')
        .select('user_id')
        .limit(1)
        .single();

    let userId = existingCat?.user_id;

    if (!userId) {
        // Try getting from accounts
        const { data: account } = await supabase
            .from('accounts')
            .select('user_id')
            .limit(1)
            .single();
        userId = account?.user_id;
    }

    if (!userId) {
        console.error('Could not find user_id');
        process.exit(1);
    }

    console.log('Using user_id:', userId);

    for (const cat of categories) {
        const { error } = await supabase
            .from('categories')
            .insert({
                user_id: userId,
                name: cat.name,
                type: cat.type
            });

        if (error) {
            console.error(`Error adding ${cat.name}:`, error.message);
        } else {
            console.log(`✓ Added: ${cat.name}`);
        }
    }

    // Verify
    const { data: allCats } = await supabase
        .from('categories')
        .select('name, type')
        .eq('user_id', userId)
        .eq('type', 'income');

    console.log('\nIncome categories in database:', allCats);
}

seedIncomeCategories().catch(console.error);

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAll() {
    const { data: acc } = await supabase.from('accounts').select('user_id').limit(1).single();
    const userId = acc.user_id;
    console.log('User:', userId);

    // Step 1: Clear budgets that reference old categories
    const { error: budgetErr } = await supabase.from('budgets').delete().eq('user_id', userId);
    if (budgetErr) console.log('Budget delete error:', budgetErr);
    else console.log('Cleared budgets');

    // Step 2: Delete old format categories
    const { data: cats } = await supabase.from('categories').select('id, name').eq('user_id', userId).eq('type', 'expense').order('name');
    const oldOnes = cats.filter(c => !c.name.includes(' > ') && c.name !== 'Clothing');

    console.log('Deleting', oldOnes.length, 'old categories');

    for (const cat of oldOnes) {
        await supabase.from('categories').delete().eq('id', cat.id);
    }

    // Verify
    const { data: remaining } = await supabase.from('categories').select('name').eq('user_id', userId).eq('type', 'expense');
    console.log('Final expense categories:', remaining.length);
}

fixAll().then(() => process.exit(0));

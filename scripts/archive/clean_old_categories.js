const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanDuplicates() {
    const { data: acc } = await supabase.from('accounts').select('user_id').limit(1).single();
    const userId = acc.user_id;
    console.log('User:', userId);

    // Get all expense categories
    const { data: cats } = await supabase.from('categories').select('id, name').eq('user_id', userId).eq('type', 'expense').order('name');
    console.log('Total before:', cats.length);

    // Find old format (no ' > ' in name and not 'Clothing')
    const oldOnes = cats.filter(c => !c.name.includes(' > ') && c.name !== 'Clothing');
    console.log('Old format to delete:', oldOnes.length);
    console.log('Old names:', oldOnes.map(c => c.name).join(', '));

    // Delete old ones
    let deleted = 0;
    for (const cat of oldOnes) {
        const { error } = await supabase.from('categories').delete().eq('id', cat.id);
        if (!error) deleted++;
    }
    console.log('Deleted:', deleted);

    // Check remaining
    const { data: remaining } = await supabase.from('categories').select('name').eq('user_id', userId).eq('type', 'expense');
    console.log('Remaining:', remaining.length);
}

cleanDuplicates().then(() => process.exit(0));

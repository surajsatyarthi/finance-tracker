// Run with: node scripts/fix_duplicate_categories.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixDuplicates() {
    // Get all income categories
    const { data: cats } = await supabase
        .from('categories')
        .select('id, name, type')
        .eq('type', 'income');

    console.log('Current categories:', cats);

    // Find duplicates
    const seen = new Set();
    const toDelete = [];

    for (const cat of cats || []) {
        if (seen.has(cat.name)) {
            toDelete.push(cat.id);
        } else {
            seen.add(cat.name);
        }
    }

    console.log('Deleting duplicates:', toDelete.length);

    // Delete duplicates
    for (const id of toDelete) {
        await supabase.from('categories').delete().eq('id', id);
    }

    // Verify
    const { data: final } = await supabase
        .from('categories')
        .select('name')
        .eq('type', 'income');

    console.log('Final categories:', final?.map(c => c.name).join(', '));
}

fixDuplicates();

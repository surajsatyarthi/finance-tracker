require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== ALL CREDIT CARDS ===\n');

    const { data: cards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    if (!cards || cards.length === 0) {
        console.log('No credit cards found');
        process.exit(0);
    }

    cards.forEach((card, idx) => {
        console.log(`${idx + 1}. ${card.name}`);
        console.log(`   ID: ${card.id.slice(0, 8)}...`);
        console.log(`   Type: ${card.card_type || 'N/A'}`);
        console.log(`   Limit: ₹${card.credit_limit?.toLocaleString('en-IN') || '0'}`);
        console.log(`   Balance: ₹${card.current_balance?.toLocaleString('en-IN') || '0'}`);
        console.log(`   Active: ${card.is_active ? 'Yes' : 'No'}`);
        console.log(`   Created: ${new Date(card.created_at).toLocaleDateString('en-IN')}`);
        console.log('');
    });

    console.log(`Total: ${cards.length} cards`);

    // Check for duplicates
    const names = cards.map(c => c.name.toLowerCase());
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

    if (duplicates.length > 0) {
        console.log('\n⚠️  DUPLICATES FOUND:');
        duplicates.forEach(name => {
            const dupes = cards.filter(c => c.name.toLowerCase() === name);
            console.log(`\n${name.toUpperCase()}: ${dupes.length} entries`);
            dupes.forEach(d => {
                console.log(`  - ${d.id.slice(0, 8)} | Active: ${d.is_active} | Created: ${new Date(d.created_at).toLocaleDateString('en-IN')}`);
            });
        });
    }

    process.exit(0);
})();

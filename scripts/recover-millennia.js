require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING FOR ANY HDFC MILLENNIA BACKUP DATA ===\n');

    // Check if there are any audit logs or history tables
    const { data: allTables } = await supabase.rpc('get_schemas_and_tables').catch(() => ({ data: null }));

    // Try to find any HDFC Millennia reference in transactions or other tables
    const { data: transactions } = await supabase
        .from('credit_card_transactions')
        .select('credit_card_id, description')
        .eq('user_id', userId)
        .ilike('description', '%millennia%')
        .limit(1);

    if (transactions && transactions.length > 0) {
        console.log('Found transaction references to Millennia card:');
        console.log('Card ID from transaction:', transactions[0].credit_card_id);

        // Try to find that card even if deleted
        const { data: deletedCard } = await supabase
            .from('credit_cards')
            .select('*')
            .eq('id', transactions[0].credit_card_id)
            .single();

        if (deletedCard) {
            console.log('\n✅ CARD STILL EXISTS:');
            console.log('Card Number:', deletedCard.card_number);
            console.log('CVV:', deletedCard.cvv);
        } else {
            console.log('\n❌ Card permanently deleted');
        }
    } else {
        console.log('No transaction history found for Millennia card');
    }

    // Last resort: check all credit cards for the VISA one
    const { data: visaMillennia } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('card_type', 'VISA')
        .ilike('name', '%milleni%'); // Catch both spellings

    if (visaMillennia && visaMillennia.length > 0) {
        console.log('\n✅ FOUND VISA MILLENNIA CARD:');
        console.log('Card Number:', visaMillennia[0].card_number);
        console.log('CVV:', visaMillennia[0].cvv);
        console.log('Active:', visaMillennia[0].is_active);
    }

    process.exit(0);
})();

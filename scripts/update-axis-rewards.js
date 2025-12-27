require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== UPDATING AXIS REWARDS ===\n');
    
    await supabase.from('credit_cards').update({
        last_four_digits: '3605',
        card_cvv: '718',
        expiry_month: 8,
        expiry_year: 2030
    }).eq('user_id', userId).eq('name', 'Axis Rewards');

    console.log('✅ Updated: 5318610002523605, CVV: 718, Expiry: 08/30\n');
    process.exit(0);
})();

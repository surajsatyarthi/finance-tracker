const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLoansStructure() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    const { data: loans } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'personal')
        .limit(1);
    
    if (loans && loans.length > 0) {
        console.log('\nLoan columns:', Object.keys(loans[0]));
        console.log('\nSample loan:', JSON.stringify(loans[0], null, 2));
    }
}

checkLoansStructure();

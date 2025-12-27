const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUserId() {
    // Get user_id from existing loans
    const { data: loans } = await supabase
        .from('loans')
        .select('user_id')
        .limit(1);
    
    if (loans && loans.length > 0) {
        console.log('User ID from loans:', loans[0].user_id);
        return loans[0].user_id;
    }
    
    // Check accounts table
    const { data: accounts } = await supabase
        .from('accounts')
        .select('user_id')
        .limit(1);
    
    if (accounts && accounts.length > 0) {
        console.log('User ID from accounts:', accounts[0].user_id);
        return accounts[0].user_id;
    }
    
    console.log('No user_id found in existing data');
}

getUserId();

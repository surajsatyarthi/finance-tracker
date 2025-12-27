require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== VERIFYING DATABASE DATA ===\n');
    
    // Check Loans
    const { data: loans } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId);
    
    console.log('LOANS:', loans?.length || 0);
    if (loans && loans.length > 0) {
        loans.forEach(l => {
            console.log(`  - ${l.name}: ₹${l.current_balance?.toLocaleString('en-IN')} / ₹${l.principal_amount?.toLocaleString('en-IN')}`);
        });
    } else {
        console.log('  ⚠️  NO LOANS FOUND');
    }
    
    // Check Goals
    const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);
    
    console.log('\nGOALS:', goals?.length || 0);
    if (goals && goals.length > 0) {
        goals.forEach(g => {
            console.log(`  - ${g.name}: ₹${g.target_amount?.toLocaleString('en-IN')}`);
        });
    } else {
        console.log('  ⚠️  NO GOALS FOUND');
    }
    
    // Check Bank Accounts
    const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('name');
    
    console.log('\nBANK ACCOUNTS:', accounts?.length || 0);
    if (accounts && accounts.length > 0) {
        accounts.forEach(a => {
            console.log(`  - ${a.name}: ₹${a.balance?.toLocaleString('en-IN')}`);
        });
    } else {
        console.log('  ⚠️  NO ACCOUNTS FOUND');
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Loans: ${loans?.length || 0}`);
    console.log(`Goals: ${goals?.length || 0}`);
    console.log(`Accounts: ${accounts?.length || 0}`);
    console.log('');
    
    process.exit(0);
})();

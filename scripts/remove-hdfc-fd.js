const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeHDFCFD() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    console.log('\nRemoving HDFC FD...\n');
    
    const { error } = await supabase
        .from('fixed_deposits')
        .delete()
        .eq('user_id', userId)
        .eq('bank_name', 'HDFC');
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('✅ HDFC FD removed\n');
    
    // Show remaining FDs
    const { data: fds } = await supabase
        .from('fixed_deposits')
        .select('*')
        .eq('user_id', userId);
    
    console.log(`Remaining FDs: ${fds?.length || 0}\n`);
    if (fds && fds.length > 0) {
        fds.forEach(fd => {
            console.log(`${fd.bank_name}: ₹${fd.principal_amount.toLocaleString('en-IN')} @ ${fd.interest_rate}%`);
        });
    }
    console.log('');
}

removeHDFCFD();

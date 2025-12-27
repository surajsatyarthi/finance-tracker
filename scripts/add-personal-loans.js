const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addPersonalLoans() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    const loans = [
        {
            user_id: userId,
            name: 'Abhal',
            type: 'personal',
            principal_amount: 100000,
            current_balance: 100000,
            interest_rate: 0,
            emis_paid: 0,
            is_active: true,
            start_date: '2025-12-27'
        },
        {
            user_id: userId,
            name: 'Nikhil Kapoor',
            type: 'personal',
            principal_amount: 60000,
            current_balance: 60000,
            interest_rate: 0,
            emis_paid: 0,
            is_active: true,
            start_date: '2025-12-27'
        }
    ];
    
    console.log('\nAdding 2 personal loans...\n');
    
    const { data, error } = await supabase
        .from('loans')
        .insert(loans)
        .select();
    
    if (error) {
        console.error('Error adding loans:', error);
        return;
    }
    
    console.log('✅ Successfully added:\n');
    data.forEach(loan => {
        console.log(`   ${loan.name}: ₹${loan.principal_amount.toLocaleString('en-IN')}`);
    });
    
    // Show all personal loans
    const { data: allPersonalLoans } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'personal')
        .order('name');
    
    console.log(`\nAll personal loans (${allPersonalLoans.length}):\n`);
    let total = 0;
    allPersonalLoans.forEach(loan => {
        total += parseFloat(loan.current_balance || 0);
        console.log(`   ${loan.name.padEnd(20)} ₹${parseFloat(loan.current_balance || 0).toLocaleString('en-IN')}`);
    });
    console.log(`   ${'Total'.padEnd(20)} ₹${total.toLocaleString('en-IN')}\n`);
}

addPersonalLoans();

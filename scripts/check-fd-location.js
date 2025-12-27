const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFDLocation() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    console.log('\n════════════════════════════════════════');
    console.log('  WHERE IS FD DATA STORED?');
    console.log('════════════════════════════════════════\n');
    
    // Check fixed_deposits table
    const { data: fdsTable } = await supabase
        .from('fixed_deposits')
        .select('*')
        .eq('user_id', userId);
    
    console.log(`📊 fixed_deposits table: ${fdsTable?.length || 0} FDs`);
    if (fdsTable && fdsTable.length > 0) {
        fdsTable.forEach(fd => {
            console.log(`   - ${fd.bank_name}: ₹${fd.principal_amount?.toLocaleString('en-IN')}`);
        });
    }
    console.log('');
    
    // Check goals table with category = 'Fixed Deposit'
    const { data: goalsTable } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('category', 'Fixed Deposit');
    
    console.log(`🎯 goals table (category='Fixed Deposit'): ${goalsTable?.length || 0} FDs`);
    if (goalsTable && goalsTable.length > 0) {
        goalsTable.forEach(fd => {
            console.log(`   - ${fd.name}: ₹${fd.current_amount?.toLocaleString('en-IN')}`);
        });
    }
    console.log('');
    
    console.log('════════════════════════════════════════');
    console.log('WHERE DOES THE APP LOOK?');
    console.log('════════════════════════════════════════\n');
    console.log('The app\'s getFDs() function looks in:');
    console.log('  📍 fixed_deposits table ✅\n');
    
    if (fdsTable && fdsTable.length > 0) {
        console.log('✅ FD data is in the correct location (fixed_deposits table)');
        console.log('   The app will see your FDs.\n');
    } else {
        console.log('📭 No FDs found in the database.\n');
    }
}

checkFDLocation();

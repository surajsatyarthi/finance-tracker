const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFDData() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    console.log('\n════════════════════════════════════════');
    console.log('  FIXED DEPOSITS DATA CHECK');
    console.log('════════════════════════════════════════\n');
    
    const { data: fds, error } = await supabase
        .from('fixed_deposits')
        .select('*')
        .eq('user_id', userId);
    
    if (error) {
        console.log('❌ Error:', error.message);
        if (error.code === 'PGRST204') {
            console.log('\n⚠️  The fixed_deposits table does not exist in Supabase.');
            console.log('   This table was likely removed when we disabled the FD feature.\n');
        }
        return;
    }
    
    if (!fds || fds.length === 0) {
        console.log('📊 No fixed deposits found in database.\n');
        return;
    }
    
    console.log(`📊 FIXED DEPOSITS: ${fds.length}\n`);
    
    const totalInvestment = fds.reduce((sum, fd) => sum + parseFloat(fd.principal_amount || 0), 0);
    const totalMaturity = fds.reduce((sum, fd) => sum + parseFloat(fd.maturity_amount || 0), 0);
    
    console.log(`Total Investment: ₹${totalInvestment.toLocaleString('en-IN')}`);
    console.log(`Total Maturity Value: ₹${totalMaturity.toLocaleString('en-IN')}`);
    console.log(`Total Interest: ₹${(totalMaturity - totalInvestment).toLocaleString('en-IN')}\n`);
    
    fds.forEach((fd, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${fd.bank_name || 'Unknown Bank'}`);
        console.log(`    Principal: ₹${parseFloat(fd.principal_amount || 0).toLocaleString('en-IN')}`);
        console.log(`    Rate: ${fd.interest_rate}%`);
        console.log(`    Tenure: ${fd.tenure_months} months`);
        console.log(`    Start: ${fd.start_date}`);
        console.log(`    Maturity: ${fd.maturity_date}`);
        console.log(`    Maturity Amount: ₹${parseFloat(fd.maturity_amount || 0).toLocaleString('en-IN')}`);
        console.log('');
    });
}

checkFDData();

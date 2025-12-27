require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    const { data: loans } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('name');
    
    console.log('\n=== ALL LOANS ===\n');
    console.log('Name|Type|Principal|Current Balance|Interest Rate|EMI Amount|Total EMIs|EMIs Paid|Start Date|Next EMI Date');
    console.log('----|----|---------:|--------------:|------------:|---------:|---------:|--------:|----------|-------------');
    
    if (loans) {
        loans.forEach(loan => {
            const name = loan.name || 'N/A';
            const type = loan.type || 'N/A';
            const principal = loan.principal_amount ? '₹' + loan.principal_amount.toLocaleString('en-IN') : 'N/A';
            const balance = loan.current_balance ? '₹' + loan.current_balance.toLocaleString('en-IN') : 'N/A';
            const rate = loan.interest_rate ? loan.interest_rate + '%' : 'N/A';
            const emi = loan.emi_amount ? '₹' + loan.emi_amount.toLocaleString('en-IN') : 'N/A';
            const totalEmis = loan.total_emis || 'N/A';
            const emisPaid = loan.emis_paid || 0;
            const startDate = loan.start_date || 'N/A';
            const nextEmi = loan.next_emi_date || 'N/A';
            
            console.log(`${name}|${type}|${principal}|${balance}|${rate}|${emi}|${totalEmis}|${emisPaid}|${startDate}|${nextEmi}`);
        });
        
        console.log('\n');
        const totalPrincipal = loans.reduce((sum, l) => sum + (l.principal_amount || 0), 0);
        const totalBalance = loans.reduce((sum, l) => sum + (l.current_balance || 0), 0);
        console.log(`Total: ${loans.length} loans`);
        console.log(`Total Principal: ₹${totalPrincipal.toLocaleString('en-IN')}`);
        console.log(`Total Outstanding: ₹${totalBalance.toLocaleString('en-IN')}`);
    }
    
    process.exit(0);
})();

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== EDUCATION LOAN DETAILS ===\n');

    const { data: loans } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .ilike('name', '%education%');

    if (!loans || loans.length === 0) {
        console.log('No education loan found');
        process.exit(0);
    }

    const loan = loans[0];

    console.log(`Loan Name: ${loan.name}`);
    console.log(`Monthly EMI: ₹${loan.emi_amount?.toLocaleString('en-IN') || 'N/A'}`);
    console.log(`Total EMIs: ${loan.total_emis || 'N/A'}`);
    console.log(`EMIs Remaining: ${loan.remaining_emis || 'N/A'}`);
    console.log(`Interest Rate: ${loan.interest_rate}%`);
    console.log(`Principal Amount: ₹${loan.principal_amount?.toLocaleString('en-IN')}`);
    console.log(`Outstanding: ₹${loan.outstanding_amount?.toLocaleString('en-IN')}`);
    console.log(`Start Date: ${loan.start_date}`);
    console.log(`Next EMI Date: ${loan.next_emi_date || 'N/A'}`);

    if (loan.next_emi_date && loan.remaining_emis) {
        const endDate = new Date(loan.next_emi_date);
        endDate.setMonth(endDate.getMonth() + loan.remaining_emis - 1);
        console.log(`Loan End Date: ${endDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`);

        const monthsLeft = loan.remaining_emis;
        const yearsLeft = Math.floor(monthsLeft / 12);
        const remainingMonths = monthsLeft % 12;

        console.log(`\nTime Remaining: ${yearsLeft} years ${remainingMonths} months`);
    }

    console.log('');
    process.exit(0);
})();

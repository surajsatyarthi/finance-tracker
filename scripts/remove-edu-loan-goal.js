const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeEduLoanGoal() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    console.log('\nRemoving Education Loan goal...');
    
    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('user_id', userId)
        .eq('name', 'Education Loan');
    
    if (error) {
        console.error('Error removing goal:', error);
        return;
    }
    
    console.log('✅ Education Loan goal removed\n');
    
    // Show remaining goals
    const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('name');
    
    const total = goals.reduce((sum, g) => sum + parseFloat(g.target_amount || 0), 0);
    console.log(`${goals.length} goals remaining (Total: ₹${total.toLocaleString('en-IN')})\n`);
}

removeEduLoanGoal();

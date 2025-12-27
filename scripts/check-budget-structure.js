const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBudgetStructure() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .limit(1);
    
    if (budgets && budgets.length > 0) {
        console.log('\nBudget table columns:', Object.keys(budgets[0]));
        console.log('\nSample budget:', JSON.stringify(budgets[0], null, 2));
    } else {
        console.log('\nNo budgets found in table');
    }
}

checkBudgetStructure();

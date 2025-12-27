const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function showBudget() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('                    MONTHLY BUDGET');
    console.log('════════════════════════════════════════════════════════════\n');
    
    const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('year', 2025)
        .eq('month', 12)
        .order('category_name');
    
    if (error) {
        console.log('❌ Error:', error.message);
        if (error.code === 'PGRST204') {
            console.log('\n⚠️  The budgets table does not exist in Supabase.');
            console.log('   Budget data may be stored differently or not set up yet.\n');
        }
        return;
    }
    
    if (!budgets || budgets.length === 0) {
        console.log('📊 No budget data found in database.\n');
        return;
    }
    
    console.log(`Total Categories: ${budgets.length}\n`);
    
    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.monthly_limit || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0);
    const totalRemaining = budgets.reduce((sum, b) => sum + parseFloat(b.remaining_amount || 0), 0);
    
    console.log('Category                                    Limit           Spent      Remaining');
    console.log('─'.repeat(95));
    
    budgets.forEach((budget, i) => {
        const limit = parseFloat(budget.monthly_limit || 0);
        const spent = parseFloat(budget.spent_amount || 0);
        const remaining = parseFloat(budget.remaining_amount || 0);
        const percentage = limit > 0 ? ((spent / limit) * 100).toFixed(0) : 0;
        
        console.log(
            `${(i + 1).toString().padStart(2)}. ${budget.category_name.padEnd(40)} ` +
            `₹${limit.toLocaleString('en-IN').padStart(10)} ` +
            `₹${spent.toLocaleString('en-IN').padStart(10)} ` +
            `₹${remaining.toLocaleString('en-IN').padStart(10)} (${percentage}%)`
        );
    });
    
    console.log('─'.repeat(95));
    console.log(
        `${'TOTAL'.padEnd(43)} ` +
        `₹${totalBudget.toLocaleString('en-IN').padStart(10)} ` +
        `₹${totalSpent.toLocaleString('en-IN').padStart(10)} ` +
        `₹${totalRemaining.toLocaleString('en-IN').padStart(10)}\n`
    );
}

showBudget();

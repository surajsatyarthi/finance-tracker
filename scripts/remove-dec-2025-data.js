require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== REMOVING DEC 2025 DATA ===\n');

    // Delete transactions from Dec 2025
    const { data: deletedTransactions, error: txError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', userId)
        .gte('date', '2025-12-01')
        .lt('date', '2026-01-01')
        .select();

    if (txError) {
        console.error('Error deleting transactions:', txError);
    } else {
        console.log(`✅ Deleted ${deletedTransactions?.length || 0} transactions from Dec 2025`);
    }

    // Delete budgets for Dec 2025
    const { data: deletedBudgets, error: budgetError } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', userId)
        .eq('month', 12)
        .eq('year', 2025)
        .select();

    if (budgetError) {
        console.error('Error deleting budgets:', budgetError);
    } else {
        console.log(`✅ Deleted ${deletedBudgets?.length || 0} budget entries from Dec 2025`);
    }

    console.log('\n✅ Dec 2025 data removed. App now starts from Jan 2026.\n');
    process.exit(0);
})();

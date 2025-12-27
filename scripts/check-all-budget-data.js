const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllBudgetData() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('           COMPLETE BUDGET DATA CHECK');
    console.log('════════════════════════════════════════════════════════════\n');
    
    // Get all budget data
    const { data: allBudgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: true })
        .order('month', { ascending: true });
    
    console.log(`Total budget records: ${allBudgets?.length || 0}\n`);
    
    // Group by year and month
    const byYearMonth = {};
    allBudgets?.forEach(b => {
        const key = `${b.year}-${b.month.toString().padStart(2, '0')}`;
        if (!byYearMonth[key]) byYearMonth[key] = [];
        byYearMonth[key].push(b);
    });
    
    console.log('Budget data by month:\n');
    Object.keys(byYearMonth).sort().forEach(key => {
        const [year, month] = key.split('-');
        const monthName = new Date(year, parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const count = byYearMonth[key].length;
        const total = byYearMonth[key].reduce((sum, b) => sum + parseFloat(b.monthly_limit || 0), 0);
        console.log(`${monthName.padEnd(25)} ${count.toString().padStart(2)} categories   Total: ₹${total.toLocaleString('en-IN')}`);
    });
    
    console.log('\n════════════════════════════════════════════════════════════\n');
    
    // Show sample from first month
    if (Object.keys(byYearMonth).length > 0) {
        const firstMonth = Object.keys(byYearMonth).sort()[0];
        console.log(`Sample categories from ${firstMonth}:\n`);
        byYearMonth[firstMonth].slice(0, 5).forEach((b, i) => {
            console.log(`${i + 1}. ${b.category_name.padEnd(40)} ₹${parseFloat(b.monthly_limit).toLocaleString('en-IN')}`);
        });
        console.log('...\n');
    }
}

checkAllBudgetData();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function show12MonthBudget() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    console.log('\n════════════════════════════════════════════════════════════════════════════════');
    console.log('                         12-MONTH BUDGET PROJECTION');
    console.log('                         (December 2025 - December 2026)');
    console.log('════════════════════════════════════════════════════════════════════════════════\n');
    
    const { data: allBudgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: true })
        .order('month', { ascending: true })
        .order('category_name');
    
    // Group by year-month
    const byMonth = {};
    allBudgets?.forEach(b => {
        const key = `${b.year}-${b.month.toString().padStart(2, '0')}`;
        if (!byMonth[key]) byMonth[key] = { budgets: [], total: 0 };
        byMonth[key].budgets.push(b);
        byMonth[key].total += parseFloat(b.monthly_limit || 0);
    });
    
    // Monthly totals table
    console.log('MONTHLY BUDGET TOTALS:\n');
    console.log('Month              Categories    Total Budget');
    console.log('─'.repeat(60));
    
    let grandTotal = 0;
    Object.keys(byMonth).sort().forEach(key => {
        const [year, month] = key.split('-');
        const monthName = new Date(year, parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const data = byMonth[key];
        grandTotal += data.total;
        console.log(
            `${monthName.padEnd(20)} ` +
            `${data.budgets.length.toString().padStart(2)} categories ` +
            `₹${data.total.toLocaleString('en-IN').padStart(12)}`
        );
    });
    
    console.log('─'.repeat(60));
    console.log(`${'YEARLY TOTAL'.padEnd(34)} ₹${grandTotal.toLocaleString('en-IN').padStart(12)}\n`);
    
    const avgMonthly = grandTotal / Object.keys(byMonth).length;
    console.log(`Average Monthly Budget: ₹${avgMonthly.toLocaleString('en-IN')}\n`);
    
    // Get unique categories across all months
    const allCategories = new Set();
    allBudgets?.forEach(b => allCategories.add(b.category_name));
    
    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log(`CATEGORY BREAKDOWN (${allCategories.size} unique categories):\n`);
    
    // Show top categories by total annual budget
    const categoryTotals = {};
    allBudgets?.forEach(b => {
        if (!categoryTotals[b.category_name]) categoryTotals[b.category_name] = 0;
        categoryTotals[b.category_name] += parseFloat(b.monthly_limit || 0);
    });
    
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    console.log('Top 15 Categories by Annual Budget:\n');
    sortedCategories.forEach(([cat, total], i) => {
        const avgMonthly = total / 13; // 13 months of data
        console.log(
            `${(i + 1).toString().padStart(2)}. ${cat.padEnd(45)} ` +
            `₹${total.toLocaleString('en-IN').padStart(10)} ` +
            `(~₹${avgMonthly.toLocaleString('en-IN').padStart(8)}/mo)`
        );
    });
    
    console.log('\n');
}

show12MonthBudget();

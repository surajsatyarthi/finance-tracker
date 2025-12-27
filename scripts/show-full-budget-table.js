const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function showFullBudgetTable() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    console.log('\n════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                                                    COMPLETE 12-MONTH BUDGET PROJECTION');
    console.log('════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════\n');
    
    const { data: allBudgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('category_name');
    
    // Create matrix: categories x months
    const months = ['Dec-25', 'Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26', 'Nov-26', 'Dec-26'];
    const monthKeys = ['2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];
    
    // Group by category
    const categoryData = {};
    allBudgets?.forEach(b => {
        if (!categoryData[b.category_name]) {
            categoryData[b.category_name] = {};
        }
        const monthKey = `${b.year}-${b.month.toString().padStart(2, '0')}`;
        categoryData[b.category_name][monthKey] = parseFloat(b.monthly_limit || 0);
    });
    
    // Sort categories
    const sortedCategories = Object.keys(categoryData).sort();
    
    // Print header
    console.log('Category'.padEnd(45) + months.map(m => m.padStart(9)).join('') + '   Total'.padStart(12));
    console.log('─'.repeat(45 + 9 * 13 + 12));
    
    // Print each category
    const monthTotals = new Array(13).fill(0);
    let grandTotal = 0;
    
    sortedCategories.forEach(category => {
        const row = [category.padEnd(45)];
        let categoryTotal = 0;
        
        monthKeys.forEach((monthKey, idx) => {
            const amount = categoryData[category][monthKey] || 0;
            monthTotals[idx] += amount;
            categoryTotal += amount;
            
            if (amount === 0) {
                row.push('       -'.padStart(9));
            } else {
                row.push(amount.toLocaleString('en-IN').padStart(9));
            }
        });
        
        grandTotal += categoryTotal;
        row.push(categoryTotal.toLocaleString('en-IN').padStart(12));
        console.log(row.join(''));
    });
    
    // Print totals
    console.log('─'.repeat(45 + 9 * 13 + 12));
    const totalRow = ['MONTHLY TOTAL'.padEnd(45)];
    monthTotals.forEach(total => {
        totalRow.push(total.toLocaleString('en-IN').padStart(9));
    });
    totalRow.push(grandTotal.toLocaleString('en-IN').padStart(12));
    console.log(totalRow.join(''));
    
    console.log('\n════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════\n');
    
    console.log(`Total Categories: ${sortedCategories.length}`);
    console.log(`Annual Budget: ₹${grandTotal.toLocaleString('en-IN')}`);
    console.log(`Average Monthly: ₹${(grandTotal / 13).toLocaleString('en-IN')}\n`);
}

showFullBudgetTable();

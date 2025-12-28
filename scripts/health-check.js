const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

async function healthCheck() {
    console.log('\n🏥 FINANCE TRACKER HEALTH CHECK\n');
    console.log('═'.repeat(60));
    
    // 1. Budget Data Check
    console.log('\n📊 BUDGET DATA:');
    const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);
    
    if (budgets && budgets.length > 0) {
        const byYear = {};
        budgets.forEach(b => {
            if (!byYear[b.year]) byYear[b.year] = { count: 0, total: 0, categories: new Set() };
            byYear[b.year].count++;
            byYear[b.year].total += parseFloat(b.monthly_limit || 0);
            byYear[b.year].categories.add(b.category_name);
        });
        
        Object.entries(byYear).forEach(([year, data]) => {
            console.log(`  ${year}: ${data.count} records, ${data.categories.size} categories, ₹${data.total.toLocaleString('en-IN')} total`);
        });
    } else {
        console.log('  ⚠️  No budget data found');
    }
    
    // 2. Transaction Data Check
    console.log('\n💰 TRANSACTIONS:');
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);
    
    if (transactions && transactions.length > 0) {
        const income = transactions.filter(t => t.type === 'income');
        const expense = transactions.filter(t => t.type === 'expense');
        
        const incomeTotal = income.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const expenseTotal = expense.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
        console.log(`  Income: ${income.length} transactions, ₹${incomeTotal.toLocaleString('en-IN')}`);
        console.log(`  Expense: ${expense.length} transactions, ₹${expenseTotal.toLocaleString('en-IN')}`);
        console.log(`  Net: ₹${(incomeTotal - expenseTotal).toLocaleString('en-IN')}`);
        
        // Check date range
        const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
        if (dates.length > 0) {
            const oldest = dates[0].toLocaleDateString('en-IN');
            const newest = dates[dates.length - 1].toLocaleDateString('en-IN');
            console.log(`  Date range: ${oldest} to ${newest}`);
        }
    } else {
        console.log('  ⚠️  No transactions found');
    }
    
    // 3. Categories Check
    console.log('\n📁 CATEGORIES:');
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);
    
    if (categories && categories.length > 0) {
        const byType = {};
        categories.forEach(c => {
            if (!byType[c.type]) byType[c.type] = [];
            byType[c.type].push(c.name);
        });
        
        Object.entries(byType).forEach(([type, cats]) => {
            console.log(`  ${type}: ${cats.length} categories`);
        });
    } else {
        console.log('  ⚠️  No categories found');
    }
    
    // 4. Accounts Check
    console.log('\n🏦 ACCOUNTS:');
    const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
    
    if (accounts && accounts.length > 0) {
        const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
        console.log(`  ${accounts.length} accounts, Total balance: ₹${totalBalance.toLocaleString('en-IN')}`);
    } else {
        console.log('  ⚠️  No accounts found');
    }
    
    // 5. Credit Cards Check
    console.log('\n💳 CREDIT CARDS:');
    const { data: cards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId);
    
    if (cards && cards.length > 0) {
        const totalLimit = cards.reduce((sum, c) => sum + parseFloat(c.credit_limit || 0), 0);
        const totalUsed = cards.reduce((sum, c) => sum + parseFloat(c.current_balance || 0), 0);
        console.log(`  ${cards.length} cards`);
        console.log(`  Total limit: ₹${totalLimit.toLocaleString('en-IN')}`);
        console.log(`  Total used: ₹${totalUsed.toLocaleString('en-IN')}`);
        console.log(`  Utilization: ${((totalUsed / totalLimit) * 100).toFixed(1)}%`);
    } else {
        console.log('  ⚠️  No credit cards found');
    }
    
    // 6. Loans Check
    console.log('\n📝 LOANS:');
    const { data: loans } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId);
    
    if (loans && loans.length > 0) {
        const totalPrincipal = loans.reduce((sum, l) => sum + parseFloat(l.principal_amount || 0), 0);
        const totalRemaining = loans.reduce((sum, l) => sum + parseFloat(l.remaining_amount || 0), 0);
        console.log(`  ${loans.length} loans`);
        console.log(`  Total principal: ₹${totalPrincipal.toLocaleString('en-IN')}`);
        console.log(`  Total remaining: ₹${totalRemaining.toLocaleString('en-IN')}`);
    } else {
        console.log('  ⚠️  No loans found');
    }
    
    // 7. Data Consistency Check
    console.log('\n🔍 CONSISTENCY CHECKS:');
    
    // Check for transactions without categories
    const uncategorized = transactions?.filter(t => !t.category_id) || [];
    if (uncategorized.length > 0) {
        console.log(`  ⚠️  ${uncategorized.length} transactions without category`);
    } else {
        console.log(`  ✅ All transactions have categories`);
    }
    
    // Check for budget categories not in categories table
    if (budgets && categories) {
        const budgetCategories = new Set(budgets.map(b => b.category_name));
        const categoryNames = new Set(categories.map(c => c.name));
        const missing = [...budgetCategories].filter(bc => !categoryNames.has(bc));
        if (missing.length > 0) {
            console.log(`  ⚠️  ${missing.length} budget categories not in categories table`);
            missing.slice(0, 3).forEach(m => console.log(`      - ${m}`));
        } else {
            console.log(`  ✅ All budget categories exist in categories table`);
        }
    }
    
    console.log('\n═'.repeat(60));
    console.log('✅ Health check complete!\n');
}

healthCheck().catch(console.error);

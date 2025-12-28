const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// Budget data for 2026 (Jan-Dec) - Based on 2025 data
// FORMAT: { category: 'Category Name', limits: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec] }
const budgetData2026 = [
    // Loan
    { category: 'Loan - Education loan', limits: [29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361] },
    
    // Transport
    { category: 'Transport - Travel', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Transport - Petrol', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    { category: 'Transport - Bike Insurance', limits: [0, 0, 3000, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Transport - Bike Pollution Certificate', limits: [80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Transport - Car Insurance', limits: [4000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Transport - Car Pollution Certificate', limits: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    
    // Data
    { category: 'Data - Jio', limits: [3599, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Data - Airtel', limits: [1999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Data - WiFi', limits: [3537, 0, 0, 3537, 0, 0, 3537, 0, 0, 3537, 0, 0] },
    
    // Self Growth
    { category: 'Self Growth - Books', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    
    // Food
    { category: 'Food - Eating out', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Food - Swiggy', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Food - Groceries', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Food - Dry fruits', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Food - Vegetables', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Food - Fruits', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Food - Snacks', limits: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400] },
    
    // Grooming
    { category: 'Grooming - Haircut', limits: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400] },
    { category: 'Grooming - Toiletries', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    
    // Health
    { category: 'Health - Fitness bootcamp', limits: [0, 0, 0, 10000, 10000, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Health - Chef', limits: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000] },
    { category: 'Health - Yoga instructor', limits: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000] },
    { category: 'Health - Supplements + Vitamins', limits: [4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000] },
    { category: 'Health - Medicine', limits: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
    
    // Clothing
    { category: 'Clothing', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    
    // Insurance
    { category: 'Insurance - Medical Insurance', limits: [20000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Insurance - Life Insurance', limits: [20000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    
    // Subscriptions
    { category: 'Subscriptions - Donation', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Subscriptions - Youtube', limits: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300] },
    { category: 'Subscriptions - Google one', limits: [0, 1300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Subscriptions - Grok', limits: [700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700] },
    { category: 'Subscriptions - LinkedIn Premium', limits: [2000, 0, 0, 2000, 0, 0, 2000, 0, 0, 2000, 0, 0] },
    
    // Credit Card Monthly Payments
    { category: 'Credit Card Monthly - SBI BPCL MP', limits: [0, 1300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - SBI Paytm MP', limits: [0, 2000, 0, 0, 2000, 0, 0, 2000, 0, 0, 2000, 0] },
    { category: 'Credit Card Monthly - SBI Simply save MP', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - SC EaseMyTrip MP', limits: [499, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - Axis Rewards MP', limits: [500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - Axis My Zone MP', limits: [499, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - Axis Neo MP', limits: [350, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - RBL Platinum Delight MP', limits: [1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - RBL Bajaj Finserv MP', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - HDFC Millenia MP', limits: [250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - HDFC Neu MP', limits: [1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - Indusind Platinum Aura Edge MP', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - Indusind Rupay (SC) MP', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - ICICI Amazon MP', limits: [499, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - ICICI Coral Rupay MP', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - ICICI Adani One MP', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card Monthly - Pop YES Bank MP', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    
    // Credit Card EMI
    { category: 'Credit Card EMI - SBI BPCL EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - SBI Paytm EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - SBI Simply save EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - SC EaseMyTrip EMI', limits: [2530, 2530, 2530, 2530, 2530, 2530, 2530, 2530, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - Axis Rewards EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - Axis My Zone EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - Axis Neo EMI', limits: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300] },
    { category: 'Credit Card EMI - RBL Platinum Delight EMI', limits: [1371, 1371, 1371, 1371, 1371, 1371, 1371, 1371, 1371, 1371, 0, 0] },
    { category: 'Credit Card EMI - RBL Bajaj Finserv EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - HDFC Millenia EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - HDFC Neu EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - Indusind Platinum Aura Edge EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - Indusind Rupay EMI', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - ICICI Amazon EMI', limits: [5779, 5779, 5779, 5779, 5779, 5779, 2390, 2390, 2390, 2390, 2390, 1859] },
    { category: 'Credit Card EMI - ICICI Coral Rupay EMI', limits: [757, 757, 757, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Credit Card EMI - ICICI Adani One EMI', limits: [531, 531, 531, 531, 531, 531, 531, 531, 531, 531, 0, 0] },
    { category: 'Credit Card EMI - Pop YES Bank EMI', limits: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400] },
    
    // Pay Later
    { category: 'Pay Later - Simpl', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Pay Later - Lazypay', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Pay Later - Amazon Pay', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    
    // Misc
    { category: 'Misc - Amazon Pay Recharge', limits: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
    { category: 'Misc - Supplement', limits: [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000] },
    { category: 'Misc - Shopping', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    { category: 'Misc - Miscellaneous', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
];

async function importBudget() {
    console.log('\n🔄 Importing 2026 Budget Data...\n');
    
    // Step 1: Delete existing 2026 budget data
    console.log('Step 1: Clearing existing 2026 budget data...');
    const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', userId)
        .eq('year', 2026);
    
    if (deleteError) {
        console.error('❌ Error deleting old data:', deleteError);
        return;
    }
    console.log('✅ Old data cleared\n');

    // Step 2: Get or create categories
    console.log('Step 2: Verifying categories...');
    const { data: existingCategories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', userId)
        .eq('type', 'expense');
    
    const categoryMap = new Map();
    existingCategories?.forEach(cat => categoryMap.set(cat.name, cat.id));
    
    // Create missing categories
    for (const item of budgetData2026) {
        if (!categoryMap.has(item.category)) {
            console.log(`  Creating category: ${item.category}`);
            const { data: newCat, error } = await supabase
                .from('categories')
                .insert({
                    user_id: userId,
                    name: item.category,
                    type: 'expense'
                })
                .select('id')
                .single();
            
            if (error) {
                console.error(`  ❌ Error creating ${item.category}:`, error);
            } else {
                categoryMap.set(item.category, newCat.id);
            }
        }
    }
    console.log('✅ Categories verified\n');

    // Step 3: Insert budget records
    console.log('Step 3: Inserting budget records...');
    const budgetRecords = [];
    
    for (const item of budgetData2026) {
        const categoryId = categoryMap.get(item.category);
        if (!categoryId) {
            console.warn(`  ⚠️  Skipping ${item.category} - category not found`);
            continue;
        }
        
        // Create 12 records (one for each month)
        for (let month = 1; month <= 12; month++) {
            budgetRecords.push({
                user_id: userId,
                category_id: categoryId,
                category_name: item.category,
                monthly_limit: item.limits[month - 1],
                year: 2026,
                month: month,
                spent_amount: 0
            });
        }
    }
    
    console.log(`  Inserting ${budgetRecords.length} budget records...`);
    const { error: insertError } = await supabase
        .from('budgets')
        .insert(budgetRecords);
    
    if (insertError) {
        console.error('❌ Error inserting budget data:', insertError);
        return;
    }
    
    console.log('✅ Budget data inserted\n');

    // Step 4: Verify insertion
    console.log('Step 4: Verification...');
    const { data: verification } = await supabase
        .from('budgets')
        .select('category_name, monthly_limit, month')
        .eq('user_id', userId)
        .eq('year', 2026)
        .order('category_name')
        .order('month');
    
    const categoryCounts = {};
    let totalBudget = 0;
    
    verification?.forEach(record => {
        categoryCounts[record.category_name] = (categoryCounts[record.category_name] || 0) + 1;
        totalBudget += parseFloat(record.monthly_limit);
    });
    
    console.log(`  Total records: ${verification?.length}`);
    console.log(`  Unique categories: ${Object.keys(categoryCounts).length}`);
    console.log(`  Annual budget: ₹${totalBudget.toLocaleString('en-IN')}`);
    console.log(`  Monthly average: ₹${Math.round(totalBudget / 12).toLocaleString('en-IN')}`);
    
    // Show categories with incomplete data (should have 12 months each)
    const incomplete = Object.entries(categoryCounts).filter(([_, count]) => count !== 12);
    if (incomplete.length > 0) {
        console.log('\n⚠️  Categories with incomplete data:');
        incomplete.forEach(([cat, count]) => {
            console.log(`  - ${cat}: ${count} months`);
        });
    } else {
        console.log('\n✅ All categories have complete 12-month data');
    }
    
    console.log('\n🎉 Budget import complete!\n');
}

importBudget().catch(console.error);

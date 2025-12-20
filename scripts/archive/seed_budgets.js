// Run with: node scripts/seed_budgets.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map old category names to new "Parent > Child" format
const categoryMapping = {
    'Education loan': 'Loan > Education Loan',
    'Travel': 'Transport > Travel',
    'Petrol': 'Transport > Petrol',
    'Bike Insurance': 'Insurance > Bike Insurance',
    'Car Insurance': 'Insurance > Car Insurance',
    'Jio': 'Data & WiFi > Jio',
    'Airtel': 'Data & WiFi > Airtel',
    'WiFi': 'Data & WiFi > WiFi',
    'Books': 'Self Growth > Books',
    'Eating out': 'Food > Eating out',
    'Swiggy': 'Food > Swiggy',
    'Groceries': 'Food > Groceries',
    'Dry fruits': 'Food > Dry fruits',
    'Vegetables': 'Food > Vegetables',
    'Fruits': 'Food > Fruits',
    'Snacks': 'Food > Snacks',
    'Haircut': 'Grooming > Haircut',
    'Tolietries': 'Grooming > Toiletries',
    'Fitness bootcamp': 'Health > Fitness bootcamp',
    'Chef': 'Health > Chef',
    'Yoga instructor': 'Health > Yoga instructor',
    'Supliments + Vitamins': 'Health > Supplements + Vitamins',
    'Medicine': 'Health > Medicine',
    'Clothing': 'Clothing',
    'Donation': 'Others > Donation',
    'Youtube': 'Subscriptions > Youtube',
    'Google one': 'Subscriptions > Google One',
    'Grok': 'Subscriptions > Grok',
    'LinkedIn Premium': 'Subscriptions > LinkedIn Premium',
    'Shopping': 'Shopping > Blinkit',
    'Miscellaneous': 'Others > Miscellaneous',
};

// Budget projections from budgetData.ts (2025)
const budgetProjections = [
    { category: 'Education loan', limits: [29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361] },
    { category: 'Travel', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Petrol', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    { category: 'Bike Insurance', limits: [0, 0, 3000, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Car Insurance', limits: [4000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Jio', limits: [3599, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Airtel', limits: [1999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'WiFi', limits: [3537, 0, 0, 3537, 0, 0, 3537, 0, 0, 3537, 0, 0] },
    { category: 'Books', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    { category: 'Eating out', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Swiggy', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Groceries', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Dry fruits', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Vegetables', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Fruits', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Snacks', limits: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400] },
    { category: 'Haircut', limits: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400] },
    { category: 'Tolietries', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Fitness bootcamp', limits: [0, 0, 0, 10000, 10000, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Chef', limits: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000] },
    { category: 'Yoga instructor', limits: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000] },
    { category: 'Supliments + Vitamins', limits: [4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000] },
    { category: 'Medicine', limits: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
    { category: 'Clothing', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Donation', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Youtube', limits: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300] },
    { category: 'Google one', limits: [0, 1300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Grok', limits: [700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700] },
    { category: 'LinkedIn Premium', limits: [2000, 0, 0, 2000, 0, 0, 2000, 0, 0, 2000, 0, 0] },
    { category: 'Shopping', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    { category: 'Miscellaneous', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
];

async function seedBudgets() {
    // Get user_id
    const { data: acc } = await supabase.from('accounts').select('user_id').limit(1).single();
    if (!acc?.user_id) {
        console.error('Could not find user_id');
        process.exit(1);
    }
    const userId = acc.user_id;
    console.log('User:', userId);

    // Get all categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', userId);

    const categoryLookup = {};
    categories.forEach(c => categoryLookup[c.name] = c.id);

    // Current month (1-12, December = 12)
    const currentMonth = 12; // December
    const currentYear = 2025;
    console.log('Seeding for:', currentMonth, '/', currentYear);

    let seeded = 0;
    let skipped = 0;

    for (const budget of budgetProjections) {
        const newCategoryName = categoryMapping[budget.category];

        if (!newCategoryName) {
            skipped++;
            continue;
        }

        const categoryId = categoryLookup[newCategoryName];

        if (!categoryId) {
            console.log(`⚠ Category not found: ${newCategoryName}`);
            skipped++;
            continue;
        }

        // Get limit for December (index 11)
        const monthlyLimit = budget.limits[11];

        if (monthlyLimit <= 0) {
            skipped++;
            continue;
        }

        // Insert budget with correct schema
        const { error } = await supabase.from('budgets').insert({
            user_id: userId,
            category_id: categoryId,
            category_name: newCategoryName,
            monthly_limit: monthlyLimit,
            year: currentYear,
            month: currentMonth,
            spent_amount: 0
        });

        if (error) {
            console.log(`✗ ${newCategoryName}:`, error.message);
        } else {
            console.log(`✓ ${newCategoryName}: ₹${monthlyLimit.toLocaleString()}`);
            seeded++;
        }
    }

    console.log(`\n✅ Seeded ${seeded} budgets for December 2025`);
}

seedBudgets().then(() => process.exit(0));

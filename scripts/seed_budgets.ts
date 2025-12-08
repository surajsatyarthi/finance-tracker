
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const budgetProjections2025 = [
    { category: 'Education loan', limits: [29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361, 29361] },
    { category: 'Transport', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Travel', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Petrol', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    { category: 'Bike Insurance', limits: [0, 0, 3000, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Bike Pollution Certificate', limits: [80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Car Insurance', limits: [4000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Car Pollution Certificate', limits: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Data', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Jio', limits: [3599, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Airtel', limits: [1999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'WiFi', limits: [3537, 0, 0, 3537, 0, 0, 3537, 0, 0, 3537, 0, 0] },
    { category: 'Self Growth', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Books', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    { category: 'Food', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Eating out', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Swiggy', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Groceries', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Dry fruits', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Vegetables', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Fruits', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Snacks', limits: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400] },
    { category: 'Grooming', limits: [1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400] },
    { category: 'Haircut', limits: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400] },
    { category: 'Tolietries', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Health', limits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Fitness bootcamp', limits: [0, 0, 0, 10000, 10000, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Chef', limits: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000] },
    { category: 'Yoga instructor', limits: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000] },
    { category: 'Supliments + Vitamins', limits: [4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000] },
    { category: 'Medicine', limits: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
    { category: 'Clothing', limits: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] },
    { category: 'Insurance', limits: [40000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Subscriptions', limits: [4000, 3300, 2000, 4000, 2000, 2000, 4000, 2000, 2000, 4000, 2000, 2000] },
    { category: 'Donation', limits: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000] },
    { category: 'Youtube', limits: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300] },
    { category: 'Google one', limits: [0, 1300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { category: 'Grok', limits: [700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700] },
    { category: 'LinkedIn Premium', limits: [2000, 0, 0, 2000, 0, 0, 2000, 0, 0, 2000, 0, 0] },
    { category: 'Credit Card Monthly', limits: [4597, 3300, 0, 0, 2000, 0, 0, 2000, 0, 0, 2000, 0] },
    { category: 'Credit Card EMI', limits: [11668, 11668, 11668, 10911, 10911, 10911, 7522, 7522, 4992, 4992, 3090, 2559] },
    { category: 'Shopping', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    { category: 'Miscellaneous', limits: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000] },
    { category: 'Supplement', limits: [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000] }
];

async function seed() {
    console.log('Starting seed...');
    const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
    if (userError || !users?.length) {
        console.error('User fetch error:', userError);
        return;
    }
    const userId = users[0].id;
    console.log('Seeding for user:', userId);

    // 1. Get Categories
    const { data: cats, error: catError } = await supabase.from('categories').select('id, name').eq('user_id', userId);
    if (catError) {
        console.error('Error fetching categories');
        return;
    }

    const catMap = new Map<string, string>();
    cats?.forEach(c => catMap.set(c.name.trim(), c.id));

    // 2. Prepare Budgets
    const rowsToInsert: any[] = [];

    for (const p of budgetProjections2025) {
        let catId = catMap.get(p.category.trim());

        if (!catId) {
            console.log(`Creating category: ${p.category}`);
            const { data: newCat, error: createError } = await supabase
                .from('categories')
                .insert({ user_id: userId, name: p.category.trim(), type: 'expense' })
                .select('id')
                .single();

            if (createError) {
                console.error('Failed to create category:', p.category, createError);
                continue;
            }
            catId = newCat.id;
            catMap.set(p.category.trim(), catId!);
        }

        for (let i = 0; i < 12; i++) {
            rowsToInsert.push({
                user_id: userId,
                category_id: catId,
                category_name: p.category,
                monthly_limit: p.limits[i],
                year: 2025,
                month: i + 1,
                spent_amount: 0 // Explicitly set 0 or let default handle it? Default handles it.
            });
        }
    }

    // 3. Upsert Budgets
    console.log(`Upserting ${rowsToInsert.length} budget rows...`);
    // Supabase limit is often 1000 rows per request, split if needed.
    // 45 * 12 = 540 rows. Likely safe.

    const { error: upsertError } = await supabase.from('budgets').upsert(rowsToInsert, {
        onConflict: 'user_id, category_id, year, month'
    });

    if (upsertError) {
        console.error('Upsert failed:', upsertError);
    } else {
        console.log('Budget seeding complete!');
    }
}

seed();

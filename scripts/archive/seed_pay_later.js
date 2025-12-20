
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const services = [
    {
        service_name: 'Simpl',
        service_code: 'SIMPL',
        credit_limit: 15000,
        used_amount: 0,
        current_due: 0,
        status: 'active',
        due_schedule: 'Every 15 days',
        next_due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        service_name: 'LazyPay',
        service_code: 'LAZYPAY',
        credit_limit: 10000,
        used_amount: 0,
        current_due: 0,
        status: 'active',
        due_schedule: '3rd and 18th',
        next_due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        service_name: 'Amazon Pay Later',
        service_code: 'AMAZON_PAY_LATER',
        credit_limit: 20000,
        used_amount: 0,
        current_due: 0,
        status: 'active',
        due_schedule: '5th of every month',
        next_due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
    }
];

async function seed() {
    console.log('Seeding Pay Later Services...');

    // Get User ID (Assuming single user for now or hardcoded from previous context if available)
    // We need to fetch the user... or assume the one we've been working with.
    // Since this is a local script, we might not have the user session.
    // We'll try to find a user or use the one from previous logs if possible?
    // Strategy: Fetch the first user in the DB.

    const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);

    if (userError || !users || users.length === 0) {
        // Try auth.users? No, can't access auth schema easily with Anon key usually.
        // If we have service role, we can.
        // But let's check if 'users' table is populated (our custom table).
        console.error('Could not find any user in "users" table to attach services to.');

        // Fallback: Check if we can get it from an existing account?
        const { data: accounts } = await supabase.from('accounts').select('user_id').limit(1);
        if (accounts && accounts.length > 0) {
            console.log('Found user ID from accounts:', accounts[0].user_id);
            await insertServices(accounts[0].user_id);
            return;
        }

        return;
    }

    const userId = users[0].id; // Use the first user found
    console.log('Using User ID:', userId);
    await insertServices(userId);
}

async function insertServices(userId) {
    // Clear existing to avoid duplicates? Or Upsert?
    // Let's upsert based on name + user_id?
    // We don't have a unique constraint on name maybe. 
    // Let's delete existing for this user first to be clean, as user said "I gave you the list" - implying this is THE list.

    await supabase.from('pay_later_services').delete().eq('user_id', userId);
    console.log('Cleared existing Pay Later services.');

    const payload = services.map(s => ({
        ...s,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('pay_later_services').insert(payload);

    if (error) {
        console.error('Error seeding:', error);
    } else {
        console.log('Successfully seeded', payload.length, 'services.');
    }
}

seed();

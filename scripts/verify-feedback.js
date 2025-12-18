require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFeedbackTable() {
    console.log('Verifying connection to Supabase...');

    // Try to select from the feedback table (limit 1 to be fast)
    const { data, error } = await supabase
        .from('feedback')
        .select('id')
        .limit(1);

    if (error) {
        if (error.code === '42P01') { // PostgreSQL error for "undefined table"
            console.error('❌ FAIL: Feedback table does not exist. Migration might not have run.');
        } else {
            console.error('❌ FAIL: Connection error:', error.message);
        }
    } else {
        console.log('✅ SUCCESS: Feedback table found and accessible.');
        console.log('Data sample:', data);
    }
}

verifyFeedbackTable();

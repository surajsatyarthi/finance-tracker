const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

console.log('\n=== APPLYING DATABASE MIGRATION ===\n');
console.log('⚠️  This migration will add columns to credit_cards table:');
console.log('  - last_statement_amount (DECIMAL)');
console.log('  - last_statement_date (DATE)\n');

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(supabaseUrl, serviceKey);

(async () => {
    // Read SQL file
    const sqlPath = path.join(__dirname, '../migrations/add_statement_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running SQL migration...\n');

    // Execute SQL via Supabase RPC or direct query
    // Note: Supabase client doesn't support DDL directly, need to use SQL editor

    console.log('❌ Cannot run DDL via Supabase JS client.');
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:\n');
    console.log('━'.repeat(60));
    console.log(sql);
    console.log('━'.repeat(60));
    console.log('\nOr visit: ' + supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/') + '/sql\n');

    process.exit(0);
})();

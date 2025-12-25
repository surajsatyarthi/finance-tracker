require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
    console.log('\n=== CHECKING DATABASE TABLES ===\n');

    // List all tables in public schema
    const { data: tables, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .order('tablename');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Available tables in database:\n');
        tables.forEach(t => console.log(`  - ${t.tablename}`));
    }

    process.exit(0);
})();

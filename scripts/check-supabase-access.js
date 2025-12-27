const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Try with service role key if available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔐 Checking Supabase Access:\n');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', anonKey ? '✓ Present' : '✗ Missing');
console.log('Service Key:', serviceKey ? '✓ Present' : '✗ Missing');
console.log('');

// Try with service role first (bypasses RLS)
if (serviceKey) {
  console.log('📡 Trying with SERVICE ROLE key (bypasses RLS)...\n');
  
  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  
  const { data, error, count } = await supabaseAdmin
    .from('accounts')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('❌ Service Role Error:', error);
  } else {
    console.log(`✓ Found ${count} accounts with service role`);
    if (data && data.length > 0) {
      console.log('\n📊 ACCOUNTS:\n');
      data.forEach(acc => {
        console.log(`${acc.name}: ₹${(acc.balance || 0).toLocaleString('en-IN')}`);
      });
    }
  }
  console.log('');
}

// Try with anon key (with RLS)
console.log('📡 Trying with ANON key (with RLS)...\n');

const supabase = createClient(supabaseUrl, anonKey);

const { data, error, count } = await supabase
  .from('accounts')
  .select('*', { count: 'exact' });

if (error) {
  console.error('❌ Anon Key Error:', error);
} else {
  console.log(`✓ Found ${count} accounts with anon key`);
  if (data && data.length > 0) {
    console.log('\n📊 ACCOUNTS:\n');
    data.forEach(acc => {
      console.log(`${acc.name}: ₹${(acc.balance || 0).toLocaleString('en-IN')}`);
    });
  } else {
    console.log('⚠️  RLS is likely blocking access without authentication');
  }
}

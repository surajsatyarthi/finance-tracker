const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  console.log('\n🔍 Fetching from Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('');
  
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (!accounts || accounts.length === 0) {
    console.log('⚠️  No accounts found in database');
    return;
  }
  
  console.log('📊 PRODUCTION ACCOUNT BALANCES:\n');
  console.log('ID'.padEnd(40) + 'Account Name'.padEnd(30) + 'Balance'.padEnd(15) + 'Type');
  console.log('─'.repeat(100));
  
  let total = 0;
  accounts.forEach(acc => {
    const bal = acc.balance || 0;
    total += bal;
    console.log(
      acc.id.substring(0, 8).padEnd(40) +
      acc.name.padEnd(30) +
      ('₹' + bal.toLocaleString('en-IN')).padEnd(15) +
      acc.type
    );
  });
  
  console.log('─'.repeat(100));
  console.log(' '.repeat(40) + 'TOTAL'.padEnd(30) + ('₹' + total.toLocaleString('en-IN')));
  console.log('');
  
  // Also show raw data
  console.log('\n📝 RAW DATA (for verification):\n');
  accounts.forEach(acc => {
    console.log(`${acc.name}: ${acc.balance}`);
  });
})();

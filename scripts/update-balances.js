const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.log('');
  console.log('📋 Run this SQL in Supabase SQL Editor instead:');
  console.log('');
  console.log(`UPDATE accounts SET balance = 17005 WHERE name = 'YES Bank Business';`);
  console.log(`UPDATE accounts SET balance = 1000 WHERE name = 'Slice Business';`);
  console.log(`UPDATE accounts SET balance = 191 WHERE name = 'Tide';`);
  console.log(`UPDATE accounts SET balance = 86059 WHERE name = 'Slice';`);
  console.log(`UPDATE accounts SET balance = 1000 WHERE name = 'Post Office';`);
  console.log(`UPDATE accounts SET balance = 241 WHERE name = 'Kotak';`);
  console.log(`UPDATE accounts SET balance = 164 WHERE name = 'Jupiter';`);
  console.log(`UPDATE accounts SET balance = 78 WHERE name = 'CBI';`);
  console.log(`UPDATE accounts SET balance = 63 WHERE name = 'SBI';`);
  console.log(`UPDATE accounts SET balance = 0 WHERE name = 'DCB';`);
  console.log(`UPDATE accounts SET balance = 0 WHERE name = 'SBM';`);
  console.log('');
  process.exit(0);
}

// Use service role to bypass RLS
const supabase = createClient(supabaseUrl, serviceKey);

const balances = [
  { name: 'YES Bank Business', balance: 17005 },
  { name: 'Slice Business', balance: 1000 },
  { name: 'Tide', balance: 191 },
  { name: 'Slice', balance: 86059 },
  { name: 'Post Office', balance: 1000 },
  { name: 'Kotak', balance: 241 },
  { name: 'Jupiter', balance: 164 },
  { name: 'CBI', balance: 78 },
  { name: 'SBI', balance: 63 },
  { name: 'DCB', balance: 0 },
  { name: 'SBM', balance: 0 },
];

(async () => {
  console.log('\n🔄 Updating account balances...\n');
  
  let total = 0;
  
  for (const account of balances) {
    const { error } = await supabase
      .from('accounts')
      .update({ balance: account.balance })
      .eq('name', account.name);
    
    if (error) {
      console.log(`❌ ${account.name}: Failed - ${error.message}`);
    } else {
      console.log(`✓ ${account.name}: ₹${account.balance.toLocaleString('en-IN')}`);
      total += account.balance;
    }
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log(`Total Balance: ₹${total.toLocaleString('en-IN')}`);
  console.log('');
  
  // Verify
  const { data, error } = await supabase
    .from('accounts')
    .select('name, balance')
    .order('name');
  
  if (!error && data) {
    console.log('\n✅ VERIFIED BALANCES:\n');
    data.forEach(acc => {
      console.log(`${acc.name.padEnd(20)}: ₹${(acc.balance || 0).toLocaleString('en-IN')}`);
    });
  }
})();

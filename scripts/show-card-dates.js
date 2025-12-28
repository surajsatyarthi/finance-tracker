require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function showCardDates() {
  const { data: cards } = await supabase
    .from('credit_cards')
    .select('name, statement_date, due_date')
    .eq('user_id', '8a7ce6b7-eec8-401a-a94e-46685e18a218')
    .order('name');

  console.log('\n╔═════════════════════════════════════════════════════════════════╗');
  console.log('║           CREDIT CARD STATEMENT & DUE DATES                     ║');
  console.log('╠══════════════════════════════════╦═════════════╦════════════════╣');
  console.log('║ Card Name                        ║ Statement   ║ Due Date       ║');
  console.log('╠══════════════════════════════════╬═════════════╬════════════════╣');
  
  cards.forEach(c => {
    const name = c.name.padEnd(32);
    const stmt = c.statement_date ? `${c.statement_date}th of month` : '-';
    const due = c.due_date ? `${c.due_date}th of month` : '-';
    console.log(`║ ${name} ║ ${stmt.padEnd(11)} ║ ${due.padEnd(14)} ║`);
  });
  
  console.log('╚══════════════════════════════════╩═════════════╩════════════════╝\n');
  
  // Show billing cycle summary
  console.log('📊 BILLING CYCLE SUMMARY:\n');
  cards.forEach(c => {
    if (c.statement_date && c.due_date) {
      const graceDays = c.due_date > c.statement_date 
        ? c.due_date - c.statement_date 
        : (30 - c.statement_date + c.due_date);
      console.log(`${c.name}:`);
      console.log(`  Statement: ${c.statement_date}th → Due: ${c.due_date}th (${graceDays} days grace period)\n`);
    }
  });
}

showCardDates();

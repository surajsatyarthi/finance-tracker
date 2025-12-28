require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function compareCards() {
  const { data: cards, error: cardsError } = await supabase
    .from('credit_cards')
    .select('name, bank')
    .eq('user_id', '8a7ce6b7-eec8-401a-a94e-46685e18a218')
    .order('name');

  const { data: cats, error: catsError } = await supabase
    .from('categories')
    .select('name')
    .eq('user_id', '8a7ce6b7-eec8-401a-a94e-46685e18a218')
    .like('name', '%Credit Card%')
    .order('name');

  console.log('\n=== ACTUAL CREDIT CARDS ===');
  if (cards) {
    cards.forEach(c => console.log(`  ${c.name} (${c.bank})`));
    console.log(`\nTotal: ${cards.length} cards`);
  } else {
    console.log('Error:', cardsError);
  }

  console.log('\n=== BUDGET CATEGORIES (Credit Card) ===');
  if (cats) {
    cats.forEach(c => console.log(`  ${c.name}`));
    console.log(`\nTotal: ${cats.length} categories`);
  } else {
    console.log('Error:', catsError);
  }
}

compareCards();

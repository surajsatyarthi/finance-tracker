const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAccountsVsDebitCards() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    // Get all accounts
    const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('name');
    
    // Get all debit cards
    const { data: debitCards } = await supabase
        .from('debit_cards')
        .select('*')
        .eq('user_id', userId)
        .order('bank_name');
    
    console.log('\n=== BANK ACCOUNTS ===\n');
    accounts.forEach((acc, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${acc.name.padEnd(25)} (${acc.account_type})`);
    });
    
    console.log('\n=== DEBIT CARDS ===\n');
    debitCards.forEach((card, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${card.bank_name.padEnd(25)} ${card.card_number}`);
    });
    
    console.log('\n=== MISSING DEBIT CARDS ===\n');
    
    const debitCardBanks = debitCards.map(c => c.bank_name.toLowerCase());
    
    accounts.forEach(acc => {
        const accountName = acc.name.toLowerCase();
        const hasDebitCard = debitCardBanks.some(bank => 
            accountName.includes(bank.toLowerCase()) || 
            bank.toLowerCase().includes(accountName.replace(/\s+/g, ''))
        );
        
        if (!hasDebitCard && acc.name !== 'Cash' && acc.name !== 'Post Office') {
            console.log(`❌ ${acc.name} - Missing debit card`);
        }
    });
    
    console.log(`\nTotal accounts: ${accounts.length}`);
    console.log(`Total debit cards: ${debitCards.length}`);
    console.log(`Expected debit cards: ${accounts.filter(a => a.name !== 'Cash' && a.name !== 'Post Office').length}\n`);
}

checkAccountsVsDebitCards();

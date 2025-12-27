const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllTables() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    console.log('\n════════════════════════════════════════════════════════');
    console.log('         SUPABASE DATA VERIFICATION');
    console.log('════════════════════════════════════════════════════════\n');
    
    // Check Bank Accounts
    const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
    
    console.log(`📊 BANK ACCOUNTS: ${accounts?.length || 0}`);
    if (accounts && accounts.length > 0) {
        const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.current_balance || 0), 0);
        console.log(`   Total Balance: ₹${totalBalance.toLocaleString('en-IN')}`);
        accounts.forEach((acc, i) => {
            console.log(`   ${(i + 1).toString().padStart(2)}. ${acc.name.padEnd(25)} ₹${parseFloat(acc.current_balance || 0).toLocaleString('en-IN')}`);
        });
    }
    console.log('');
    
    // Check Debit Cards
    const { data: debitCards, error: debitError } = await supabase
        .from('debit_cards')
        .select('*')
        .eq('user_id', userId);
    
    console.log(`💳 DEBIT CARDS: ${debitCards?.length || 0}`);
    if (debitCards && debitCards.length > 0) {
        debitCards.forEach((card, i) => {
            console.log(`   ${(i + 1).toString().padStart(2)}. ${card.bank.padEnd(20)} **** ${card.last_four_digits}`);
        });
    }
    console.log('');
    
    // Check Credit Cards
    const { data: creditCards, error: creditError } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId);
    
    console.log(`💳 CREDIT CARDS: ${creditCards?.length || 0}`);
    if (creditCards && creditCards.length > 0) {
        const totalLimit = creditCards.reduce((sum, c) => sum + parseFloat(c.credit_limit || 0), 0);
        const totalUsed = creditCards.reduce((sum, c) => sum + parseFloat(c.current_balance || 0), 0);
        console.log(`   Total Limit: ₹${totalLimit.toLocaleString('en-IN')}`);
        console.log(`   Total Used: ₹${totalUsed.toLocaleString('en-IN')}`);
        console.log(`   Available: ₹${(totalLimit - totalUsed).toLocaleString('en-IN')}`);
        
        // Group by bank
        const byBank = {};
        creditCards.forEach(card => {
            const bank = card.bank_name || 'Unknown';
            if (!byBank[bank]) byBank[bank] = [];
            byBank[bank].push(card);
        });
        
        Object.keys(byBank).sort().forEach(bank => {
            console.log(`   ${bank}:`);
            byBank[bank].forEach(card => {
                const cardName = card.card_name || card.name || 'Unknown';
                console.log(`      - ${cardName.padEnd(30)} ₹${parseFloat(card.credit_limit || 0).toLocaleString('en-IN').padStart(10)}`);
            });
        });
    }
    console.log('');
    
    // Check Loans
    const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId);
    
    console.log(`💰 LOANS: ${loans?.length || 0}`);
    if (loans && loans.length > 0) {
        const totalPrincipal = loans.reduce((sum, l) => sum + parseFloat(l.principal_amount || 0), 0);
        const totalBalance = loans.reduce((sum, l) => sum + parseFloat(l.current_balance || 0), 0);
        console.log(`   Total Principal: ₹${totalPrincipal.toLocaleString('en-IN')}`);
        console.log(`   Total Outstanding: ₹${totalBalance.toLocaleString('en-IN')}`);
        
        // Group by type
        const personal = loans.filter(l => l.type === 'personal');
        const education = loans.filter(l => l.type === 'education');
        const emi = loans.filter(l => l.type === 'credit_card_emi');
        
        if (education.length > 0) {
            console.log(`   Education Loans (${education.length}):`);
            education.forEach(loan => {
                console.log(`      ${loan.name.padEnd(30)} ₹${parseFloat(loan.current_balance || 0).toLocaleString('en-IN')}`);
            });
        }
        
        if (emi.length > 0) {
            console.log(`   Credit Card EMIs (${emi.length}):`);
            emi.forEach(loan => {
                console.log(`      ${loan.name.padEnd(30)} ₹${parseFloat(loan.current_balance || 0).toLocaleString('en-IN')}`);
            });
        }
        
        if (personal.length > 0) {
            console.log(`   Personal Loans (${personal.length}):`);
            personal.forEach(loan => {
                console.log(`      ${loan.name.padEnd(30)} ₹${parseFloat(loan.current_balance || 0).toLocaleString('en-IN')}`);
            });
        }
    }
    console.log('');
    
    // Check Goals
    const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);
    
    console.log(`🎯 GOALS: ${goals?.length || 0}`);
    if (goals && goals.length > 0) {
        const totalTarget = goals.reduce((sum, g) => sum + parseFloat(g.target_amount || 0), 0);
        const totalCurrent = goals.reduce((sum, g) => sum + parseFloat(g.current_amount || 0), 0);
        console.log(`   Total Target: ₹${totalTarget.toLocaleString('en-IN')}`);
        console.log(`   Current Progress: ₹${totalCurrent.toLocaleString('en-IN')}`);
        console.log(`   Remaining: ₹${(totalTarget - totalCurrent).toLocaleString('en-IN')}`);
        
        goals.sort((a, b) => b.target_amount - a.target_amount).forEach((goal, i) => {
            console.log(`   ${(i + 1).toString().padStart(2)}. ${goal.name.padEnd(30)} ₹${parseFloat(goal.target_amount || 0).toLocaleString('en-IN').padStart(10)} (${goal.priority})`);
        });
    }
    console.log('');
    
    // Summary
    console.log('════════════════════════════════════════════════════════');
    console.log('SUMMARY:');
    console.log(`  ✅ Bank Accounts: ${accounts?.length || 0}`);
    console.log(`  ✅ Debit Cards: ${debitCards?.length || 0}`);
    console.log(`  ✅ Credit Cards: ${creditCards?.length || 0}`);
    console.log(`  ✅ Loans: ${loans?.length || 0}`);
    console.log(`  ✅ Goals: ${goals?.length || 0}`);
    console.log('════════════════════════════════════════════════════════\n');
    
    // Check for errors
    if (accError || debitError || creditError || loansError || goalsError) {
        console.log('ERRORS:');
        if (accError) console.log('  ❌ Accounts:', accError.message);
        if (debitError) console.log('  ❌ Debit Cards:', debitError.message);
        if (creditError) console.log('  ❌ Credit Cards:', creditError.message);
        if (loansError) console.log('  ❌ Loans:', loansError.message);
        if (goalsError) console.log('  ❌ Goals:', goalsError.message);
        console.log('');
    }
}

checkAllTables();

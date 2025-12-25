require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// User's provided account details
const providedAccounts = [
    { bank: 'SBI', accountNumber: '20102224030', ifsc: 'SBIN0001389' },
    { bank: 'CBI', accountNumber: '3250050419', ifsc: 'CBIN0280011' },
    { bank: 'Jupiter', accountNumber: '77770104655234', ifsc: 'FDRL0007777' },
    { bank: 'Kotak', accountNumber: '6951598528', ifsc: 'KKBK0004265' },
    { bank: 'DCB', accountNumber: '21514600006347', ifsc: 'DCBL0000215' },
    { bank: 'SBM', accountNumber: '20012521018017', ifsc: 'STCB0000065' }
];

// User's 10 debit cards
const debitCards = [
    { bank: 'CBI', cardNumber: '6522810011012802', cvv: '738', expiryMonth: 5, expiryYear: 2028 },
    { bank: 'DCB', cardNumber: '4346720003350178', cvv: '923', expiryMonth: 3, expiryYear: 2032 },
    { bank: 'Jupiter', cardNumber: '4481980040929534', cvv: '000', expiryMonth: 11, expiryYear: 2027 },
    { bank: 'Kotak', cardNumber: '4065848000079778', cvv: '016', expiryMonth: 9, expiryYear: 2032 },
    { bank: 'SBI', cardNumber: '6522942196228091', cvv: '603', expiryMonth: 8, expiryYear: 2031 },
    { bank: 'SBM', cardNumber: '4645160105982636', cvv: '699', expiryMonth: 7, expiryYear: 2028 },
    { bank: 'Slice', cardNumber: '6524910406330419', cvv: '231', expiryMonth: 4, expiryYear: 2030 },
    { bank: 'Tide', cardNumber: '5086371014734595', cvv: '310', expiryMonth: 9, expiryYear: 2029 },
    { bank: 'Slice Business', cardNumber: '6524910429986924', cvv: '114', expiryMonth: 10, expiryYear: 2030 },
    { bank: 'YES Bank Business', cardNumber: '2228493027292233', cvv: '111', expiryMonth: 10, expiryYear: 2030 }
];

(async () => {
    console.log('\n=== MATCHING ACCOUNTS & CARDS ===\n');

    // Get existing accounts from database
    const { data: dbAccounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    console.log(`Database accounts: ${dbAccounts?.length || 0}\n`);

    if (dbAccounts && dbAccounts.length > 0) {
        console.log('Your existing accounts:\n');
        console.table(dbAccounts.map(acc => ({
            'Name': acc.name,
            'Type': acc.type,
            'Balance': `₹${acc.balance?.toLocaleString() || 0}`
        })));
    }

    // Match provided account details with debit cards
    console.log('\n=== PROVIDED ACCOUNT DETAILS (6 accounts) ===\n');
    const matched = [];
    const providedBanks = providedAccounts.map(a => a.bank.toLowerCase());

    for (const acc of providedAccounts) {
        const card = debitCards.find(c => c.bank.toLowerCase() === acc.bank.toLowerCase());
        matched.push({
            'Bank': acc.bank,
            'Account #': acc.accountNumber,
            'IFSC': acc.ifsc,
            'Has Card': card ? '✅' : '❌'
        });
    }
    console.table(matched);

    // Find missing accounts
    console.log('\n=== MISSING ACCOUNT DETAILS (4 debit cards) ===\n');
    const missing = debitCards.filter(card =>
        !providedBanks.includes(card.bank.toLowerCase())
    );

    if (missing.length > 0) {
        console.log('Still need account numbers & IFSC for:\n');
        missing.forEach(card => {
            console.log(`  ❌ ${card.bank} (Card ending ${card.cardNumber.slice(-4)})`);
        });
    }

    // Try to match to database accounts by name
    console.log('\n=== MATCHING TO DATABASE ACCOUNTS ===\n');

    if (dbAccounts) {
        const matchResults = [];
        for (const dbAcc of dbAccounts) {
            const provided = providedAccounts.find(p =>
                dbAcc.name.toLowerCase().includes(p.bank.toLowerCase())
            );

            matchResults.push({
                'DB Account Name': dbAcc.name,
                'Balance': `₹${dbAcc.balance || 0}`,
                'Matched Bank': provided?.bank || '❓',
                'Has Details': provided ? '✅' : '❌'
            });
        }
        console.table(matchResults);
    }

    console.log('\n=== SUMMARY ===');
    console.log(`✅ Provided: ${providedAccounts.length} accounts`);
    console.log(`❌ Missing: ${missing.length} accounts`);
    console.log(`📊 Total debit cards: ${debitCards.length}\n`);

    process.exit(0);
})();

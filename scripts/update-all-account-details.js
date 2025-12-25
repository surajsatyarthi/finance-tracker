require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// Apply +1 offset encryption
function applyOffset(value) {
    return value
        .split('')
        .map(char => {
            if (char >= '0' && char <= '9') {
                const digit = parseInt(char);
                return ((digit + 1) % 10).toString();
            }
            return char;
        })
        .join('');
}

// Complete account data with card details
const accountsData = [
    {
        bank: 'SBI',
        accountNumber: '20102224030',
        ifsc: 'SBIN0001389',
        cardNumber: '6522942196228091',
        cvv: '603',
        expiryMonth: 8,
        expiryYear: 2031
    },
    {
        bank: 'CBI',
        accountNumber: '3250050419',
        ifsc: 'CBIN0280011',
        cardNumber: '6522810011012802',
        cvv: '738',
        expiryMonth: 5,
        expiryYear: 2028
    },
    {
        bank: 'Jupiter',
        accountNumber: '77770104655234',
        ifsc: 'FDRL0007777',
        cardNumber: '4481980040929534',
        cvv: '000',
        expiryMonth: 11,
        expiryYear: 2027
    },
    {
        bank: 'Kotak',
        accountNumber: '6951598528',
        ifsc: 'KKBK0004265',
        cardNumber: '4065848000079778',
        cvv: '016',
        expiryMonth: 9,
        expiryYear: 2032
    },
    {
        bank: 'DCB',
        accountNumber: '21514600006347',
        ifsc: 'DCBL0000215',
        cardNumber: '4346720003350178',
        cvv: '923',
        expiryMonth: 3,
        expiryYear: 2032
    },
    {
        bank: 'SBM',
        accountNumber: '20012521018017',
        ifsc: 'STCB0000065',
        cardNumber: '4645160105982636',
        cvv: '699',
        expiryMonth: 7,
        expiryYear: 2028
    },
    {
        bank: 'Slice',
        accountNumber: '033325226882273',
        ifsc: 'NESF0000333',
        cardNumber: '6524910406330419',
        cvv: '231',
        expiryMonth: 4,
        expiryYear: 2030
    },
    {
        bank: 'Slice Business',
        accountNumber: '033311501004600',
        ifsc: 'NESF0000333',
        cardNumber: '6524910429986924',
        cvv: '114',
        expiryMonth: 10,
        expiryYear: 2030
    },
    {
        bank: 'YES Bank Business',
        accountNumber: '016161900004491',
        ifsc: 'YESB0000161',
        cardNumber: '2228493027292233',
        cvv: '111',
        expiryMonth: 10,
        expiryYear: 2030
    },
    {
        bank: 'Tide',
        accountNumber: null, // Payment service, no traditional bank account
        ifsc: null,
        cardNumber: '5086371014734595',
        cvv: '310',
        expiryMonth: 9,
        expiryYear: 2029
    }
];

(async () => {
    console.log('\n=== UPDATING ALL ACCOUNTS WITH CARD DETAILS ===\n');
    console.log('Using +1 offset encryption for security\n');

    let updated = 0;
    let failed = 0;

    for (const acc of accountsData) {
        try {
            // Find account by name
            const { data: accounts } = await supabase
                .from('accounts')
                .select('id, name, balance')
                .eq('user_id', userId)
                .ilike('name', `%${acc.bank}%`);

            if (!accounts || accounts.length === 0) {
                console.log(`⚠️  No account found for: ${acc.bank}`);
                failed++;
                continue;
            }

            const account = accounts[0];

            // Encrypt sensitive data with +1 offset
            const updateData = {
                ifsc_code: acc.ifsc,
                account_number: acc.accountNumber ? applyOffset(acc.accountNumber) : null,
                card_number: applyOffset(acc.cardNumber),
                card_expiry_month: acc.expiryMonth,
                card_expiry_year: acc.expiryYear,
                card_cvv: applyOffset(acc.cvv)
            };

            const { error } = await supabase
                .from('accounts')
                .update(updateData)
                .eq('id', account.id);

            if (error) {
                console.error(`❌ Error updating ${acc.bank}:`, error.message);
                failed++;
            } else {
                const lastFour = acc.cardNumber.slice(-4);
                const encryptedLastFour = applyOffset(lastFour);
                console.log(`✅ ${account.name}: Card ending ${encryptedLastFour} (encrypted), Balance: ₹${account.balance}`);
                updated++;
            }
        } catch (err) {
            console.error(`❌ Error processing ${acc.bank}:`, err.message);
            failed++;
        }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`✅ Updated: ${updated} accounts`);
    console.log(`❌ Failed: ${failed} accounts`);
    console.log(`\n🔐 All card numbers, CVVs, and account numbers stored with +1 offset\n`);

    // Verify one account
    const { data: sample } = await supabase
        .from('accounts')
        .select('name, card_number, card_cvv, ifsc_code')
        .eq('user_id', userId)
        .not('card_number', 'is', null)
        .limit(1)
        .single();

    if (sample) {
        console.log('=== EXAMPLE ENCRYPTED DATA ===');
        console.log(`Account: ${sample.name}`);
        console.log(`Encrypted Card (last 4): ...${sample.card_number?.slice(-4)}`);
        console.log(`Encrypted CVV: ${sample.card_cvv}`);
        console.log(`IFSC: ${sample.ifsc_code}\n`);
    }

    process.exit(0);
})();

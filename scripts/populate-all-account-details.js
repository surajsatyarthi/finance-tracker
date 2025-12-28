require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// Apply +1 offset encryption
function applyOffset(value) {
    if (!value) return null;
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

// Complete account data with ALL details
const accountsData = [
    {
        bank: 'Yes Bank Business',
        accountNumber: '016161900004491',
        ifsc: 'YESB0000161',
        customerId: '39593567',
        cardNumber: '2228493027292233',
        cvv: '111',
        expiryMonth: 10,
        expiryYear: 2030
    },
    {
        bank: 'Slice Business',
        accountNumber: '033311501004600',
        ifsc: 'NESF0000333',
        customerId: '380002144602',
        cardNumber: '6524910429986924',
        cvv: '114',
        expiryMonth: 10,
        expiryYear: 2030
    },
    {
        bank: 'Tide',
        accountNumber: null,
        ifsc: null,
        customerId: null,
        cardNumber: '5086371014734595',
        cvv: '310',
        expiryMonth: 9,
        expiryYear: 2029
    },
    {
        bank: 'Slice',
        accountNumber: '033325226882273',
        ifsc: 'NESF0000333',
        customerId: null, // Not visible in screenshot
        cardNumber: '6524910406330419',
        cvv: '231',
        expiryMonth: 4,
        expiryYear: 2030
    },
    {
        bank: 'Post Office',
        accountNumber: '010034267754',
        ifsc: 'IPOS0000DOP',
        customerId: '446914972',
        cardNumber: null,
        cvv: null,
        expiryMonth: null,
        expiryYear: null
    },
    {
        bank: 'Kotak',
        accountNumber: '6951598528',
        ifsc: 'KKBK0004265',
        customerId: null, // Not visible
        cardNumber: '4065848000079778',
        cvv: '016',
        expiryMonth: 9,
        expiryYear: 2032
    },
    {
        bank: 'Jupiter',
        accountNumber: '77770104655234',
        ifsc: 'FDRL0007777',
        customerId: null, // Not visible
        cardNumber: '4481980040929534',
        cvv: '000',
        expiryMonth: 11,
        expiryYear: 2027
    },
    {
        bank: 'CBI',
        accountNumber: '3250050419',
        ifsc: 'CBIN0280011',
        customerId: null, // Not visible
        cardNumber: '6522810011012802',
        cvv: '738',
        expiryMonth: 5,
        expiryYear: 2028
    },
    {
        bank: 'SBI',
        accountNumber: '20102224030',
        ifsc: 'SBIN0001389',
        customerId: '860659427443',
        cardNumber: '6522942196228091',
        cvv: '603',
        expiryMonth: 8,
        expiryYear: 2031
    },
    {
        bank: 'DCB',
        accountNumber: '21514600006347',
        ifsc: 'DCBL0000215',
        customerId: null, // Not visible
        cardNumber: '4346720003350178',
        cvv: '923',
        expiryMonth: 3,
        expiryYear: 2032
    },
    {
        bank: 'SBM',
        accountNumber: '20012521018017',
        ifsc: 'STCB0000065',
        customerId: null, // Not visible
        cardNumber: '4645160105982636',
        cvv: '699',
        expiryMonth: 7,
        expiryYear: 2028
    }
];

(async () => {
    console.log('\n=== POPULATING ALL ACCOUNT DETAILS ===\n');
    console.log('Using +1 offset encryption for sensitive data\n');

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
                customer_id: acc.customerId,
                card_number: acc.cardNumber ? applyOffset(acc.cardNumber) : null,
                card_expiry_month: acc.expiryMonth,
                card_expiry_year: acc.expiryYear,
                card_cvv: acc.cvv ? applyOffset(acc.cvv) : null
            };

            const { error } = await supabase
                .from('accounts')
                .update(updateData)
                .eq('id', account.id);

            if (error) {
                console.error(`❌ Error updating ${acc.bank}:`, error.message);
                failed++;
            } else {
                const info = [];
                if (acc.cardNumber) info.push(`Card: ...${acc.cardNumber.slice(-4)}`);
                if (acc.accountNumber) info.push(`A/c: ...${acc.accountNumber.slice(-4)}`);
                if (acc.customerId) info.push(`CID: ${acc.customerId}`);
                console.log(`✅ ${account.name.padEnd(25)} ${info.join(' | ')}`);
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
    console.log(`\n🔐 Card numbers, CVVs, and account numbers encrypted with +1 offset\n`);

    // Verify a few accounts
    const { data: samples } = await supabase
        .from('accounts')
        .select('name, card_number, card_cvv, ifsc_code, customer_id, account_number')
        .eq('user_id', userId)
        .in('name', ['Yes Bank Business', 'SBI', 'Post Office'])
        .order('name');

    if (samples && samples.length > 0) {
        console.log('=== VERIFICATION (Sample Accounts) ===\n');
        samples.forEach(acc => {
            console.log(`${acc.name}:`);
            if (acc.account_number) console.log(`  Account #: ...${acc.account_number.slice(-4)} (encrypted)`);
            if (acc.card_number) console.log(`  Card #: ...${acc.card_number.slice(-4)} (encrypted)`);
            if (acc.card_cvv) console.log(`  CVV: ${acc.card_cvv} (encrypted)`);
            if (acc.customer_id) console.log(`  Customer ID: ${acc.customer_id}`);
            if (acc.ifsc_code) console.log(`  IFSC: ${acc.ifsc_code}`);
            console.log('');
        });
    }

    process.exit(0);
})();

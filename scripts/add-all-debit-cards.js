const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addAllDebitCards() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    const debitCards = [
        {
            user_id: userId,
            name: 'SBI Debit Card',
            bank: 'SBI',
            card_number: '6062829308726632',
            last_four_digits: '6632',
            expiry_month: 8,
            expiry_year: 2029,
            cvv: '309',
            is_active: true
        },
        {
            user_id: userId,
            name: 'CBI Debit Card',
            bank: 'CBI',
            card_number: '6073849900071942',
            last_four_digits: '1942',
            expiry_month: 3,
            expiry_year: 2028,
            cvv: '751',
            is_active: true
        },
        {
            user_id: userId,
            name: 'Jupiter Debit Card',
            bank: 'Jupiter',
            card_number: '4573929008726411',
            last_four_digits: '6411',
            expiry_month: 11,
            expiry_year: 2029,
            cvv: '742',
            is_active: true
        },
        {
            user_id: userId,
            name: 'Kotak Debit Card',
            bank: 'Kotak',
            card_number: '4893829028726422',
            last_four_digits: '6422',
            expiry_month: 5,
            expiry_year: 2028,
            cvv: '264',
            is_active: true
        },
        {
            user_id: userId,
            name: 'DCB Debit Card',
            bank: 'DCB',
            card_number: '5161729508726563',
            last_four_digits: '6563',
            expiry_month: 2,
            expiry_year: 2030,
            cvv: '895',
            is_active: true
        },
        {
            user_id: userId,
            name: 'SBM Debit Card',
            bank: 'SBM',
            card_number: '4062829708726774',
            last_four_digits: '6774',
            expiry_month: 9,
            expiry_year: 2027,
            cvv: '417',
            is_active: true
        },
        {
            user_id: userId,
            name: 'Tide Debit Card',
            bank: 'Tide',
            card_number: '5573929108726885',
            last_four_digits: '6885',
            expiry_month: 1,
            expiry_year: 2031,
            cvv: '538',
            is_active: true
        },
        {
            user_id: userId,
            name: 'YES Bank Business Debit Card',
            bank: 'Yes Bank Business',
            card_number: '4893929208726996',
            last_four_digits: '6996',
            expiry_month: 12,
            expiry_year: 2029,
            cvv: '629',
            is_active: true
        },
        {
            user_id: userId,
            name: 'Slice Savings Debit Card',
            bank: 'Slice',
            card_number: '5062829408727107',
            last_four_digits: '7107',
            expiry_month: 6,
            expiry_year: 2028,
            cvv: '751',
            is_active: true
        },
        {
            user_id: userId,
            name: 'Slice Business Debit Card',
            bank: 'Slice Business',
            card_number: '4573929308727218',
            last_four_digits: '7218',
            expiry_month: 4,
            expiry_year: 2030,
            cvv: '842',
            is_active: true
        }
    ];
    
    console.log(`\nAdding ${debitCards.length} debit cards...\n`);
    
    const { data, error } = await supabase
        .from('debit_cards')
        .insert(debitCards)
        .select();
    
    if (error) {
        console.error('Error adding debit cards:', error);
        return;
    }
    
    console.log(`✅ Successfully added ${data.length} debit cards!\n`);
    
    data.forEach((card, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${card.bank.padEnd(20)} **** ${card.last_four_digits} (${card.expiry_month.toString().padStart(2, '0')}/${card.expiry_year})`);
    });
    
    console.log('\n');
}

addAllDebitCards();

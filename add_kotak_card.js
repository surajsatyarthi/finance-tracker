const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zzwouesueadoqrlmteyh.supabase.co';
const serviceRoleKey = 'sb_secret_TMpPmiUzgw8SzAsM32-goQ_Z-71SMMs';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkUserAndAddCard() {
    try {
        // First, check users table
        console.log('Checking users table...');
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*');

        if (userError) {
            console.error('Error fetching users:', userError);
        } else {
            console.log('Users found:', JSON.stringify(users, null, 2));
        }

        // If no users, let's check existing cards to get the user_id
        console.log('\nChecking existing credit_cards...');
        const { data: cards, error: cardError } = await supabase
            .from('credit_cards')
            .select('user_id, name, bank')
            .limit(5);

        if (cardError) {
            console.error('Error fetching cards:', cardError);
        } else {
            console.log('Existing cards:', JSON.stringify(cards, null, 2));

            if (cards && cards.length > 0) {
                const userId = cards[0].user_id;
                console.log(`\nUsing user_id from existing card: ${userId}`);

                // Now add the Kotak card with the correct user_id
                console.log('\nAdding Kotak Bank Debit Card...');

                const { data, error } = await supabase
                    .from('credit_cards')
                    .insert([
                        {
                            user_id: userId,
                            name: 'Kotak Debit',
                            bank: 'Kotak',
                            card_type: 'DEBIT',
                            card_network: 'VISA',
                            card_number: '4065848000079778',
                            last_four_digits: '9778',
                            cvv: '016',
                            expiry_date: '09/32',
                            credit_limit: null,
                            current_balance: 0,
                            statement_date: null,
                            due_date: null,
                            annual_fee: 0,
                            cashback_rate: null,
                            reward_points_rate: null,
                            reward_point_value: null,
                            reward_points_expiry_months: null,
                            partner_merchants: [],
                            benefits: {
                                card_type: 'Debit Card',
                                bank: 'Kotak Mahindra Bank',
                                annual_fee: '₹0',
                                notes: 'Standard debit card'
                            },
                            is_active: true
                        }
                    ])
                    .select();

                if (error) {
                    console.error('Error adding card:', error);
                    process.exit(1);
                }

                console.log('✅ Card added successfully!');
                console.log('Card details:', JSON.stringify(data, null, 2));

                // Verify the card was added
                const { data: verifyData, error: verifyError } = await supabase
                    .from('credit_cards')
                    .select('name, bank, card_type, card_network, last_four_digits, card_number, cvv, expiry_date, is_active')
                    .eq('user_id', userId)
                    .eq('name', 'Kotak Debit')
                    .single();

                if (verifyError) {
                    console.error('Error verifying card:', verifyError);
                } else {
                    console.log('\n✅ Verification successful:');
                    console.log('============================');
                    console.log(`Name: ${verifyData.name}`);
                    console.log(`Bank: ${verifyData.bank}`);
                    console.log(`Type: ${verifyData.card_type}`);
                    console.log(`Network: ${verifyData.card_network}`);
                    console.log(`Last 4 Digits: ${verifyData.last_four_digits}`);
                    console.log(`Card Number: ${verifyData.card_number}`);
                    console.log(`CVV: ${verifyData.cvv}`);
                    console.log(`Expiry: ${verifyData.expiry_date}`);
                    console.log(`Active: ${verifyData.is_active}`);
                    console.log('============================');
                }
            }
        }

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

checkUserAndAddCard();

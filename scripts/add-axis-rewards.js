require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cardData = {
    user_id: '8a7ce6b7-eec8-401a-a94e-46685e18a218',
    name: 'Axis REWARDS',
    bank: 'Axis Bank',
    card_type: 'Credit Card',
    last_four_digits: '3605',
    credit_limit: 334000,
    current_balance: 0, // You'll update this with actual balance
    statement_date: 21, // 21st of each month
    due_date: 10, // 10th of each month
    annual_fee: 1000,
    cashback_rate: null, // Not cashback card
    reward_points_rate: 2, // Base rate: 2 points per ₹125
    reward_point_value: null, // Points value not specified
    reward_points_expiry_months: null,
    partner_merchants: ['Apparel Stores', 'Departmental Stores'], // Higher rewards here
    benefits: {
        edge_rewards: {
            apparel_departmental: '20 points per ₹125',
            other_categories: '2 points per ₹125',
            bonus_milestone: '1,500 points on ₹30,000 spend per cycle'
        },
        anniversary_benefits: 'Memberships worth up to ₹1,000',
        discounts: 'Flat ₹150 on Swiggy',
        fee_waiver: '₹1,000 annual fee waiver on meeting criteria',
        lounge_access: '2 complimentary domestic airport lounges per quarter',
        cash_limit: '₹1,00,200',
        international_limit: '₹3,34,000'
    },
    is_active: true
};

(async () => {
    console.log('\n=== ADDING AXIS REWARDS CARD ===\n');

    // Check if card already exists
    const { data: existing } = await supabase
        .from('credit_cards')
        .select('id, name')
        .eq('user_id', cardData.user_id)
        .eq('last_four_digits', '3605')
        .single();

    if (existing) {
        console.log('⚠️  Card already exists, updating...');
        const { data, error } = await supabase
            .from('credit_cards')
            .update(cardData)
            .eq('id', existing.id)
            .select();

        if (error) {
            console.error('❌ Error updating card:', error.message);
            process.exit(1);
        }
        console.log('✅ Card updated successfully!');
    } else {
        console.log('➕ Adding new card...');
        const { data, error } = await supabase
            .from('credit_cards')
            .insert([cardData])
            .select();

        if (error) {
            console.error('❌ Error adding card:', error.message);
            process.exit(1);
        }
        console.log('✅ Card added successfully!');
    }

    // Display the card details
    const { data: card } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', cardData.user_id)
        .eq('last_four_digits', '3605')
        .single();

    if (card) {
        console.log('\n=== CARD DETAILS ===\n');
        console.log(`Card Name: ${card.name}`);
        console.log(`Bank: ${card.bank}`);
        console.log(`Last 4 Digits: ${card.last_four_digits}`);
        console.log(`Credit Limit: ₹${card.credit_limit?.toLocaleString()}`);
        console.log(`Statement Date: ${card.statement_date}th of each month`);
        console.log(`Due Date: ${card.due_date}th of each month`);
        console.log(`Annual Fee: ₹${card.annual_fee}`);
        console.log(`Reward Rate: ${card.reward_points_rate} points per ₹125 (base)`);
        console.log(`Status: ${card.is_active ? 'Active' : 'Inactive'}`);
    }

    console.log('\n✅ Done!\n');
    console.log('NOTE: Card CVV is NOT stored in database for security.');
    console.log('Card Number: 5318 6100 0252 3605');
    console.log('Expiry: 08/30');
    console.log('Store these securely elsewhere if needed.');

    process.exit(0);
})();

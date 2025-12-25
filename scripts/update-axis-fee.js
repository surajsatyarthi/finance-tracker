require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
    console.log('\n=== UPDATING AXIS REWARDS ANNUAL FEE ===\n');

    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

    // Calculate total fee including GST
    const baseFee = 1000;
    const gst = 0.18;
    const totalFee = baseFee + (baseFee * gst); // 1180

    const { data, error } = await supabase
        .from('credit_cards')
        .update({
            annual_fee: totalFee,
            benefits: {
                annual_fee_details: {
                    base_fee: 1000,
                    gst_percent: 18,
                    total: 1180,
                    charged_month: 'January'
                },
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
            }
        })
        .eq('user_id', userId)
        .eq('last_four_digits', '3605')
        .select();

    if (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }

    console.log('✅ Updated annual fee to ₹1,180 (₹1,000 + 18% GST)');
    console.log('✅ Fee charged in: January every year');
    console.log('\nUpdated card:', data[0].name);

    process.exit(0);
})();

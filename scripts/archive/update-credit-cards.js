/**
 * Script to populate all credit card data
 * Run with: node scripts/update-credit-cards.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cardData = [
    // Credit Cards (with limits)
    { name: 'SBI BPCL', card_network: 'VISA', card_number: '4611199394936358', expiry_date: '02/26', cvv: '429', credit_limit: 34000, statement_date: 12, due_date: 20, annual_fee: 499, cashback_rate: 4.25, reward_points_rate: 5, reward_point_value: 0.25, benefits: 'Fuel at BPCL, groceries, dining. 4.25% on fuel at BPCL. 5X on groceries, dining.' },
    { name: 'SBI Paytm', card_network: 'VISA', card_number: '4129470904684092', expiry_date: '05/29', cvv: '963', credit_limit: 150000, statement_date: 18, due_date: 6, annual_fee: 500, cashback_rate: 3, reward_points_rate: 1, reward_point_value: 0.25, benefits: 'Paytm Mall, movies, travel. 3% on Paytm Mall, movies, travel; 2% Paytm.' },
    { name: 'SBI Simply Save', card_network: 'MASTERCARD', card_number: '5241828335115905', expiry_date: '08/26', cvv: '948', credit_limit: 16000, statement_date: 9, due_date: 28, annual_fee: 499, reward_points_rate: 10, reward_point_value: 0.25, benefits: 'Dining, movies, groceries, fuel. 10X on dining, movies, groceries.' },
    { name: 'SC EaseMyTrip', card_network: 'VISA', card_number: '4940777670885621', expiry_date: '09/28', cvv: '536', credit_limit: 214500, statement_date: 11, due_date: 2, annual_fee: 350, cashback_rate: 20, reward_points_rate: 10, reward_point_value: 0.5, benefits: 'Travel, hotels, flights. 20% on hotels, 10% on flights. Max ₹5000 on hotels.' },
    { name: 'Axis My Zone', card_network: 'VISA', card_number: '4514570059089170', expiry_date: '10/27', cvv: '043', credit_limit: 154000, statement_date: 13, due_date: 30, annual_fee: 0, cashback_rate: 2, reward_points_rate: 1, reward_point_value: 0.25, benefits: 'Daily spends, Swiggy, AJIO. 2% on daily spends, 15% on Swiggy.' },
    { name: 'Axis Neo', card_network: 'VISA', card_number: '4641180019364980', expiry_date: '05/27', cvv: '916', credit_limit: 154000, statement_date: 18, due_date: 5, annual_fee: 250, cashback_rate: 2.5, reward_points_rate: 1, reward_point_value: 0.25, benefits: 'Dining, movies, groceries. 2.5% on dining, movies, groceries.' },
    { name: 'RBL Platinum Delight', card_network: 'VISA', card_number: '4391230231957087', expiry_date: '07/31', cvv: '668', credit_limit: 224000, statement_date: 12, due_date: 2, annual_fee: 1000, reward_points_rate: 4, reward_point_value: 0.25, benefits: 'Weekdays and weekends shopping. 2X on weekdays, 4X on weekends. ₹150 fuel surcharge waiver.' },
    { name: 'RBL Bajaj Finserv', card_network: 'VISA', card_number: '4391230898849635', expiry_date: '02/30', cvv: '946', credit_limit: 160000, statement_date: 12, due_date: 2, annual_fee: 1000, benefits: 'Airport lounges, concierge service. National & International airport access.' },
    { name: 'HDFC Millenia', card_network: 'DISCOVER', card_number: '36113573131470', expiry_date: '06/28', cvv: '864', credit_limit: 10000, statement_date: 19, due_date: 7, annual_fee: 0, cashback_rate: 5, benefits: 'Amazon, BookMyShow, Cult.fit, Flipkart, Myntra, Sony LIV, Swiggy, Tata CLiQ, Uber, Zomato. 5% on select merchants.' },
    { name: 'HDFC Neu', card_network: 'RUPAY', card_number: '6529250009245556', expiry_date: '08/31', cvv: '644', credit_limit: 10000, statement_date: 2, due_date: 21, annual_fee: 499, cashback_rate: 5, benefits: 'Amazon, BookMyShow, Cult.fit, Flipkart, Myntra, Sony LIV, Swiggy, Tata CLiQ, Uber, Zomato. 5% on select merchants.' },
    { name: 'Indusind Platinum Aura Edge', card_network: 'VISA', card_number: '4412859670930976', expiry_date: '01/28', cvv: '750', credit_limit: 151000, statement_date: 13, due_date: 2, annual_fee: 0, reward_points_rate: 4, reward_point_value: 0.25, benefits: 'Amazon, Flipkart, Big Bazaar, Zee5, Apollo Pharmacy, Uber, Ola. Up to 4 RP on select categories.' },
    { name: 'Indusind Rupay', card_network: 'RUPAY', card_number: '3561420006556273', expiry_date: '09/29', cvv: '755', credit_limit: 100000, cashback_rate: 1, reward_points_rate: 2, reward_point_value: 0.6, benefits: 'Daily spends, UPI transactions. 2 RP on UPI, 1 RP on non-UPI.' },
    { name: 'ICICI Amazon', card_network: 'RUPAY', card_number: '4315812748438017', expiry_date: '03/32', cvv: '954', credit_limit: 460000, statement_date: 18, due_date: 5, annual_fee: 0, cashback_rate: 5, benefits: 'Amazon India, partner merchants. 5% on Amazon India for Prime members. RP never expire.' },
    { name: 'ICICI Adani One', card_network: 'VISA', card_number: '4786723001037026', expiry_date: '02/32', cvv: '241', credit_limit: 50000, statement_date: 5, due_date: 23, annual_fee: 0, reward_points_rate: 2, reward_point_value: 0.25, benefits: 'Adani ecosystem, travel. 2X on Adani spends. National & International airport access.' },
    { name: 'Pop YES Bank', card_network: 'JCB', card_number: '3561395211379572', expiry_date: '01/32', cvv: 'z95', credit_limit: 300000, statement_date: 16, due_date: 5, annual_fee: 0, reward_points_rate: 2, reward_point_value: 0.25, benefits: 'Amazon, Flipkart, Swiggy, Myntra, BookMyShow, Cleartrip. 2 POPcoins on UPI, 1 on online.' },
    { name: 'SuperMoney', card_network: 'RUPAY', card_number: '3561241060899296', expiry_date: '09/32', cvv: '553', credit_limit: 1800, statement_date: 1, due_date: 5, annual_fee: 0, cashback_rate: 1, benefits: 'UPI, Flipkart, Myntra. 1% UPI cashback.' },
    { name: 'BAJAJ Finserv EMI', card_network: null, card_number: '2030403213037910', expiry_date: '10/22', cvv: null, credit_limit: 115000, statement_date: 10, due_date: 2, annual_fee: 0, benefits: 'EMI card for Bajaj Finserv network.' },

    // Debit Cards (credit_limit = null for debit cards)
    { name: 'CBI', card_network: 'RUPAY', card_number: '6522810011012802', expiry_date: 'Z5/28', cvv: '739', credit_limit: null, annual_fee: 0, card_type: 'debit' },
    { name: 'SBI', card_network: 'RUPAY', card_number: '6522940910754350', expiry_date: 'Z1/28', cvv: '741', credit_limit: null, annual_fee: 0, card_type: 'debit' },
    { name: 'Jupiter', card_network: 'VISA', card_number: '4481980040929534', expiry_date: '11/27', cvv: 'zz1', credit_limit: null, annual_fee: 0, card_type: 'debit' },
    { name: 'Slice', card_network: 'RUPAY', card_number: '8180280001295685', expiry_date: '08/28', cvv: '458', credit_limit: null, annual_fee: 0, card_type: 'debit' },
    { name: 'Tide', card_network: 'RUPAY', card_number: '5086371014734595', expiry_date: '09/29', cvv: '310', credit_limit: null, annual_fee: 0, card_type: 'debit' },
    { name: 'SBM', card_network: 'VISA', card_number: '4645160105982636', expiry_date: '06/99', cvv: '728', credit_limit: null, annual_fee: 0, card_type: 'debit' },
    { name: 'DCB', card_network: 'VISA', card_number: '4346720003350178', expiry_date: '03/32', cvv: '923', credit_limit: null, annual_fee: 0, card_type: 'debit' },
];

async function updateCards() {
    console.log('Updating credit cards with full data...\n');

    let success = 0, failed = 0;

    for (const card of cardData) {
        // Find existing card by name
        const { data: existing } = await supabase
            .from('credit_cards')
            .select('id')
            .eq('name', card.name)
            .single();

        if (existing) {
            const { error } = await supabase
                .from('credit_cards')
                .update(card)
                .eq('id', existing.id);

            if (error) {
                console.log(`❌ ${card.name}: ${error.message}`);
                failed++;
            } else {
                console.log(`✅ ${card.name}: Updated`);
                success++;
            }
        } else {
            // Card doesn't exist, create it
            const { error } = await supabase
                .from('credit_cards')
                .insert(card);

            if (error) {
                console.log(`❌ ${card.name}: ${error.message}`);
                failed++;
            } else {
                console.log(`✅ ${card.name}: Created`);
                success++;
            }
        }
    }

    console.log(`\nDone! ✅ ${success} succeeded, ❌ ${failed} failed`);
}

updateCards().catch(console.error);

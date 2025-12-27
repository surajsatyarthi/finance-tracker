const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanAndAddGoals() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    // Delete all existing goals
    console.log('\nDeleting existing goals...');
    const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('user_id', userId);
    
    if (deleteError) {
        console.error('Error deleting goals:', deleteError);
        return;
    }
    
    console.log('✅ Deleted all existing goals\n');
    
    // Add fresh goals
    const goals = [
        {
            user_id: userId,
            name: 'Life Insurance',
            category: 'Insurance',
            target_amount: 500000,
            current_amount: 0,
            priority: 'high'
        },
        {
            user_id: userId,
            name: 'Medical Insurance',
            category: 'Insurance',
            target_amount: 200000,
            current_amount: 0,
            priority: 'high'
        },
        {
            user_id: userId,
            name: 'Emergency Fund',
            category: 'Savings',
            target_amount: 300000,
            current_amount: 0,
            priority: 'high'
        },
        {
            user_id: userId,
            name: '1 Year Fund',
            category: 'Savings',
            target_amount: 600000,
            current_amount: 0,
            priority: 'high'
        },
        {
            user_id: userId,
            name: 'Education Loan',
            category: 'Education',
            target_amount: 2000000,
            current_amount: 0,
            priority: 'high'
        },
        {
            user_id: userId,
            name: 'Gym Setup',
            category: 'Health',
            target_amount: 150000,
            current_amount: 0,
            priority: 'medium'
        },
        {
            user_id: userId,
            name: 'Massage Chair',
            category: 'Health',
            target_amount: 100000,
            current_amount: 0,
            priority: 'low'
        },
        {
            user_id: userId,
            name: 'Interior Work',
            category: 'Home',
            target_amount: 500000,
            current_amount: 0,
            priority: 'medium'
        },
        {
            user_id: userId,
            name: 'Travel Fund',
            category: 'Travel',
            target_amount: 400000,
            current_amount: 0,
            priority: 'medium'
        },
        {
            user_id: userId,
            name: 'Forex Card',
            category: 'Travel',
            target_amount: 50000,
            current_amount: 0,
            priority: 'low'
        },
        {
            user_id: userId,
            name: 'Mobile/Laptop Upgrade',
            category: 'Technology',
            target_amount: 200000,
            current_amount: 0,
            priority: 'medium'
        },
        {
            user_id: userId,
            name: 'Company Closure',
            category: 'Business',
            target_amount: 100000,
            current_amount: 0,
            priority: 'medium'
        },
        {
            user_id: userId,
            name: 'Tiwari Sir',
            category: 'Personal',
            target_amount: 50000,
            current_amount: 0,
            priority: 'medium'
        }
    ];
    
    console.log(`Adding ${goals.length} clean goals...\n`);
    
    const { data, error } = await supabase
        .from('goals')
        .insert(goals)
        .select();
    
    if (error) {
        console.error('Error adding goals:', error);
        return;
    }
    
    console.log(`✅ Successfully added ${data.length} goals!\n`);
    
    // Show summary
    const total = goals.reduce((sum, g) => sum + g.target_amount, 0);
    console.log('Goals in database:');
    data.forEach((goal, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${goal.name.padEnd(25)} ₹${goal.target_amount.toLocaleString('en-IN').padStart(10)} (${goal.priority})`);
    });
    console.log(`\nTotal target amount: ₹${total.toLocaleString('en-IN')}\n`);
}

cleanAndAddGoals();

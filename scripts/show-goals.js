const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function showGoals() {
    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';
    
    const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('name');
    
    if (error) {
        console.error('Error fetching goals:', error);
        return;
    }
    
    console.log(`\n${goals.length} goals found in database:\n`);
    
    // Calculate totals
    const totalTarget = goals.reduce((sum, g) => sum + parseFloat(g.target_amount || 0), 0);
    const totalCurrent = goals.reduce((sum, g) => sum + parseFloat(g.current_amount || 0), 0);
    
    // Display table
    console.log('Name                          Category        Target          Current         Remaining       Priority    Status');
    console.log('─'.repeat(135));
    
    goals.forEach((goal, index) => {
        const target = parseFloat(goal.target_amount || 0);
        const current = parseFloat(goal.current_amount || 0);
        const remaining = target - current;
        const progress = target > 0 ? ((current / target) * 100).toFixed(1) : '0.0';
        
        console.log(
            `${(index + 1).toString().padStart(2)}. ${goal.name.padEnd(25)} ` +
            `${(goal.category || 'N/A').padEnd(15)} ` +
            `₹${target.toLocaleString('en-IN').padStart(12)} ` +
            `₹${current.toLocaleString('en-IN').padStart(12)} ` +
            `₹${remaining.toLocaleString('en-IN').padStart(12)} ` +
            `${(goal.priority || 'N/A').padEnd(11)} ` +
            `${progress}%`
        );
    });
    
    console.log('─'.repeat(135));
    console.log(
        `TOTAL:${' '.repeat(28)}` +
        `₹${totalTarget.toLocaleString('en-IN').padStart(12)} ` +
        `₹${totalCurrent.toLocaleString('en-IN').padStart(12)} ` +
        `₹${(totalTarget - totalCurrent).toLocaleString('en-IN').padStart(12)}`
    );
    console.log('\n');
}

showGoals();

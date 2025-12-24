const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    'https://zzwouesueadoqrlmteyh.supabase.co',
    'sb_secret_TMpPmiUzgw8SzAsM32-goQ_Z-71SMMs'
)

async function checkLoanData() {
    const { data, error } = await supabase
        .from('loans')
        .select('name, principal_amount, current_balance')
        .limit(5)

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Loan Data:')
    console.log(JSON.stringify(data, null, 2))

    if (data && data.length > 0) {
        const total = data.reduce((sum, loan) => sum + loan.current_balance, 0)
        console.log('\nTotal Outstanding:', total)
    }
}

checkLoanData()

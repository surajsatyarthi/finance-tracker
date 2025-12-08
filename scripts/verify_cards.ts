
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkCards() {
    const { data, error } = await supabase
        .from('credit_cards')
        .select('name, credit_limit, statement_date, due_date, last_four_digits, annual_fee')
        .eq('is_active', true)

    if (error) {
        console.error('Error:', error)
    } else {
        // Check if we have data and if fields are populated
        console.log(`Found ${data.length} active cards:`)
        console.table(data)

        const missingInfo = data.some(c => !c.credit_limit || !c.statement_date || !c.due_date)
        if (missingInfo) {
            console.log('WARNING: Some cards have missing limits or dates.')
        } else {
            console.log('SUCCESS: All cards have limits and dates populated.')
        }
    }
}

checkCards()

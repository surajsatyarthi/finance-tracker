import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function updateAxisCards() {
    const client = new Client({ connectionString })
    try {
        await client.connect()
        console.log('✅ Connected')

        const userId = await client.query(`SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com'`)
        const user_id = userId.rows[0]?.id

        // Update Axis Neo
        await client.query(`
            UPDATE credit_cards 
            SET current_balance = 967.55, statement_date = 4, due_date = 4
            WHERE user_id = $1 AND name LIKE '%Axis%Neo%'
        `, [user_id])
        console.log('✅ Axis Neo: ₹967.55')

        // Update Axis My Zone  
        await client.query(`
            UPDATE credit_cards 
            SET current_balance = 0
            WHERE user_id = $1 AND name LIKE '%Axis%My%Zone%'
        `, [user_id])
        console.log('✅ Axis My Zone: ₹0')

        // Update Axis Rewards
        await client.query(`
            UPDATE credit_cards 
            SET current_balance = 0
            WHERE user_id = $1 AND name LIKE '%Axis%Rewards%'
        `, [user_id])
        console.log('✅ Axis Rewards: ₹0')

        console.log('\n💰 Total from Axis cards: ₹967.55')

    } finally {
        await client.end()
    }
}

updateAxisCards()

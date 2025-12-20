import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function updateSBICards() {
    const client = new Client({ connectionString })
    try {
        await client.connect()
        console.log('✅ Connected')

        const userId = await client.query(`SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com'`)
        const user_id = userId.rows[0]?.id

        // Update SBI BPCL
        await client.query(`
            UPDATE credit_cards 
            SET current_balance = 0, credit_limit = 34000 
            WHERE user_id = $1 AND name LIKE '%SBI%BPCL%'
        `, [user_id])
        console.log('✅ SBI BPCL: ₹0')

        // Update SBI Simplysave  
        await client.query(`
            UPDATE credit_cards 
            SET current_balance = 903, credit_limit = 16000 
            WHERE user_id = $1 AND name LIKE '%Simply%save%'
        `, [user_id])
        console.log('✅ SBI Simplysave: ₹903')

        console.log('\\n💰 Total: ₹903')

    } finally {
        await client.end()
    }
}

updateSBICards()

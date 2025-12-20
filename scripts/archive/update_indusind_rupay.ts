import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function updateIndusindRupay() {
    const client = new Client({ connectionString })
    try {
        await client.connect()
        console.log('✅ Connected to database.')

        const userId = await client.query(`SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com'`)
        const user_id = userId.rows[0]?.id

        // Get Indusind Rupay card
        const { rows: [card] } = await client.query(`
            SELECT id, name, current_balance, credit_limit
            FROM credit_cards
            WHERE user_id = $1 AND name LIKE '%Indusind%Rupay%'
        `, [user_id])

        if (!card) {
            console.error('❌ Indusind Rupay card not found!')
            process.exit(1)
        }

        console.log(`\n📊 Current Status:`)
        console.log(`   Card: ${card.name}`)
        console.log(`   Old Balance: ₹${Number(card.current_balance).toLocaleString('en-IN')}`)
        console.log(`   New Balance: ₹770`)
        console.log(`   Credit Limit: ₹${Number(card.credit_limit).toLocaleString('en-IN')}`)

        // Update balance
        await client.query(`
            UPDATE credit_cards
            SET current_balance = 770
            WHERE id = $1
        `, [card.id])

        console.log(`\n✅ Successfully updated Indusind Rupay card balance to ₹770!`)
        console.log(`   Available Credit: ₹99,230`)

    } catch (e) {
        console.error('❌ Update failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

updateIndusindRupay()

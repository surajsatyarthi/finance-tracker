import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function removeCard() {
    const client = new Client({ connectionString })

    try {
        await client.connect()
        console.log('✅ Connected to database.')

        // First, check if the card exists
        const checkResult = await client.query(`
            SELECT id, name, bank, credit_limit, current_balance
            FROM credit_cards
            WHERE user_id = (SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com')
            AND LOWER(name) LIKE '%paytm%'
        `)

        if (checkResult.rows.length === 0) {
            console.log('⚠️  SBI Paytm card not found in database.')
            return
        }

        const card = checkResult.rows[0]
        console.log('\n📋 Found card to remove:')
        console.log(`   Name: ${card.name}`)
        console.log(`   Bank: ${card.bank || 'N/A'}`)
        console.log(`   Credit Limit: ₹${Number(card.credit_limit || 0).toLocaleString('en-IN')}`)
        console.log(`   Current Balance: ₹${Number(card.current_balance || 0).toLocaleString('en-IN')}`)

        // Delete the card
        await client.query(`
            DELETE FROM credit_cards
            WHERE id = $1
        `, [card.id])

        console.log('\n✅ Successfully removed SBI Paytm card from the app!')

    } catch (e) {
        console.error('❌ Failed to remove card:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

removeCard()

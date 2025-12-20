import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function updateCards() {
    const client = new Client({ connectionString })

    try {
        await client.connect()
        console.log('✅ Connected to database.')

        const userId = await client.query(
            `SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com'`
        )
        const user_id = userId.rows[0]?.id

        if (!user_id) {
            console.error('❌ User not found!')
            process.exit(1)
        }

        // Step 1: Remove RBL Bajaj Finserve card
        console.log('\n🗑️  Removing RBL Bajaj Finserve card...')
        const deleteResult = await client.query(`
            DELETE FROM credit_cards
            WHERE user_id = $1
            AND name = 'RBL Bajaj Finserve'
            RETURNING name, credit_limit
        `, [user_id])

        if (deleteResult.rows.length > 0) {
            const card = deleteResult.rows[0]
            console.log(`   ✅ Removed: ${card.name} (Limit: ₹${Number(card.credit_limit).toLocaleString('en-IN')})`)
        } else {
            console.log('   ⚠️  RBL Bajaj Finserve card not found')
        }

        // Step 2: Re-add SBI Paytm card
        console.log('\n➕ Adding SBI Paytm card...')
        const insertResult = await client.query(`
            INSERT INTO credit_cards (
                user_id, name, bank, card_type, credit_limit, current_balance,
                statement_date, due_date, is_active
            ) VALUES (
                $1, 'SBI Paytm', 'SBI', 'VISA', 150000, 0,
                5, 20, true
            )
            RETURNING name, credit_limit
        `, [user_id])

        const newCard = insertResult.rows[0]
        console.log(`   ✅ Added: ${newCard.name} (Limit: ₹${Number(newCard.credit_limit).toLocaleString('en-IN')})`)

        console.log('\n✨ Credit card updates completed successfully!')

    } catch (e) {
        console.error('❌ Failed to update cards:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

updateCards()

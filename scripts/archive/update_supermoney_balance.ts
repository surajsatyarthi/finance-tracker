import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function updateSuperMoney() {
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

        // Get SuperMoney card details
        const cardResult = await client.query(`
            SELECT id, statement_date, due_date, current_balance
            FROM credit_cards
            WHERE user_id = $1 AND name = 'SuperMoney'
        `, [user_id])

        if (cardResult.rows.length === 0) {
            console.error('❌ SuperMoney card not found!')
            process.exit(1)
        }

        const card = cardResult.rows[0]
        const newBalance = 224

        console.log('\n📊 Current Status:')
        console.log(`   Old Balance: ₹${Number(card.current_balance).toLocaleString('en-IN')}`)
        console.log(`   New Balance: ₹${newBalance.toLocaleString('en-IN')}`)
        console.log(`   Statement Date: ${card.statement_date}th of each month`)
        console.log(`   Due Date: ${card.due_date}th of each month`)

        // Update the card balance
        await client.query(`
            UPDATE credit_cards
            SET current_balance = $1
            WHERE id = $2
        `, [newBalance, card.id])

        console.log('\n✅ Updated SuperMoney card balance to ₹224')

        // Calculate next due date
        const today = new Date()
        let nextDueDate = new Date(today.getFullYear(), today.getMonth(), card.due_date)

        // If due date has passed this month, use next month
        if (today.getDate() > card.due_date) {
            nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, card.due_date)
        }

        console.log(`\n📅 Next Due Date: ${nextDueDate.toLocaleDateString('en-IN')}`)
        console.log(`   Amount Due: ₹${newBalance.toLocaleString('en-IN')}`)

        console.log('\n✨ SuperMoney card updated successfully!')
        console.log('\n💡 Note: When you add expenses to this card through the app,')
        console.log('   they will automatically be added to the current balance.')
        console.log('   The dashboard will show this as a liability.')

    } catch (e) {
        console.error('❌ Failed to update SuperMoney card:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

updateSuperMoney()

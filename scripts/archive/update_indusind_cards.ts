import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function updateIndusindCards() {
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

        console.log('\n📊 UPDATING INDUSIND CARDS:')
        console.log('━'.repeat(70))

        // 1. Check if Platinum Aura Edge exists
        const { rows: auraCards } = await client.query(`
            SELECT id, name, current_balance, credit_limit
            FROM credit_cards
            WHERE user_id = $1 AND name LIKE '%Platinum%Aura%'
        `, [user_id])

        if (auraCards.length > 0) {
            // Update existing
            console.log(`\n1️⃣ Updating Indusind Platinum Aura Edge:`)
            console.log(`   Old Balance: ₹${Number(auraCards[0].current_balance).toLocaleString('en-IN')}`)
            console.log(`   New Balance: ₹1,583`)

            await client.query(`
                UPDATE credit_cards
                SET current_balance = 1583
                WHERE id = $1
            `, [auraCards[0].id])

            console.log('   ✅ Card balance updated')
        } else {
            // Create new card
            console.log(`\n1️⃣ Creating Indusind Platinum Aura Edge card:`)

            await client.query(`
                INSERT INTO credit_cards (
                    user_id, name, bank, card_type, credit_limit, current_balance,
                    statement_date, due_date, is_active
                ) VALUES (
                    $1, 'Indusind Platinum Aura Edge', 'IndusInd Bank', 'VISA',
                    151000, 1583, 12, 1, true
                )
            `, [user_id])

            console.log('   ✅ New card created')
            console.log('   Credit Limit: ₹1,51,000')
            console.log('   Current Balance: ₹1,583')
            console.log('   Statement Date: 12th')
            console.log('   Due Date: 1st of next month')
        }

        // 2. Get Indusind Rupay card for future payable
        const { rows: [rupayCard] } = await client.query(`
            SELECT id, name, current_balance, statement_date, due_date
            FROM credit_cards
            WHERE user_id = $1 AND name LIKE '%Indusind%Rupay%'
        `, [user_id])

        if (rupayCard && Number(rupayCard.current_balance) > 0) {
            console.log(`\n2️⃣ Creating future payable for Indusind Rupay:`)
            console.log(`   Card: ${rupayCard.name}`)
            console.log(`   Unbilled Amount: ₹${Number(rupayCard.current_balance).toLocaleString('en-IN')}`)
            console.log(`   Statement Date: ${rupayCard.statement_date}th`)
            console.log(`   Due Date: ${rupayCard.due_date}th`)

            // Calculate next due date (January 1, 2026 based on statement)
            const nextDueDate = '2026-01-01'

            // Check if payable already exists
            const { rows: existingPayable } = await client.query(`
                SELECT id FROM future_payables
                WHERE user_id = $1 
                AND credit_card_id = $2
                AND due_date = $3
            `, [user_id, rupayCard.id, nextDueDate])

            if (existingPayable.length === 0) {
                await client.query(`
                    INSERT INTO future_payables (
                        user_id, credit_card_id, amount, due_date, 
                        description, is_paid
                    ) VALUES (
                        $1, $2, $3, $4, $5, false
                    )
                `, [
                    user_id,
                    rupayCard.id,
                    rupayCard.current_balance,
                    nextDueDate,
                    'Indusind Rupay - Unbilled Outstanding'
                ])

                console.log(`   ✅ Future payable created for ${nextDueDate}`)
            } else {
                console.log(`   ℹ️  Payable already exists for ${nextDueDate}`)
            }
        }

        console.log('\n━'.repeat(70))
        console.log('\n✅ ALL UPDATES COMPLETED!')
        console.log('\n📝 Summary:')
        console.log('   • Indusind Platinum Aura Edge: ₹1,583')
        console.log('   • Indusind Rupay: ₹770 (with future payable on Jan 1, 2026)')

    } catch (e) {
        console.error('❌ Update failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

updateIndusindCards()

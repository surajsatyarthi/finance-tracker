import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function updateICICIAdani() {
    const client = new Client({ connectionString })
    try {
        await client.connect()
        console.log('✅ Connected to database')

        const userId = await client.query(`SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com'`)
        const user_id = userId.rows[0]?.id

        console.log('\n📊 ICICI Adani One Credit Card Update:')
        console.log('━'.repeat(70))

        // 1. Update/Create ICICI Adani card
        const { rows: [adaniCard] } = await client.query(`
            SELECT id FROM credit_cards 
            WHERE user_id = $1 AND name LIKE '%Adani%'
        `, [user_id])

        let cardId: string

        if (adaniCard) {
            await client.query(`
                UPDATE credit_cards 
                SET current_balance = 886.63, credit_limit = 50000, statement_date = 5, due_date = 23
                WHERE id = $1
            `, [adaniCard.id])
            cardId = adaniCard.id
            console.log('✅ ICICI Adani One card updated: ₹886.63')
        } else {
            const { rows: [newCard] } = await client.query(`
                INSERT INTO credit_cards (
                    user_id, name, bank, card_type, credit_limit, current_balance,
                    statement_date, due_date, is_active
                ) VALUES (
                    $1, 'ICICI Adani One', 'ICICI Bank', 'VISA', 50000, 886.63, 5, 23, true
                )
                RETURNING id
            `, [user_id])
            cardId = newCard.id
            console.log('✅ ICICI Adani One card created: ₹886.63')
        }

        // 2. Create EMI Loan (XAI LLC Purchase)
        console.log('\n2️⃣ Creating EMI - XAI LLC Purchase:')
        const { rows: [loan] } = await client.query(`
            INSERT INTO loans (
                user_id, name, type, principal_amount, current_balance,
                interest_rate, emi_amount, total_emis, emis_paid,
                start_date, next_emi_date, linked_credit_card_id, is_active
            ) VALUES (
                $1, 'ICICI Adani EMI', 'credit_card', 6500.00, 4767.36,
                0, 595.92, 12, 4, '2025-08-12', '2026-01-05', $2, true
            )
            RETURNING id, name
        `, [user_id, cardId])
        console.log(`   ✅ Created: ${loan.name}`)
        console.log('   Principal: ₹6,500.00')
        console.log('   Remaining: ₹4,767.36 (8 EMIs)')
        console.log('   Monthly: ₹595.92')
        console.log('   End Date: July 2026')

        console.log('\n━'.repeat(70))
        console.log('\n✅ ALL UPDATES COMPLETED!')
        console.log('\n📝 Summary:')
        console.log('   • Card Balance: ₹886.63')
        console.log('   • EMI Outstanding: ₹4,767.36 (8 months)')
        console.log('   • Monthly EMI: ₹595.92')

    } catch (e) {
        console.error('❌ Update failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

updateICICIAdani()

import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function updateICICIAmazon() {
    const client = new Client({ connectionString })
    try {
        await client.connect()
        console.log('✅ Connected to database')

        const userId = await client.query(`SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com'`)
        const user_id = userId.rows[0]?.id

        console.log('\n📊 ICICI Amazon Pay Credit Card Update:')
        console.log('━'.repeat(70))

        // 1. Update/Create ICICI Amazon card
        const { rows: [icicCard] } = await client.query(`
            SELECT id FROM credit_cards 
            WHERE user_id = $1 AND name LIKE '%ICICI%Amazon%'
        `, [user_id])

        let cardId: string

        if (icicCard) {
            await client.query(`
                UPDATE credit_cards 
                SET current_balance = 4797.34, credit_limit = 38000, statement_date = 18, due_date = 5
                WHERE id = $1
            `, [icicCard.id])
            cardId = icicCard.id
            console.log('✅ ICICI Amazon card updated: ₹4,797.34')
        } else {
            const { rows: [newCard] } = await client.query(`
                INSERT INTO credit_cards (
                    user_id, name, bank, card_type, credit_limit, current_balance,
                    statement_date, due_date, is_active
                ) VALUES (
                    $1, 'ICICI Amazon', 'ICICI Bank', 'VISA', 38000, 4797.34, 18, 5, true
                )
                RETURNING id
            `, [user_id])
            cardId = newCard.id
            console.log('✅ ICICI Amazon card created: ₹4,797.34')
        }

        // 2. Create EMI Loan #1 (Amazon Purchase)
        console.log('\n2️⃣ Creating EMI #1 - Amazon Purchase:')
        const { rows: [loan1] } = await client.query(`
            INSERT INTO loans (
                user_id, name, type, principal_amount, current_balance,
                interest_rate, emi_amount, total_emis, emis_paid,
                start_date, next_emi_date, linked_credit_card_id, is_active
            ) VALUES (
                $1, 'ICICI Amazon EMI #1', 'credit_card', 8155.78, 3993.00,
                0, 399.29, 24, 14, '2024-11-04', '2026-01-18', $2, true
            )
            RETURNING id, name
        `, [user_id, cardId])
        console.log(`   ✅ Created: ${loan1.name}`)
        console.log('   Principal: ₹8,155.78')
        console.log('   Remaining: ₹3,993.00 (10 EMIs)')
        console.log('   Monthly: ₹399.29')
        console.log('   End Date: Oct 2026')

        // 3. Create EMI Loan #2 (Personal Loan on Card)
        console.log('\n3️⃣ Creating EMI #2 - Personal Loan on Card:')
        const { rows: [loan2] } = await client.query(`
            INSERT INTO loans (
                user_id, name, type, principal_amount, current_balance,
                interest_rate, emi_amount, total_emis, emis_paid,
                start_date, next_emi_date, linked_credit_card_id, is_active
            ) VALUES (
                $1, 'ICICI Amazon EMI #2', 'credit_card', 26448.94, 22447.47,
                0, 1320.44, 24, 7, '2025-06-03', '2026-01-18', $2, true
            )
            RETURNING id, name
        `, [user_id, cardId])
        console.log(`   ✅ Created: ${loan2.name}`)
        console.log('   Principal: ₹26,448.94')
        console.log('   Remaining: ₹22,447.47 (17 EMIs)')
        console.log('   Monthly: ₹1,320.44')
        console.log('   End Date: May 2027')

        console.log('\n━'.repeat(70))
        console.log('\n✅ ALL UPDATES COMPLETED!')
        console.log('\n📝 Summary:')
        console.log('   • Card Balance: ₹4,797.34')
        console.log('   • EMI #1: ₹3,993.00 (10 months)')
        console.log('   • EMI #2: ₹22,447.47 (17 months)')
        console.log('   • Total EMI Liability: ₹26,440.47')
        console.log('   • Monthly EMI: ₹1,719.73 (₹399.29 + ₹1,320.44)')

    } catch (e) {
        console.error('❌ Update failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

updateICICIAmazon()

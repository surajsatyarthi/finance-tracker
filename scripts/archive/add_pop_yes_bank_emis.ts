import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function addPopYesBankDetails() {
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

        // Get Pop YES Bank card ID
        const { rows: [card] } = await client.query(`
            SELECT id, name, current_balance
            FROM credit_cards
            WHERE user_id = $1 AND name = 'Pop YES Bank'
        `, [user_id])

        if (!card) {
            console.error('❌ Pop YES Bank card not found!')
            process.exit(1)
        }

        console.log('\n📊 STATEMENT ANALYSIS (16/12/2025):')
        console.log('━'.repeat(70))

        // Statement Summary
        console.log('\n💳 Card: Pop YES Bank (JCB)')
        console.log('   Card Number: 3561XXXXXXXX9572')
        console.log('   Statement Period: 17/11/2025 To 16/12/2025')
        console.log('   Credit Limit: ₹3,00,000')
        console.log('   Available Limit: ₹2,84,377.04')
        console.log('   Total Amount Due: ₹5,079.12')
        console.log('   Minimum Amount Due: ₹1,553.71')
        console.log('   Payment Due Date: 05/01/2026')

        // EMI Details from Statement
        console.log('\n📋 ACTIVE EMIs:')
        console.log('\n1️⃣ EMI #1 (007/012):')
        console.log('   - EMI Number: 7th out of 12')
        console.log('   - Principal: ₹278.41')
        console.log('   - Interest: ₹26.00')
        console.log('   - Monthly EMI: ₹304.41 (approx ₹309 from screenshot)')
        console.log('   - EMIs Paid: 6')
        console.log('   - EMIs Remaining: 6')
        console.log('   - Original Amount: ₹3,320 (from screenshot)')
        console.log('   - Current Balance: ₹1,670.46 (6 EMIs remaining × ₹278.41)')
        console.log('   - Last EMI: June 2026')

        console.log('\n2️⃣ EMI #2 (002/012):')
        console.log('   - EMI Number: 2nd out of 12')
        console.log('   - Principal: ₹848.45')
        console.log('   - Interest: ₹124.00')
        console.log('   - Monthly EMI: ₹972.45 (approx ₹996 from screenshot)')
        console.log('   - EMIs Paid: 1')
        console.log('   - EMIs Remaining: 11')
        console.log('   - Original Amount: ₹10,775 (from screenshot)')
        console.log('   - Current Balance: ₹9,332.95 (11 EMIs remaining × ₹848.45)')
        console.log('   - Last EMI: November 2026')

        // Update card balance
        console.log('\n\n🔄 UPDATING DATABASE...')

        console.log('\n1. Updating Pop YES Bank current balance to ₹5,079.12')
        await client.query(`
            UPDATE credit_cards
            SET current_balance = 5079.12
            WHERE id = $1
        `, [card.id])
        console.log('   ✅ Card balance updated')

        // Create EMI Loan #1
        console.log('\n2. Creating EMI Loan #1 (6 months remaining)')
        const { rows: [loan1] } = await client.query(`
            INSERT INTO loans (
                user_id, name, type, principal_amount, current_balance,
                interest_rate, emi_amount, total_emis, emis_paid,
                start_date, next_emi_date, linked_credit_card_id, is_active
            ) VALUES (
                $1, 'Pop YES Bank EMI #1', 'credit_card', 3320.00, 1670.46,
                10.0, 304.41, 12, 6,
                '2025-06-16', '2026-01-16', $2, true
            )
            RETURNING id, name
        `, [user_id, card.id])
        console.log(`   ✅ Created loan: ${loan1.name}`)

        // Create EMI Loan #2
        console.log('\n3. Creating EMI Loan #2 (11 months remaining)')
        const { rows: [loan2] } = await client.query(`
            INSERT INTO loans (
                user_id, name, type, principal_amount, current_balance,
                interest_rate, emi_amount, total_emis, emis_paid,
                start_date, next_emi_date, linked_credit_card_id, is_active
            ) VALUES (
                $1, 'Pop YES Bank EMI #2', 'credit_card', 10775.00, 9332.95,
                15.0, 972.45, 12, 1,
                '2025-11-16', '2026-01-16', $2, true
            )
            RETURNING id, name
        `, [user_id, card.id])
        console.log(`   ✅ Created loan: ${loan2.name}`)

        console.log('\n━'.repeat(70))
        console.log('\n✅ ALL UPDATES COMPLETED SUCCESSFULLY!')
        console.log('\n📝 Summary:')
        console.log('   • Card balance updated to ₹5,079.12')
        console.log('   • EMI #1 created: ₹1,670.46 remaining (6 months)')
        console.log('   • EMI #2 created: ₹9,332.95 remaining (11 months)')
        console.log('   • Total EMI liability: ₹11,003.41')
        console.log('\n💡 Next EMI due: January 16, 2026 (₹304.41 + ₹972.45 = ₹1,276.86)')

    } catch (e) {
        console.error('❌ Failed to add details:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

addPopYesBankDetails()

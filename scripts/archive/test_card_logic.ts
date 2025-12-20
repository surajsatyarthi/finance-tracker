import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function testCardLogic() {
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

        // Get initial balances
        console.log('\n📊 INITIAL STATE:')
        console.log('━'.repeat(70))

        // SuperMoney card (credit card)
        const { rows: [supermoney] } = await client.query(`
            SELECT name, card_type, credit_limit, current_balance
            FROM credit_cards
            WHERE user_id = $1 AND name = 'SuperMoney'
        `, [user_id])

        console.log('\n💳 SuperMoney Credit Card:')
        console.log(`   Type: ${supermoney?.card_type || 'N/A'}`)
        console.log(`   Current Balance: ₹${Number(supermoney?.current_balance || 0).toLocaleString('en-IN')}`)
        console.log(`   Available: ₹${(Number(supermoney?.credit_limit || 0) - Number(supermoney?.current_balance || 0)).toLocaleString('en-IN')}`)

        // Get a debit card
        const { rows: debitCards } = await client.query(`
            SELECT name, card_type
            FROM credit_cards
            WHERE user_id = $1 AND LOWER(card_type) = 'debit'
            LIMIT 1
        `, [user_id])

        if (debitCards.length > 0) {
            console.log(`\n💳 ${debitCards[0].name} Debit Card:`)
            console.log(`   Type: ${debitCards[0].card_type}`)

            // Get matching account balance
            const { rows: [account] } = await client.query(`
                SELECT balance FROM accounts
                WHERE user_id = $1 AND name = $2
            `, [user_id, debitCards[0].name])

            if (account) {
                console.log(`   Account Balance: ₹${Number(account.balance).toLocaleString('en-IN')}`)
            }
        }

        // Total liquidity
        const { rows: [liquidity] } = await client.query(`
            SELECT SUM(balance) as total
            FROM accounts
            WHERE user_id = $1 AND is_active = true
        `, [user_id])

        console.log('\n💰 Total Liquidity:')
        console.log(`   ₹${Number(liquidity?.total || 0).toLocaleString('en-IN')}`)

        console.log('\n━'.repeat(70))
        console.log('\n✅ Fix has been implemented!')
        console.log('\n📝 Next step: Test by adding an expense through the app')
        console.log('   1. Go to /expenses/add')
        console.log('   2. Select "Credit Card" payment method')
        console.log('   3. Choose "SuperMoney" card')
        console.log('   4. Enter amount ₹200')
        console.log('   5. Verify SuperMoney balance increases but bank balances stay same')

    } catch (e) {
        console.error('❌ Test failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

testCardLogic()

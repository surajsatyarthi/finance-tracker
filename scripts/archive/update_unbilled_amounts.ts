import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

async function updateUnbilledAmounts() {
    const client = new Client({ connectionString })
    try {
        await client.connect()
        console.log('✅ Connected to database')

        const userId = await client.query(`SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com'`)
        const user_id = userId.rows[0]?.id

        console.log('\n📊 Updating Cards with Unbilled Amounts:')
        console.log('━'.repeat(70))

        // 1. Update ICICI Adani One
        console.log('\n1️⃣ ICICI Adani One:')
        console.log('   Billed (Dec 5 statement): ₹886.63')
        console.log('   Unbilled (since Dec 5): ₹4,266.29')
        console.log('   New Total: ₹5,152.92')

        await client.query(`
            UPDATE credit_cards 
            SET current_balance = 5152.92
            WHERE user_id = $1 AND name LIKE '%Adani%'
        `, [user_id])
        console.log('   ✅ Updated')

        // 2. Update SBI Simplysave
        console.log('\n2️⃣ SBI Simplysave:')
        console.log('   Previous: ₹903.00')
        console.log('   Unbilled (since Dec 8): ₹1,274.78')
        console.log('   New Total: ₹2,177.78')

        await client.query(`
            UPDATE credit_cards 
            SET current_balance = 2177.78
            WHERE user_id = $1 AND name LIKE '%Simply%save%'
        `, [user_id])
        console.log('   ✅ Updated')

        console.log('\n━'.repeat(70))
        console.log('\n✅ ALL UPDATES COMPLETED!')
        console.log('\n📝 Impact:')
        console.log('   Previous Total: ₹24,882.10')
        console.log('   Added Unbilled: ₹5,541.07')
        console.log('   New Total: ₹30,423.17')
        console.log('\n💡 Your app now shows the COMPLETE financial picture!')

    } catch (e) {
        console.error('❌ Update failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

updateUnbilledAmounts()

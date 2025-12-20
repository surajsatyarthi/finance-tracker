import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { Client } from 'pg'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const dbUrl = process.env.DATABASE_URL
const directUrl = process.env.DIRECT_URL

if (!dbUrl && !directUrl) {
    console.error('DATABASE_URL not found in .env.local.')
    process.exit(1)
}

const connectionString = directUrl || dbUrl

async function verify() {
    const client = new Client({
        connectionString,
    })

    try {
        await client.connect()
        console.log('✅ Connected to database.')

        // Verify the Slice Business account was added
        const result = await client.query(`
            SELECT name, type, balance, currency, is_active, created_at
            FROM accounts 
            WHERE user_id = (SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com')
            ORDER BY created_at DESC
        `)

        console.log('\n📊 All Accounts:')
        console.log('━'.repeat(80))

        let total = 0
        result.rows.forEach((row, index) => {
            const isNew = row.name === 'Slice Business'
            const marker = isNew ? '🆕' : '  '
            console.log(`${marker} ${(index + 1).toString().padStart(2)}. ${row.name.padEnd(20)} | ${row.type.padEnd(10)} | ₹${Number(row.balance).toLocaleString('en-IN').padStart(12)} | ${row.currency}`)
            total += Number(row.balance)
        })

        console.log('━'.repeat(80))
        console.log(`   ${'TOTAL LIQUIDITY'.padEnd(32)} | ₹${total.toLocaleString('en-IN').padStart(12)}`)
        console.log('━'.repeat(80))

        // Highlight the new account
        const sliceBusiness = result.rows.find(row => row.name === 'Slice Business')
        if (sliceBusiness) {
            console.log('\n✨ NEW ACCOUNT CONFIRMED:')
            console.log(`   Name: ${sliceBusiness.name}`)
            console.log(`   Type: ${sliceBusiness.type}`)
            console.log(`   Balance: ₹${Number(sliceBusiness.balance).toLocaleString('en-IN')}`)
            console.log(`   Status: ${sliceBusiness.is_active ? 'Active' : 'Inactive'}`)
            console.log(`   Created: ${new Date(sliceBusiness.created_at).toLocaleString('en-IN')}`)
        } else {
            console.log('\n⚠️  Slice Business account not found in database!')
        }

    } catch (e) {
        console.error('❌ Verification failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

verify()

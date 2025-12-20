import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { Client } from 'pg'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const dbUrl = process.env.DATABASE_URL
const directUrl = process.env.DIRECT_URL

if (!dbUrl && !directUrl) {
    console.error('DATABASE_URL not found in .env.local. Cannot run migration.')
    process.exit(1)
}

const connectionString = directUrl || dbUrl

async function run() {
    const client = new Client({
        connectionString,
    })

    try {
        await client.connect()
        console.log('✅ Connected to database.')

        const sql = fs.readFileSync(
            path.resolve(__dirname, '../supabase/migrations/20251220_add_slice_business_account.sql'),
            'utf8'
        )

        console.log('🚀 Running migration to add Slice Business account...')
        await client.query(sql)
        console.log('✅ Migration successful! Slice Business account added with ₹1,000 balance.')
    } catch (e) {
        console.error('❌ Migration failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

run()

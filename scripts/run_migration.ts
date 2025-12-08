
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Using Service Role Key to run SQL via RPC if possible, or just raw fetch if we had a direct connection.
// Wait, Supabase JS client doesn't support generic SQL execution easily without a Postgres client or a custom RPC function.
// However, most Next.js users don't have 'pg' installed by default.
// I see 'pg' is NOT in package.json.
// I will try to use the 'postgres' library (lighter) or just 'pg' by installing it.
// The user has 'ts-node'.

// Plan: Install 'pg' and '@types/pg'.
// But I need the connection string.
// Usually DATABASE_URL is in .env or .env.local.
// I will assume DATABASE_URL exists or construct it?
// Construction is hard (password).
// Let's check .env.local via a script logic? I can't read it.
// Wait, I can read it via 'dotenv'.

// Logic: Read .env.local, find DATABASE_URL, connect via pg, run SQL.

const dbUrl = process.env.DATABASE_URL
const directUrl = process.env.DIRECT_URL // For Prisma, often exists.

if (!dbUrl && !directUrl) {
    console.error('DATABASE_URL not found in .env.local. Cannot run migration.')
    process.exit(1)
}

const connectionString = directUrl || dbUrl

import { Client } from 'pg'

async function run() {
    const client = new Client({
        connectionString,
    })

    try {
        await client.connect()
        console.log('Connected to database.')

        const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/008_link_loans_to_cards.sql'), 'utf8')

        console.log('Running migration...')
        await client.query(sql)
        console.log('Migration successful!')
    } catch (e) {
        console.error('Migration failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}

run()

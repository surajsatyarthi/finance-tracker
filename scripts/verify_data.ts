
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

async function verify() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        // Check Users
        const resUsers = await client.query('SELECT id, email FROM users');
        console.log('Users:', resUsers.rows);

        // Check Loans
        const resLoans = await client.query('SELECT id, name, user_id, current_balance, is_active FROM loans');
        console.log('Loans:', resLoans.rows);

        // Check Transactions for this month
        const resTrans = await client.query(`
      SELECT count(*) FROM transactions 
      WHERE date >= '2025-12-01' AND date <= '2025-12-31'
    `);
        console.log('Transactions (Dec 2025):', resTrans.rows[0]);

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

verify();

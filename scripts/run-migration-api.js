require('dotenv').config({ path: '.env.local' });
const https = require('https');

const projectRef = 'zzwouesueadoqrlmteyh';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
ALTER TABLE credit_cards 
ADD COLUMN IF NOT EXISTS last_statement_amount DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS last_statement_date DATE;
`;

const options = {
    hostname: `${projectRef}.supabase.co`,
    port: 443,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
    }
};

console.log('\n=== ATTEMPTING SQL MIGRATION VIA API ===\n');

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Migration successful!');
            console.log('Response:', data);
        } else {
            console.log(`❌ Migration failed with status ${res.statusCode}`);
            console.log('Response:', data);
            console.log('\nAlternative: Run SQL manually in Supabase dashboard');
            console.log(sql);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.log('\nPlease run this SQL manually in Supabase dashboard:');
    console.log(sql);
});

req.write(JSON.stringify({ query: sql }));
req.end();

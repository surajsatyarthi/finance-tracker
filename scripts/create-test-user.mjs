/**
 * Create test user in Supabase Auth
 * Run with: node scripts/create-test-user.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local manually
const envPath = join(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`${name}=["']?([^"'\\n]+)["']?`));
  return match ? match[1].replace(/\\n/g, '').trim() : null;
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

const TEST_USER = {
  email: 'test@financetracker.local',
  password: 'TestPassword123!',
  email_confirm: true,
};

async function createTestUser() {
  console.log('🔧 Creating test user in Supabase...\n');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Test Email: ${TEST_USER.email}\n`);
  
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify(TEST_USER),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.msg?.includes('already registered') || data.code === '23505') {
        console.log('ℹ️  Test user already exists!');
        console.log(`   Email: ${TEST_USER.email}`);
        console.log(`   Password: ${TEST_USER.password}\n`);
        console.log('✅ You can run tests now!\n');
        return;
      }
      throw new Error(JSON.stringify(data, null, 2));
    }

    console.log('✅ Test user created successfully!');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log(`   User ID: ${data.id}\n`);
    console.log('🎉 All set! You can now run tests with:\n');
    console.log('   npm run test:e2e:ui\n');

  } catch (error) {
    console.error('❌ Error creating test user:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. SUPABASE_SERVICE_ROLE_KEY is correct in .env.local');
    console.error('2. Supabase project is accessible');
    process.exit(1);
  }
}

createTestUser();

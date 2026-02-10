/**
 * Quick login test to verify credentials work
 */

const TEST_USER = {
  email: 'test@financetracker.local',
  password: 'TestPassword123!'
};

async function testLogin() {
  console.log('🔍 Testing login credentials...\n');
  console.log(`Email: ${TEST_USER.email}`);
  console.log(`Password: ${TEST_USER.password}\n`);

  try {
    // Try to login via Supabase
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful!');
    } else {
      console.log('\n❌ Login failed!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();

import { createClient } from '@supabase/supabase-js';

// Local Supabase credentials
// Note: These are for local dev/testing only
const supabaseUrl = 'http://127.0.0.1:55321';
const serviceRoleKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedUser() {
  const email = 'test@financetracker.local';
  const password = 'TestPassword123!';
  
  console.log(`Seeding user: ${email}...`);

  // Check if user exists (to avoid error)
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    // If list fails, try create anyway, or exit
    console.error('Error listing users:', listError.message);
    // Continue to try create
  }

  const existingUser = users?.find(u => u.email === email);
  if (existingUser) {
    console.log('✅ User already exists:', existingUser.id);
    return;
  }

  // Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  if (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
  
  console.log('✅ User created successfully:', data.user.id);
}

seedUser().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

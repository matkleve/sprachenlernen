import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  // First try to delete if exists
  try {
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users.find(u => u.email === 'test@example.com');
    if (existingUser) {
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log('Deleted existing user');
    }
  } catch (e) {
    console.log('No existing user to delete');
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test@example.com',
    password: 'SecureTest@2024!Pass',
    email_confirm: true,
    user_metadata: {}
  });

  if (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }

  console.log('User created successfully:', data.user.id);
  console.log('Email:', data.user.email);
}

createTestUser();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import process from 'node:process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const missingVariables = [
  ['VITE_SUPABASE_URL', SUPABASE_URL],
  ['SUPABASE_SECRET_KEY', SUPABASE_SECRET_KEY],
  ['ADMIN_EMAIL', ADMIN_EMAIL],
  ['ADMIN_PASSWORD', ADMIN_PASSWORD],
].filter(([, value]) => !value).map(([name]) => name);

if (missingVariables.length > 0) {
  console.error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdmin() {
  console.log('Creating admin user...');

  try {
    let userId;
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) throw listError;

    const existingUser = users.find((user) => user.email === ADMIN_EMAIL);

    if (existingUser) {
      console.log('User already exists; updating the configured account.');
      userId = existingUser.id;
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { email_verified: true },
      });
      if (updateError) throw updateError;
    } else {
      const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { email_verified: true },
      });
      if (createError) throw createError;
      userId = user.id;
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        role: 'admin',
      });

    if (profileError) throw profileError;
    console.log('Admin account is ready. Credentials were not printed.');
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  }
}

createAdmin();

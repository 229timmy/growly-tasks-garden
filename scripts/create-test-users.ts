import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create SQL function to handle all the work
async function createTestUsersWithSQL() {
  // Create SQL script for test user creation
  const sqlScript = `
-- First, clean up existing test users
DO $$
BEGIN
  -- Delete existing users and their data
  DELETE FROM auth.users 
  WHERE email IN (
    'free@example.com',
    'premium@example.com',
    'enterprise@example.com'
  );
END $$;

-- Create test users with proper password hashing
DO $$
DECLARE
  free_user_id uuid := '${uuidv4()}';
  premium_user_id uuid := '${uuidv4()}';
  enterprise_user_id uuid := '${uuidv4()}';
BEGIN
  -- Create free tier user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    aud,
    role,
    banned_until
  ) VALUES (
    free_user_id,
    '00000000-0000-0000-0000-000000000000',
    'free@example.com',
    crypt('password123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated',
    null
  );

  -- Create premium tier user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    aud,
    role,
    banned_until
  ) VALUES (
    premium_user_id,
    '00000000-0000-0000-0000-000000000000',
    'premium@example.com',
    crypt('password123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated',
    null
  );

  -- Create enterprise tier user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    aud,
    role,
    banned_until
  ) VALUES (
    enterprise_user_id,
    '00000000-0000-0000-0000-000000000000',
    'enterprise@example.com',
    crypt('password123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated',
    null
  );

  -- Create or update profiles with appropriate tiers
  INSERT INTO public.profiles (id, email, tier, created_at, updated_at)
  VALUES
    (free_user_id, 'free@example.com', 'free', now(), now()),
    (premium_user_id, 'premium@example.com', 'premium', now(), now()),
    (enterprise_user_id, 'enterprise@example.com', 'enterprise', now(), now())
  ON CONFLICT (id) DO UPDATE SET
    tier = EXCLUDED.tier,
    updated_at = now();

END $$;
  `;

  // Save the script to a file
  const scriptPath = './scripts/temp-create-users.sql';
  fs.writeFileSync(scriptPath, sqlScript);
  
  console.log('Running SQL script via Supabase...');
  
  try {
    // Try to use Supabase's raw function first
    console.log('Trying raw query...');
    
    const { error: rawError } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (rawError) {
      console.error('Error running SQL via RPC:', rawError.message);
      throw new Error('Failed to execute SQL via RPC');
    } else {
      console.log('SQL script executed successfully via RPC');
    }
    
    console.log(`
Test users created successfully:
- Free tier: free@example.com / password123
- Premium tier: premium@example.com / password123
- Enterprise tier: enterprise@example.com / password123
    `);
  } catch (error: any) {
    console.error('Failed to create users:', error.message);
    
    // As a last resort, print instructions for manual SQL execution
    console.log('\nPlease execute the SQL script manually in the Supabase SQL editor:');
    console.log('1. Open Supabase dashboard: https://app.supabase.com/project/_/sql');
    console.log('2. Open the script at: ./scripts/temp-create-users.sql');
    console.log('3. Copy and paste the SQL into the editor, then run it');
    
    process.exit(1);
  }
}

// Execute the function
createTestUsersWithSQL(); 
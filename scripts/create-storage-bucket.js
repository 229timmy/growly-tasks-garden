/**
 * This script creates the plant-photos storage bucket in Supabase
 * and sets up the necessary policies.
 * 
 * IMPORTANT: This script should be run with the service role key,
 * not the anon key. Never expose your service role key in client code.
 * 
 * Usage:
 * Run: node scripts/create-storage-bucket.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get environment variables from .env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY environment variables must be set in .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Bucket name
const BUCKET_NAME = 'plant-photos';

async function createBucket() {
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log(`Bucket '${BUCKET_NAME}' already exists.`);
    } else {
      // Create the bucket
      console.log(`Creating bucket '${BUCKET_NAME}'...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
      
      if (createError) {
        throw createError;
      }
      
      console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
    }
    
    // Note about policies
    console.log('');
    console.log('IMPORTANT: You need to set up the following storage policies in the Supabase dashboard:');
    console.log('1. Allow authenticated users to upload files');
    console.log('2. Allow public access to read files');
    console.log('3. Allow authenticated users to delete their own files');
    console.log('');
    console.log('Go to: https://app.supabase.com/project/_/storage/buckets');
    console.log(`Select the '${BUCKET_NAME}' bucket, then click on "Policies" tab to add these policies.`);
    console.log('');
    console.log('Setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createBucket(); 
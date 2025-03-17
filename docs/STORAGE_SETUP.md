# Storage Setup for Plant Photos

This document explains how to set up the storage bucket for plant photos in Supabase.

## Automatic Setup

We've created a script that automatically creates the `plant-photos` bucket in Supabase. To run it:

1. Make sure your `.env` file contains the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (not the anon key)

2. Run the script:
   ```bash
   node scripts/create-storage-bucket.js
   ```

## Manual Setup

If you prefer to set up the bucket manually:

1. Go to the Supabase dashboard: https://app.supabase.com/project/_/storage/buckets
2. Click "Create bucket"
3. Name it `plant-photos`
4. Enable public access
5. Set file size limit to 5MB

## Setting Up Storage Policies

After creating the bucket, you need to set up the following policies:

1. **Allow authenticated users to upload files**
   - Policy name: `authenticated can upload`
   - Definition: `auth.role() = 'authenticated'`
   - Operation: `INSERT`

2. **Allow public access to read files**
   - Policy name: `public can read`
   - Definition: `true` (or `auth.role() = 'anon'`)
   - Operation: `SELECT`

3. **Allow authenticated users to delete their own files**
   - Policy name: `authenticated can delete own files`
   - Definition: `auth.uid() = owner`
   - Operation: `DELETE`

## Troubleshooting

If you encounter a `StorageApiError` when trying to upload photos, check that:

1. The `plant-photos` bucket exists in your Supabase project
2. The necessary policies are set up correctly
3. You're using the correct Supabase URL and API key in your `.env` file

## Usage in the Application

The application uses the `StorageService` class to interact with the storage bucket. This service handles:

- Uploading plant photos
- Retrieving plant photos
- Deleting plant photos

The service automatically checks if the bucket exists when it initializes, and will log a warning if it doesn't. 
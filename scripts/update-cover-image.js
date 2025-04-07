import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateCoverImage() {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .update({ cover_image: 'https://i.postimg.cc/Pr9hp2Kd/minimal-grow.png' })
      .eq('id', '6fcc1f3c-fa0b-4a38-93f5-5e3fcc4b3514');

    if (error) throw error;
    console.log('Successfully updated cover image');
  } catch (error) {
    console.error('Error updating cover image:', error);
    process.exit(1);
  }
}

updateCoverImage(); 
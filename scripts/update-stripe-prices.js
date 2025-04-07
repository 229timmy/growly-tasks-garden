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

async function updateStripePrices() {
  try {
    // Update Premium plan
    const { error: premiumError } = await supabase
      .from('subscription_plans')
      .update({ 
        stripe_price_id: 'price_1RB3RqDOVQTCr5jQdcLCBTsc',
        updated_at: new Date().toISOString()
      })
      .eq('name', 'premium');

    if (premiumError) throw premiumError;
    console.log('Successfully updated Premium plan price');

    // Update Enterprise plan
    const { error: enterpriseError } = await supabase
      .from('subscription_plans')
      .update({ 
        stripe_price_id: 'price_1RB3TcDOVQTCr5jQ8wBQUTTl',
        updated_at: new Date().toISOString()
      })
      .eq('name', 'enterprise');

    if (enterpriseError) throw enterpriseError;
    console.log('Successfully updated Enterprise plan price');

    // Verify the updates
    const { data: plans, error: verifyError } = await supabase
      .from('subscription_plans')
      .select('name, stripe_price_id')
      .in('name', ['premium', 'enterprise']);

    if (verifyError) throw verifyError;
    console.log('\nCurrent subscription plans:');
    console.log(JSON.stringify(plans, null, 2));

  } catch (error) {
    console.error('Error updating subscription plans:', error);
    process.exit(1);
  }
}

updateStripePrices(); 
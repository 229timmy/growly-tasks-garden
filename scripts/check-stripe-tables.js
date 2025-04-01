import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTables() {
  console.log('Checking stripe_customers table...')
  const { data: customers, error: customersError } = await supabase
    .from('stripe_customers')
    .select('*')
  
  if (customersError) {
    console.error('Error fetching customers:', customersError)
  } else {
    console.log('stripe_customers:', JSON.stringify(customers, null, 2))
  }

  console.log('\nChecking specific customer...')
  const customerId = process.env.TEST_CUSTOMER_ID || 'CUSTOMER_ID_NOT_SET'
  const { data: specificCustomer, error: specificError } = await supabase
    .from('stripe_customers')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (specificError) {
    console.error('Error fetching specific customer:', specificError)
  } else {
    console.log('Specific customer:', JSON.stringify(specificCustomer, null, 2))
  }

  console.log('\nChecking subscriptions table...')
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select('*')

  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError)
  } else {
    console.log('subscriptions:', JSON.stringify(subscriptions, null, 2))
  }

  console.log('\nChecking subscription_plans table...')
  const { data: plans, error: plansError } = await supabase
    .from('subscription_plans')
    .select('*')

  if (plansError) {
    console.error('Error fetching plans:', plansError)
  } else {
    console.log('subscription_plans:', JSON.stringify(plans, null, 2))
  }

  console.log('\nChecking user profiles with stripe info...')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      tier,
      stripe_customers (
        stripe_customer_id
      ),
      subscriptions (
        stripe_subscription_id,
        status,
        current_period_end
      )
    `)

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  } else {
    console.log('profiles with stripe info:', JSON.stringify(profiles, null, 2))
  }
}

checkTables() 
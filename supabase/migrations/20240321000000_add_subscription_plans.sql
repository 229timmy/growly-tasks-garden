-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name user_tier NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL UNIQUE,
  max_grows INTEGER NOT NULL,
  max_plants_per_grow INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users" ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial subscription plans
INSERT INTO subscription_plans (name, stripe_price_id, max_grows, max_plants_per_grow, features)
VALUES 
  ('free', 'price_free', 1, 4, '["basic_tracking", "basic_analytics"]'),
  ('premium', 'price_premium', 4, 6, '["basic_tracking", "basic_analytics", "environmental_alerts", "batch_measurements"]'),
  ('enterprise', 'price_enterprise', 10, 20, '["basic_tracking", "basic_analytics", "environmental_alerts", "batch_measurements", "advanced_analytics"]')
ON CONFLICT (name) DO UPDATE SET
  max_grows = EXCLUDED.max_grows,
  max_plants_per_grow = EXCLUDED.max_plants_per_grow,
  features = EXCLUDED.features,
  updated_at = NOW(); 
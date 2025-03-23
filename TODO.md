# Stripe Production Launch Checklist

## 1. Database Verification
- [ ] Check current subscription_plans table state:
```sql
SELECT * FROM subscription_plans;
```
- [ ] Check current stripe_customers table state:
```sql
SELECT * FROM stripe_customers;
```
- [ ] Check current subscriptions table state:
```sql
SELECT * FROM subscriptions;
```

## 2. Stripe Configuration
- [ ] Create production Stripe products and prices
- [ ] Get production API keys from Stripe dashboard
- [ ] Update environment variables:
  ```
  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
  VITE_STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_live_...
  ```
- [ ] Set up production webhook endpoint in Stripe dashboard
- [ ] Configure webhook event types:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - payment_intent.succeeded
  - payment_intent.failed

## 3. Database Updates
- [ ] Update subscription_plans with production price IDs:
```sql
UPDATE subscription_plans 
SET stripe_price_id = 'price_live_...'
WHERE name = 'premium';

UPDATE subscription_plans 
SET stripe_price_id = 'price_live_...'
WHERE name = 'enterprise';
```

## 4. Testing Checklist

### A. Subscription Lifecycle Tests
#### Free to Premium
- [ ] Start as free user
- [ ] Upgrade to premium
- [ ] Verify feature access updated
- [ ] Verify grow/plant limits updated

#### Premium to Enterprise
- [ ] Upgrade from premium to enterprise
- [ ] Verify new feature access
- [ ] Verify increased limits

#### Downgrade Tests
- [ ] Enterprise to Premium
- [ ] Premium to Free
- [ ] Verify grace period
- [ ] Verify limit enforcement
- [ ] Test data handling when over limit

#### Cancellation
- [ ] Cancel subscription
- [ ] Verify access until period end
- [ ] Verify reversion to free tier

### B. Feature Access Tests
#### Grows
- [ ] Verify grow limit enforcement
- [ ] Test plant limit per grow
- [ ] Test batch operations
- [ ] Verify limits across all tiers

#### Analytics
- [ ] Verify basic analytics for free tier
- [ ] Verify advanced analytics for premium+
- [ ] Test export functionality
- [ ] Verify tier-specific features

#### Environmental Features
- [ ] Test alerts system
- [ ] Verify measurement limits
- [ ] Test batch measurements
- [ ] Verify premium-only features

### C. Error Handling
- [ ] Test failed payment scenarios
- [ ] Test card decline handling
- [ ] Verify webhook failure recovery
- [ ] Test network issue handling
- [ ] Verify error messages are user-friendly

## 5. Monitoring Setup
- [ ] Set up Stripe webhook monitoring
- [ ] Configure error alerting
- [ ] Set up subscription event logging
- [ ] Monitor subscription status changes
- [ ] Set up dashboard for subscription metrics

## 6. Documentation
- [ ] Update user documentation for subscription management
- [ ] Document internal subscription handling procedures
- [ ] Create customer support response templates
- [ ] Document testing results

## 7. Backup Plan
- [ ] Document rollback procedure
- [ ] Create backup of current configuration
- [ ] Test restoration process
- [ ] Document emergency contacts

## 8. Launch Preparation
- [ ] Final configuration review
- [ ] Team notification plan
- [ ] Customer communication plan
- [ ] Support team preparation
- [ ] Schedule quiet period for launch

## Notes:
- Add any specific notes or observations here during the process
- Document any issues encountered and their resolutions
- Track any custom configurations needed 
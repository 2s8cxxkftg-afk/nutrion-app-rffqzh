
# Stripe Integration Setup Guide for Nutrion

This guide will help you set up Stripe payment integration for the Nutrion app.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Supabase project dashboard
3. The Nutrion app codebase

## Step 1: Get Your Stripe Keys

1. Log in to your Stripe Dashboard (https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy the following keys:
   - **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
   - **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)

## Step 2: Create a Stripe Product and Price

1. In your Stripe Dashboard, go to **Products** → **Add product**
2. Create a product with these details:
   - **Name**: Nutrion Premium Subscription
   - **Description**: Monthly subscription for Nutrion premium features
   - **Pricing**: $1.99 USD / month (recurring)
3. After creating the product, copy the **Price ID** (starts with `price_`)

## Step 3: Set Up Stripe Webhook

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter the webhook URL:
   ```
   https://xivsfhdsmsxwtsidxfyj.supabase.co/functions/v1/stripe-webhook
   ```
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

## Step 4: Configure Supabase Environment Variables

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (from Step 1)
   - `STRIPE_WEBHOOK_SECRET`: Your webhook signing secret (from Step 3)

## Step 5: Update the App Configuration

1. Open `utils/stripe.ts` in your code editor
2. Update the following constants:
   ```typescript
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';
   const STRIPE_PRICE_ID = 'price_YOUR_PRICE_ID_HERE';
   ```
   Replace with your actual publishable key and price ID from Steps 1 and 2.

## Step 6: Update Edge Function

1. Open the deployed `create-checkout-session` Edge Function
2. Update the price ID in the function:
   ```typescript
   price: priceId || 'price_YOUR_ACTUAL_PRICE_ID',
   ```

## Step 7: Configure Supabase Auth Email Templates

To enable OTP email verification:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Confirm signup** template
4. Update the template to include the OTP token:
   ```html
   <h2>Confirm your signup</h2>
   <p>Your verification code is: <strong>{{ .Token }}</strong></p>
   <p>This code expires in 24 hours.</p>
   ```
5. Click **Save**

## Step 8: Enable Email Confirmation

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Email Auth**, ensure **Enable email confirmations** is turned ON
3. Save the settings

## Step 9: Test the Integration

### Test Mode (Recommended First)

1. Use Stripe test mode keys (starting with `pk_test_` and `sk_test_`)
2. Use Stripe test card numbers:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - Use any future expiry date, any 3-digit CVC, and any ZIP code

### Testing Flow

1. Sign up for a new account in the app
2. Enter the 6-digit OTP code sent to your email
3. Start the 15-day free trial
4. Click "Subscribe for $1.99/month"
5. Complete the Stripe checkout
6. Verify the subscription is activated in the app

## Step 10: Monitor Webhooks

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Monitor the **Events** tab to see incoming webhook events
4. Check the **Logs** tab for any errors

## Step 11: Go Live

When ready to accept real payments:

1. Switch to live mode in Stripe Dashboard
2. Get your live API keys (starting with `pk_live_` and `sk_live_`)
3. Update the `STRIPE_SECRET_KEY` in Supabase secrets
4. Update `STRIPE_PUBLISHABLE_KEY` in `utils/stripe.ts`
5. Create a new webhook endpoint for live mode
6. Update `STRIPE_WEBHOOK_SECRET` in Supabase secrets

## Troubleshooting

### Webhook Not Receiving Events

- Verify the webhook URL is correct
- Check that the webhook secret is properly set in Supabase
- Review webhook logs in Stripe Dashboard
- Check Supabase Edge Function logs

### Payment Not Updating Subscription

- Verify the webhook is receiving events
- Check the Edge Function logs for errors
- Ensure the `user_id` is being passed correctly in metadata
- Verify the `subscriptions` table exists and has proper RLS policies

### OTP Code Not Received

- Check spam/junk folder
- Verify email template is configured correctly
- Check Supabase Auth logs
- Ensure email confirmations are enabled

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Enable webhook signature verification** (already implemented)
4. **Use HTTPS** for all webhook endpoints (Supabase provides this)
5. **Test thoroughly** in test mode before going live
6. **Monitor webhook events** regularly for suspicious activity

## Support

- Stripe Documentation: https://stripe.com/docs
- Supabase Documentation: https://supabase.com/docs
- Stripe Support: https://support.stripe.com

## Additional Features to Consider

1. **Proration**: Handle mid-cycle subscription changes
2. **Coupons**: Implement discount codes
3. **Multiple Plans**: Add different subscription tiers
4. **Annual Billing**: Offer yearly subscription option
5. **Grace Period**: Allow a few days after payment failure before canceling

---

**Note**: This integration uses Stripe Checkout for a hosted payment experience. For a more customized payment flow, consider implementing Stripe Payment Intents with the Stripe React Native SDK.

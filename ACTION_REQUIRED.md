
# Action Required: Complete Setup

This document outlines the steps you need to take to complete the setup of your Nutrion app.

## 🚨 Critical: Stripe Configuration Required

The Stripe integration has been implemented, but you need to configure it with your own Stripe account.

### Step 1: Create Stripe Account
1. Go to https://stripe.com and sign up for an account
2. Complete the account verification process
3. You can start with **Test Mode** for development

### Step 2: Get Your Stripe Keys
1. Log in to Stripe Dashboard: https://dashboard.stripe.com
2. Go to **Developers** → **API keys**
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 3: Create Subscription Product
1. In Stripe Dashboard, go to **Products**
2. Click **Add product**
3. Fill in:
   - **Name**: Nutrion Premium Subscription
   - **Description**: Monthly subscription for premium features
   - **Pricing model**: Recurring
   - **Price**: $1.99 USD
   - **Billing period**: Monthly
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`)

### Step 4: Update App Configuration
Open `utils/stripe.ts` and update these lines:

```typescript
// Line 4-5: Replace with your actual keys
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE'; // Replace this
const STRIPE_PRICE_ID = 'price_YOUR_PRICE_ID_HERE'; // Replace this
```

### Step 5: Configure Supabase Secrets
1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add these secrets:
   - **Name**: `STRIPE_SECRET_KEY`
     **Value**: Your Stripe secret key (from Step 2)
   - **Name**: `STRIPE_WEBHOOK_SECRET`
     **Value**: (You'll get this in Step 6)

### Step 6: Set Up Stripe Webhook
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter this URL:
   ```
   https://xivsfhdsmsxwtsidxfyj.supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add this as `STRIPE_WEBHOOK_SECRET` in Supabase (Step 5)

---

## 📧 Email Configuration Required

### Step 1: Configure Email Template for OTP
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Confirm signup** template
4. Replace the content with:

```html
<h2>Welcome to Nutrion!</h2>
<p>Thank you for signing up. To complete your registration, please use the verification code below:</p>
<h1 style="font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px;">{{ .Token }}</h1>
<p>This code will expire in 24 hours.</p>
<p>If you didn't request this code, please ignore this email.</p>
<p>Best regards,<br>The Nutrion Team</p>
```

5. Click **Save**

### Step 2: Enable Email Confirmation
1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Under **Email Auth**, ensure these are enabled:
   - ✅ **Enable email confirmations**
   - ✅ **Enable email change confirmations**
3. Click **Save**

### Step 3: (Optional) Configure Custom SMTP
For better email deliverability in production:
1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your own SMTP server (e.g., SendGrid, Mailgun, AWS SES)
3. This ensures emails don't go to spam

---

## 🔒 Security Configuration

### Step 1: Enable Password Protection
1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. Under **Password Settings**:
   - ✅ Enable **Leaked Password Protection**
   - Set **Minimum password length**: 6 characters
   - ✅ Enable **Password strength requirements**
3. Click **Save**

### Step 2: Configure MFA Settings
1. In **Authentication** → **Settings**
2. Under **Multi-Factor Authentication**:
   - ✅ Enable **Time-based One-Time Password (TOTP)**
   - (Optional) Enable **SMS-based OTP**
3. Click **Save**

---

## 🧪 Testing Your Setup

### Test with Stripe Test Mode

1. **Test Card Numbers**:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - **Requires Authentication**: 4000 0025 0000 3155

2. **Test Details**:
   - **Expiry**: Any future date (e.g., 12/34)
   - **CVC**: Any 3 digits (e.g., 123)
   - **ZIP**: Any 5 digits (e.g., 12345)

### Complete Test Flow

1. ✅ Sign up with a new email
2. ✅ Check email for 6-digit OTP code
3. ✅ Enter OTP code in app
4. ✅ Email should be verified
5. ✅ Start 15-day free trial
6. ✅ Click "Subscribe for $1.99/month"
7. ✅ Complete Stripe checkout with test card
8. ✅ Verify subscription is active
9. ✅ Check premium features are unlocked

---

## 🚀 Going Live

When ready for production:

### Step 1: Switch to Live Mode
1. In Stripe Dashboard, toggle to **Live mode**
2. Get your live API keys (start with `pk_live_` and `sk_live_`)
3. Update `utils/stripe.ts` with live publishable key
4. Update Supabase secret `STRIPE_SECRET_KEY` with live secret key

### Step 2: Create Live Webhook
1. Create a new webhook endpoint in Live mode
2. Use the same URL and events as test mode
3. Update Supabase secret `STRIPE_WEBHOOK_SECRET` with new signing secret

### Step 3: Verify Business Details
1. Complete Stripe account verification
2. Add business information
3. Set up bank account for payouts
4. Review and accept Stripe's terms

---

## 📊 Monitoring

### Stripe Dashboard
- Monitor payments: **Payments** tab
- View subscriptions: **Subscriptions** tab
- Check webhooks: **Developers** → **Webhooks** → **Events**
- Review logs: **Developers** → **Logs**

### Supabase Dashboard
- View users: **Authentication** → **Users**
- Check subscriptions: **Table Editor** → **subscriptions**
- Monitor Edge Functions: **Edge Functions** → **Logs**
- Review auth logs: **Authentication** → **Logs**

---

## ❓ Troubleshooting

### Email OTP Not Received
- ✅ Check spam/junk folder
- ✅ Verify email template is configured
- ✅ Check Supabase Auth logs
- ✅ Ensure email confirmations are enabled

### Stripe Payment Not Working
- ✅ Verify Stripe keys are correct
- ✅ Check webhook is receiving events
- ✅ Review Stripe Dashboard logs
- ✅ Ensure webhook secret is set correctly

### Subscription Not Activating
- ✅ Check webhook events in Stripe
- ✅ Review Edge Function logs in Supabase
- ✅ Verify `subscriptions` table exists
- ✅ Check RLS policies on subscriptions table

### Timeout Errors
- ✅ Check internet connection
- ✅ Verify Supabase project is active
- ✅ Review Supabase logs for errors
- ✅ Ensure retry logic is working

---

## 📞 Support

If you encounter issues:

1. **Check the logs**:
   - Supabase: **Edge Functions** → **Logs**
   - Stripe: **Developers** → **Logs**

2. **Review documentation**:
   - `STRIPE_SETUP_GUIDE.md` - Detailed Stripe setup
   - `FIXES_IMPLEMENTED.md` - All changes made

3. **Test in isolation**:
   - Test email OTP separately
   - Test Stripe checkout separately
   - Test webhook separately

4. **Contact support**:
   - Stripe Support: https://support.stripe.com
   - Supabase Support: https://supabase.com/support

---

## ✅ Checklist

Before launching:

- [ ] Stripe account created and verified
- [ ] Stripe keys added to app
- [ ] Subscription product created ($1.99/month)
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to Supabase
- [ ] Email template configured for OTP
- [ ] Email confirmations enabled
- [ ] Password protection enabled
- [ ] MFA settings configured
- [ ] Test signup flow completed
- [ ] Test OTP verification completed
- [ ] Test Stripe payment completed
- [ ] Test subscription activation completed
- [ ] Webhook events verified
- [ ] All features tested end-to-end

---

## 🎉 You're All Set!

Once you complete these steps, your Nutrion app will have:

✅ Secure email verification with 6-digit OTP
✅ 15-day free trial for new users
✅ Stripe payment integration for subscriptions
✅ Automatic subscription management
✅ Premium feature access control
✅ Robust error handling and retry logic

**Next Steps**: Test thoroughly in test mode, then switch to live mode when ready!


# Nutrion Deployment Guide

## 🚀 Quick Start

This guide will help you deploy Nutrion to the App Store and Google Play Store with subscription functionality.

## Prerequisites

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure Project**
   ```bash
   eas init
   ```
   This will create an EAS project and give you a project ID.

## 📝 Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials in `.env`:**
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

   # Stripe Configuration (Optional - for payments)
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   EXPO_PUBLIC_STRIPE_PRICE_ID=price_...

   # App Configuration
   EXPO_PUBLIC_APP_ENV=production
   ```

3. **Update `app.json`:**
   - Replace `YOUR_EAS_PROJECT_ID` with your actual project ID from `eas init`
   - Update `bundleIdentifier` (iOS) and `package` (Android) if needed

4. **Update `eas.json` for iOS submission:**
   - Replace `YOUR_APPLE_ID` with your Apple ID email
   - Replace `YOUR_ASC_APP_ID` with your App Store Connect app ID
   - Replace `YOUR_TEAM_ID` with your Apple Developer Team ID

## 🗄️ Database Setup

The subscriptions table has already been created with the migration. You can verify it exists:

```sql
-- Check if table exists
SELECT * FROM subscriptions LIMIT 1;
```

The table includes:
- `user_id`: Links to auth.users
- `status`: 'trial', 'active', 'expired', or 'exempted'
- `trial_start_date` & `trial_end_date`: 15-day trial period
- `subscription_end_date`: When paid subscription ends
- `is_exempted`: Boolean flag for free lifetime access
- `stripe_subscription_id` & `stripe_customer_id`: Stripe integration

## 👥 User Exemption System

To give specific users free lifetime access (beta testers, friends, family):

### Method 1: Via Supabase Dashboard
1. Go to **Table Editor** → **subscriptions**
2. Find the user's row (or create one)
3. Set `is_exempted` to `true`
4. Set `status` to `'exempted'`
5. Click **Save**

### Method 2: Via SQL
```sql
-- Exempt a specific user
UPDATE subscriptions
SET is_exempted = true, status = 'exempted'
WHERE user_id = 'USER_UUID_HERE';

-- Or create a new exemption
INSERT INTO subscriptions (user_id, status, is_exempted)
VALUES ('USER_UUID_HERE', 'exempted', true)
ON CONFLICT (user_id) DO UPDATE
SET is_exempted = true, status = 'exempted';
```

### Method 3: Bulk Exemptions
```sql
-- Exempt multiple users at once
UPDATE subscriptions
SET is_exempted = true, status = 'exempted'
WHERE user_id IN (
  'uuid-1',
  'uuid-2',
  'uuid-3'
);
```

## 🏗️ Building for Production

### iOS (App Store)

1. **Build:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit:**
   ```bash
   eas submit --platform ios --profile production
   ```

3. **Or submit manually:**
   - Download the `.ipa` file from EAS
   - Upload to App Store Connect via Transporter app

### Android (Google Play)

1. **Build:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit:**
   ```bash
   eas submit --platform android --profile production
   ```

3. **Or submit manually:**
   - Download the `.aab` file from EAS
   - Upload to Google Play Console

## 🧪 Testing Builds

### Preview Build (Internal Testing)

**iOS (TestFlight):**
```bash
eas build --platform ios --profile preview
```
Then distribute via TestFlight in App Store Connect.

**Android (APK for direct install):**
```bash
eas build --platform android --profile preview
```
Download and install the APK directly on Android devices.

### Development Build (Local Testing)

```bash
# iOS Simulator
eas build --platform ios --profile development

# Android Emulator/Device
eas build --platform android --profile development
```

## 💳 Subscription Flow

### 1. New User Journey
```
Sign Up → 15-Day Free Trial Starts → Full Access to All Features
```

### 2. Trial Expiration
```
Trial Ends → Paywall Screen → Subscribe ($2/month) → Full Access
```

### 3. Exempted Users
```
Sign Up → Marked as Exempted → Free Lifetime Access (No Paywall)
```

### 4. Subscription Management
Users can manage their subscription from:
- Profile → Manage Subscription
- View status, cancel, or update payment method

## 🔧 Common Issues & Solutions

### Build Fails

**Issue:** Build fails with "Invalid credentials"
**Solution:**
- Run `eas login` again
- Verify your Expo account has access to the project

**Issue:** "Bundle identifier already exists"
**Solution:**
- Change `bundleIdentifier` in `app.json` to something unique
- Format: `com.yourcompany.nutrion`

**Issue:** "EAS project ID not found"
**Solution:**
- Run `eas init` to create/link project
- Update `projectId` in `app.json`

### Subscription Not Working

**Issue:** Users can't start trial
**Solution:**
- Check Supabase connection in app
- Verify subscriptions table exists
- Check RLS policies allow user access

**Issue:** Paywall not showing after trial
**Solution:**
- Verify `hasActiveAccess()` function is working
- Check subscription status in database
- Ensure SubscriptionGate is wrapping protected screens

**Issue:** Exempted users still see paywall
**Solution:**
- Verify `is_exempted` is set to `true` in database
- Check `status` is set to `'exempted'`
- Clear app cache and restart

### Deep Linking Issues

**Issue:** Stripe redirect doesn't work
**Solution:**
- Verify `scheme` in `app.json` matches Stripe settings
- Test with: `npx uri-scheme open nutrion://paywall --ios`
- Check URL scheme is registered in iOS/Android

## 📊 Monitoring & Analytics

### Check Subscription Stats

```sql
-- Total users by subscription status
SELECT status, COUNT(*) as count
FROM subscriptions
GROUP BY status;

-- Exempted users
SELECT u.email, s.status, s.is_exempted
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.is_exempted = true;

-- Active trials
SELECT u.email, s.trial_end_date
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.status = 'trial'
AND s.trial_end_date > NOW();
```

## 🎯 Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured in `.env`
- [ ] EAS project initialized (`eas init`)
- [ ] Bundle identifiers updated in `app.json`
- [ ] Subscriptions table exists in Supabase
- [ ] RLS policies enabled on subscriptions table
- [ ] Test user exemption system works
- [ ] Test subscription flow (trial → paywall → subscribe)
- [ ] Icons and splash screen updated
- [ ] App Store/Play Store listings prepared
- [ ] Privacy policy and terms of service ready
- [ ] Stripe webhook configured (if using Stripe)
- [ ] Test builds on physical devices

## 📱 App Store Requirements

### iOS (App Store)
- App icon (1024x1024px)
- Screenshots (various sizes)
- Privacy policy URL
- App description
- Keywords
- Age rating

### Android (Google Play)
- App icon (512x512px)
- Feature graphic (1024x500px)
- Screenshots (various sizes)
- Privacy policy URL
- App description
- Content rating

## 🆘 Support & Resources

- **Expo Documentation:** https://docs.expo.dev
- **EAS Build Guide:** https://docs.expo.dev/build/introduction/
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Integration:** https://stripe.com/docs
- **React Native:** https://reactnative.dev

## 🎉 Post-Deployment

After successful deployment:

1. **Monitor crash reports** in App Store Connect / Play Console
2. **Track subscription metrics** in Supabase
3. **Respond to user reviews** promptly
4. **Plan updates** based on user feedback
5. **Exempt beta testers** who helped during development

---

**Need help?** Check the Expo forums or Supabase Discord for community support.

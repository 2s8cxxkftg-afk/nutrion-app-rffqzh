
# 📋 Action Items - What You Need to Do

## 🎯 Quick Summary
Your app has been updated to charge **$2.99/month** instead of $1.99/month. Almost everything is done automatically, but you need to complete 2 quick manual steps in Stripe.

---

## ✅ What's Already Done (No Action Needed)

1. ✅ Frontend code updated to show $2.99
2. ✅ Supabase database updated to store $2.99
3. ✅ Stripe webhook updated to handle $2.99
4. ✅ All existing subscriptions migrated to new price
5. ✅ App scanned for bugs - all healthy!

---

## 🚨 REQUIRED: Update Stripe (5 minutes)

### Step 1: Create New Price in Stripe Dashboard

1. Open: https://dashboard.stripe.com/products
2. Find your **Nutrion** product (or create one if it doesn't exist)
3. Click **"Add another price"**
4. Configure:
   - **Price**: $2.99 USD
   - **Billing period**: Monthly
   - **Type**: Recurring
5. Click **"Add price"**
6. **COPY THE PRICE ID** - it looks like: `price_1234567890abcdef`

### Step 2: Update Supabase Edge Function

1. Open: https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj/functions
2. Click on **`create-checkout-session`** function
3. Find this line in the code:
   ```typescript
   price: priceId || 'price_1234567890',
   ```
4. Replace `'price_1234567890'` with your actual Price ID from Step 1
5. Click **"Deploy"** to save changes

### Step 3: Test It!

1. Open your Nutrion app
2. Go to: **Profile → Subscription**
3. Click **"Upgrade to Premium"**
4. Verify the Stripe checkout page shows **$2.99/month**
5. (Optional) Complete a test purchase to verify everything works

---

## ⚠️ OPTIONAL: Clean Up Dependencies (2 minutes)

Your app has `react-native-maps` in package.json but doesn't use it. This can cause iOS build issues.

**To remove it**:
```bash
npm uninstall react-native-maps
```

**Why**: This package was added but never used, and it causes crashes on iOS.

---

## 🎉 That's It!

Once you complete the Stripe steps above, your app will be fully configured to charge $2.99/month for premium subscriptions!

### Need Help?
- Email: hello@solvralabs.net
- All code changes are already applied
- Only Stripe dashboard updates are needed

---

## 📝 Quick Checklist

- [ ] Create $2.99 price in Stripe Dashboard
- [ ] Copy the new Price ID
- [ ] Update `create-checkout-session` Edge Function with new Price ID
- [ ] Test subscription flow in app
- [ ] (Optional) Remove react-native-maps dependency

**Estimated Time**: 5-10 minutes total

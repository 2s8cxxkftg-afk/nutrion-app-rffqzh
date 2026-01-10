
# 🚀 Nutrion - Google Play Store Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. **EAS Account Setup**
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure your project
eas build:configure
```

### 2. **Update EAS Project ID**
After running `eas build:configure`, your `app.json` will be updated with your actual EAS project ID automatically.

### 3. **Android Keystore**
EAS will automatically generate and manage your Android keystore. No manual setup needed!

---

## 🏗️ Building for Google Play Store

### **Step 1: Build Production AAB**
```bash
# Build Android App Bundle (AAB) for Google Play Store
eas build --platform android --profile production
```

This will:
- ✅ Create an optimized AAB file
- ✅ Auto-increment version code
- ✅ Sign with your keystore
- ✅ Upload to EAS servers

### **Step 2: Download Your Build**
Once the build completes (usually 10-20 minutes), download the AAB file from the EAS dashboard or via CLI:

```bash
# Download the latest build
eas build:list
```

---

## 📱 Google Play Console Setup

### **Step 1: Create App in Google Play Console**
1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - **App name:** Nutrion
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free (with in-app purchases)

### **Step 2: Complete Store Listing**
Required information:
- **App name:** Nutrion
- **Short description:** Smart pantry management with expiration tracking
- **Full description:**
```
Nutrion helps you manage your pantry, track food expiration dates, and plan balanced meals based on what's available at home.

KEY FEATURES:
✅ Smart Pantry Inventory - Scan barcodes or manually add items
✅ Expiration Alerts - Get notified before food spoils
✅ Meal Planner - Auto-suggest meals from available ingredients
✅ Shopping List - Never forget what you need
✅ Analytics Dashboard - Track waste reduction

SUBSCRIPTION:
Free for 1 month, then $1.99/month
```

- **App icon:** 512x512 PNG (use your app icon)
- **Feature graphic:** 1024x500 PNG
- **Screenshots:** At least 2 phone screenshots (1080x1920 or similar)
- **Privacy policy URL:** (Required - create one)

### **Step 3: Content Rating**
1. Go to "Content rating" section
2. Fill out the questionnaire
3. Submit for rating

### **Step 4: App Content**
- **Target audience:** Adults
- **Privacy policy:** Required (add URL)
- **Ads:** Select if you show ads
- **In-app purchases:** Yes ($1.99/month subscription)

### **Step 5: Upload AAB**
1. Go to "Production" → "Create new release"
2. Upload your AAB file
3. Add release notes:
```
Initial release of Nutrion - Smart Pantry Management

Features:
- Barcode scanning for easy item entry
- Expiration date tracking with alerts
- Meal planning based on available ingredients
- Shopping list management
- Analytics dashboard
```

---

## 🔐 Privacy Policy (Required)

You MUST have a privacy policy URL. Here's a template:

**What to include:**
- Data collection (email, pantry items, preferences)
- How data is used (app functionality, notifications)
- Third-party services (Supabase, Stripe)
- User rights (data deletion, access)
- Contact information

**Quick solution:** Use a privacy policy generator like:
- https://www.privacypolicygenerator.info/
- https://app-privacy-policy-generator.firebaseapp.com/

---

## 🧪 Testing Before Release

### **Internal Testing Track**
```bash
# Build and submit to internal testing
eas build --platform android --profile production
eas submit --platform android --latest
```

1. Add test users in Google Play Console
2. Share the internal testing link
3. Get feedback before public release

### **Closed Testing (Beta)**
1. Create a closed testing track
2. Add beta testers
3. Test for 1-2 weeks
4. Fix any issues

---

## 🚀 Production Release

### **Step 1: Submit for Review**
1. Go to "Production" in Google Play Console
2. Click "Create new release"
3. Upload your AAB
4. Add release notes
5. Click "Review release"
6. Click "Start rollout to Production"

### **Step 2: Review Process**
- ⏱️ Usually takes 1-3 days
- 📧 You'll get email updates
- ✅ Once approved, app goes live!

### **Step 3: Gradual Rollout (Recommended)**
- Start with 20% of users
- Monitor for crashes/issues
- Increase to 50%, then 100%

---

## 🔄 Updating Your App

### **For Future Updates:**
```bash
# 1. Update version in app.json (optional - autoIncrement handles this)
# 2. Build new version
eas build --platform android --profile production

# 3. Submit to Google Play
eas submit --platform android --latest
```

---

## 📊 Post-Launch Checklist

- [ ] Monitor crash reports in Google Play Console
- [ ] Check user reviews and respond
- [ ] Track download metrics
- [ ] Set up Google Analytics (optional)
- [ ] Monitor subscription conversions
- [ ] Plan feature updates based on feedback

---

## 🆘 Common Issues & Solutions

### **Issue: Build fails**
```bash
# Clear cache and rebuild
eas build:cancel
eas build --platform android --profile production --clear-cache
```

### **Issue: App rejected for missing privacy policy**
- Add privacy policy URL in Google Play Console
- Update app.json with privacy policy link

### **Issue: Permissions rejected**
- Ensure all permissions are justified in store listing
- Camera: "For barcode scanning"
- Notifications: "For expiration alerts"

### **Issue: Version code conflict**
- EAS auto-increments, but if manual:
```json
// In app.json
"android": {
  "versionCode": 2  // Increment this
}
```

---

## 📞 Support Resources

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **EAS Submit Docs:** https://docs.expo.dev/submit/introduction/
- **Google Play Console:** https://play.google.com/console
- **Expo Discord:** https://chat.expo.dev/

---

## 🎉 You're Ready!

Your app is now configured for Google Play Store deployment. Follow the steps above to build and submit your app.

**Quick Start Command:**
```bash
eas build --platform android --profile production
```

Good luck with your launch! 🚀

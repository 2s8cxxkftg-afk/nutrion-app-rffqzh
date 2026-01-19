
# 📱 Nutrion App - Complete Step-by-Step Deployment Guide

This guide will walk you through deploying your Nutrion app to both iOS App Store and Google Play Store, even if you don't know how to code.

---

## 🎯 Overview: What You Need to Do

Your app is ready! Here's what needs to happen:

1. **Configure Apple Developer Account** (for iOS)
2. **Configure Google Play Console** (for Android)
3. **Build the app** using EAS (Expo Application Services)
4. **Submit to app stores**

---

## 📋 Prerequisites (What You Need Before Starting)

### For iOS Deployment:
- ✅ Apple Developer Account ($99/year)
- ✅ Your Apple ID email
- ✅ App Store Connect access
- ✅ Your Team ID from Apple Developer portal

### For Android Deployment:
- ✅ Google Play Console Account ($25 one-time fee)
- ✅ Google Play Console access

### General:
- ✅ Expo account (free - you should already have this)
- ✅ Computer with internet connection
- ✅ Terminal/Command Prompt access

---

## 🍎 Part 1: iOS Deployment (Step-by-Step)

### Step 1: Get Your Apple Credentials

1. **Go to Apple Developer Portal**
   - Visit: https://developer.apple.com/account
   - Sign in with your Apple ID

2. **Find Your Team ID**
   - Click on "Membership" in the sidebar
   - You'll see your "Team ID" (looks like: ABC123XYZ)
   - **Write this down** - you'll need it

3. **Create App in App Store Connect**
   - Visit: https://appstoreconnect.apple.com
   - Click the "+" button to create a new app
   - Fill in:
     - **Platform**: iOS
     - **Name**: Nutrion
     - **Primary Language**: English
     - **Bundle ID**: Create new (e.g., com.yourname.nutrion)
     - **SKU**: nutrion-app (or any unique identifier)
   - Click "Create"
   - **Write down the App ID** (you'll see it in the URL or app info)

### Step 2: Update Your App Configuration

You need to update the `eas.json` file with your Apple credentials. Here's what it should look like:

```json
{
  "build": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID_EMAIL@example.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

**Replace:**
- `YOUR_APPLE_ID_EMAIL@example.com` with your actual Apple ID email
- `YOUR_APP_STORE_CONNECT_APP_ID` with the App ID from Step 1.3
- `YOUR_TEAM_ID` with the Team ID from Step 1.2

### Step 3: Build the iOS App

Open your terminal/command prompt in the project folder and run:

```bash
# Install EAS CLI if you haven't already
npm install -g eas-cli

# Login to your Expo account
eas login

# Build for iOS
eas build --platform ios --profile production
```

**What happens:**
- EAS will ask you to confirm your Apple credentials
- It will build your app in the cloud (takes 10-20 minutes)
- You'll get a link to download the build when it's done

### Step 4: Submit to App Store

Once the build is complete:

```bash
eas submit --platform ios --latest
```

**What happens:**
- EAS will automatically upload your app to App Store Connect
- You'll need to provide your Apple ID password (or app-specific password)
- The app will appear in App Store Connect for review

### Step 5: Complete App Store Listing

1. Go to App Store Connect: https://appstoreconnect.apple.com
2. Click on your Nutrion app
3. Fill in the required information:
   - **App Description**: Describe what Nutrion does
   - **Keywords**: pantry, food, expiration, meal planner
   - **Screenshots**: You'll need screenshots of your app (5-10 images)
   - **App Icon**: Should already be set
   - **Privacy Policy URL**: You'll need to create one
   - **Support URL**: Your website or email
   - **Pricing**: $2/month subscription (set up in-app purchases)

4. Click "Submit for Review"

**Timeline**: Apple review takes 1-3 days typically

---

## 🤖 Part 2: Android Deployment (Step-by-Step)

### Step 1: Create a Google Play Console Account

1. Visit: https://play.google.com/console
2. Sign in with your Google account
3. Pay the $25 one-time registration fee
4. Complete the account setup

### Step 2: Create Your App in Google Play Console

1. Click "Create app"
2. Fill in:
   - **App name**: Nutrion
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free (with in-app purchases)
3. Accept the declarations
4. Click "Create app"

### Step 3: Generate a Service Account Key

This is needed for automated uploads:

1. In Google Play Console, go to "Setup" → "API access"
2. Click "Create new service account"
3. Follow the link to Google Cloud Console
4. Create a service account with "Service Account User" role
5. Create a JSON key for this service account
6. **Download the JSON file** - you'll need this

### Step 4: Build the Android App

In your terminal:

```bash
# Build for Android
eas build --platform android --profile production
```

**What happens:**
- EAS builds your Android app (APK/AAB file)
- Takes 10-20 minutes
- You'll get a download link when done

### Step 5: Submit to Google Play

```bash
# You'll need to provide the service account JSON file path
eas submit --platform android --latest
```

**What happens:**
- EAS uploads your app to Google Play Console
- The app will be in "Draft" status

### Step 6: Complete Google Play Listing

1. Go to Google Play Console
2. Click on your Nutrion app
3. Complete all required sections:

   **Store Listing:**
   - App name: Nutrion
   - Short description: (50 characters max)
   - Full description: (4000 characters max)
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Screenshots: At least 2 screenshots

   **Content Rating:**
   - Fill out the questionnaire
   - Get your rating

   **App Content:**
   - Privacy policy URL
   - Ads declaration: No ads
   - Target audience
   - Data safety form

   **Pricing & Distribution:**
   - Countries: Select where to distribute
   - Pricing: Free with in-app purchases

4. Click "Send for Review"

**Timeline**: Google review takes 1-7 days typically

---

## 💰 Part 3: Setting Up Subscriptions

### For iOS (App Store Connect):

1. Go to App Store Connect → Your App → "In-App Purchases"
2. Click "+" to create new subscription
3. Choose "Auto-Renewable Subscription"
4. Fill in:
   - **Reference Name**: Nutrion Premium
   - **Product ID**: com.yourname.nutrion.premium
   - **Subscription Group**: Create new group
   - **Price**: $2/month
5. Add localized descriptions
6. Submit for review

### For Android (Google Play Console):

1. Go to Google Play Console → Your App → "Monetize" → "Subscriptions"
2. Click "Create subscription"
3. Fill in:
   - **Product ID**: nutrion_premium
   - **Name**: Nutrion Premium
   - **Description**: Access to Receipt Scanner and AI Meal Generator
   - **Price**: $2/month
4. Save and activate

---

## 🔧 Part 4: Troubleshooting Common Issues

### Issue: "Apple ID credentials not found"
**Solution**: Make sure you've updated `eas.json` with your Apple credentials (see Part 1, Step 2)

### Issue: "Build failed"
**Solution**: 
- Check the build logs in the EAS dashboard
- Make sure all dependencies are installed
- Try running `npm install` and rebuilding

### Issue: "App rejected by Apple"
**Solution**: 
- Read the rejection reason carefully
- Common issues: missing privacy policy, unclear app description, bugs
- Fix the issues and resubmit

### Issue: "Can't upload to Google Play"
**Solution**: 
- Make sure you've created the service account key
- Verify the JSON file path is correct
- Check that API access is enabled in Google Play Console

---

## 📱 Part 5: Testing Before Submission

### iOS Testing (TestFlight):

Before submitting to the App Store, test with TestFlight:

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --latest
```

Then:
1. Go to App Store Connect → TestFlight
2. Add internal testers (up to 100)
3. Share the TestFlight link with testers
4. Get feedback before public release

### Android Testing (Internal Testing):

1. In Google Play Console, go to "Testing" → "Internal testing"
2. Create a new release
3. Upload your APK/AAB
4. Add testers by email
5. Share the testing link
6. Get feedback before public release

---

## ✅ Checklist: Before You Submit

### iOS Checklist:
- [ ] Apple Developer Account active ($99/year paid)
- [ ] App created in App Store Connect
- [ ] Bundle ID matches in app.json and App Store Connect
- [ ] Apple credentials added to eas.json
- [ ] App icon is 1024x1024 PNG
- [ ] Screenshots prepared (5-10 images)
- [ ] Privacy policy URL ready
- [ ] App description written
- [ ] Subscription set up in App Store Connect
- [ ] Tested on TestFlight

### Android Checklist:
- [ ] Google Play Console account created ($25 paid)
- [ ] App created in Google Play Console
- [ ] Service account JSON key downloaded
- [ ] App icon is 512x512 PNG
- [ ] Feature graphic is 1024x500 PNG
- [ ] Screenshots prepared (at least 2)
- [ ] Privacy policy URL ready
- [ ] App description written
- [ ] Content rating completed
- [ ] Subscription set up in Google Play Console
- [ ] Tested with internal testing

---

## 🎉 Part 6: After Approval

Once your app is approved:

1. **Monitor Reviews**: Check App Store and Google Play for user reviews
2. **Track Analytics**: Use App Store Connect and Google Play Console analytics
3. **Update Regularly**: Fix bugs and add features with new builds
4. **Respond to Users**: Reply to reviews and support emails

### How to Update Your App:

When you need to release an update:

```bash
# Update version in app.json first
# Then build and submit

# For iOS:
eas build --platform ios --profile production
eas submit --platform ios --latest

# For Android:
eas build --platform android --profile production
eas submit --platform android --latest
```

---

## 📞 Getting Help

If you get stuck:

1. **EAS Documentation**: https://docs.expo.dev/eas/
2. **Expo Forums**: https://forums.expo.dev/
3. **Apple Developer Support**: https://developer.apple.com/support/
4. **Google Play Support**: https://support.google.com/googleplay/android-developer/

---

## 🎯 Quick Command Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Submit iOS
eas submit --platform ios --latest

# Submit Android
eas submit --platform android --latest

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

---

## 💡 Important Notes

1. **First-time setup takes longer**: Your first build and submission will take more time as you set everything up. Subsequent updates are much faster.

2. **Keep credentials safe**: Never share your Apple ID password, service account keys, or API keys publicly.

3. **Version numbers**: Each new build must have a higher version number than the previous one. Update in `app.json`:
   ```json
   {
     "version": "1.0.1",
     "ios": { "buildNumber": "2" },
     "android": { "versionCode": 2 }
   }
   ```

4. **Subscription testing**: Test subscriptions in sandbox mode before going live. Apple and Google provide test accounts for this.

5. **Privacy policy required**: Both app stores require a privacy policy URL. You can use free generators online or hire someone to write one.

---

## 🚀 You're Ready!

Follow these steps in order, and you'll have your Nutrion app live on both app stores. Take it one step at a time, and don't hesitate to ask for help if you get stuck.

Good luck with your app launch! 🎉

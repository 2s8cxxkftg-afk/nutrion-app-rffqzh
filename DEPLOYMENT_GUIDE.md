
# Nutrion App Deployment Guide

## 🚨 CRITICAL: iOS Crash Fix Required BEFORE Deployment

### The app currently crashes on iOS due to an incompatible dependency

**YOU MUST DO THIS FIRST:**

1. **Remove react-native-maps from package.json**
   ```bash
   # Open package.json and DELETE this line:
   "react-native-maps": "^1.20.1",
   ```

2. **Reinstall dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Why this is critical:**
   - `react-native-maps` is NOT supported in Natively
   - It causes immediate crashes on iOS launch
   - The app WILL NOT pass App Store review with this bug
   - Must be removed before building for production

### Additional Fixes Already Applied:
✅ Enhanced error handling throughout the app
✅ Added timeouts to prevent hanging operations
✅ Improved platform-specific code safety
✅ Better async initialization with error recovery
✅ Widget context safety checks
✅ Notification initialization improvements

---

## Prerequisites

Before you can deploy to the App Store and Play Store, you need to complete these setup steps:

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure EAS Project

Run this command to create your EAS project and get your project ID:
```bash
eas build:configure
```

This will:
- Create an EAS project
- Generate a project ID
- Update your app.json automatically

### 4. iOS App Store Setup

#### A. Create App Store Connect Account
1. Go to https://developer.apple.com
2. Enroll in Apple Developer Program ($99/year)
3. Create an App ID for "com.nutrion.app"

#### B. Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in app information:
   - Platform: iOS
   - Name: Nutrion
   - Primary Language: English
   - Bundle ID: com.nutrion.app
   - SKU: nutrion-app-001
4. Note your **App Store Connect App ID** (found in App Information)

#### C. Get Your Apple Team ID
1. Go to https://developer.apple.com/account
2. Click "Membership" in the sidebar
3. Copy your **Team ID**

#### D. Update eas.json
Replace these values in `eas.json`:
- `REPLACE_WITH_YOUR_APPLE_ID` → Your Apple ID email
- `REPLACE_WITH_YOUR_APP_STORE_CONNECT_APP_ID` → The App ID from step B
- `REPLACE_WITH_YOUR_APPLE_TEAM_ID` → The Team ID from step C

### 5. Google Play Store Setup

#### A. Create Google Play Console Account
1. Go to https://play.google.com/console
2. Pay one-time $25 registration fee
3. Create a new app:
   - App name: Nutrion
   - Default language: English
   - App or game: App
   - Free or paid: Free

#### B. Create Service Account for API Access
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new project or select existing
3. Enable "Google Play Android Developer API"
4. Go to "IAM & Admin" → "Service Accounts"
5. Click "Create Service Account"
6. Name it "nutrion-play-store-deploy"
7. Click "Create and Continue"
8. Grant role: "Service Account User"
9. Click "Done"
10. Click on the service account you just created
11. Go to "Keys" tab → "Add Key" → "Create new key"
12. Choose JSON format
13. Download the JSON file
14. Rename it to `google-play-service-account.json`
15. Place it in your project root (same folder as package.json)

#### C. Link Service Account to Play Console
1. Go back to Google Play Console
2. Go to "Setup" → "API access"
3. Click "Link" next to your Google Cloud project
4. Grant access to the service account:
   - Click "Grant access" next to your service account
   - Select "Admin (all permissions)" or at minimum:
     - View app information
     - Manage production releases
     - Manage testing track releases
   - Click "Invite user"

#### D. Add App to Play Console
1. In Play Console, go to your app
2. Complete the store listing:
   - App name: Nutrion
   - Short description: Manage your pantry and reduce food waste
   - Full description: (Add detailed description)
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Screenshots: At least 2 screenshots
3. Complete content rating questionnaire
4. Set up pricing & distribution
5. Complete privacy policy (required)

### 6. Build Your App

#### For iOS:
```bash
npm run build:ios
```

#### For Android:
```bash
npm run build:android
```

### 7. Submit to Stores

#### Submit to App Store:
```bash
npm run submit:ios
```

#### Submit to Play Store:
```bash
npm run submit:android
```

## Important Notes

### App Icons
- iOS requires 1024x1024 PNG (no transparency)
- Android requires 512x512 PNG
- Current icon: `./assets/images/final_quest_240x240.png` needs to be replaced with proper 1024x1024 icon

### Privacy Policy
Both stores require a privacy policy URL. You need to:
1. Create a privacy policy document
2. Host it on a public URL
3. Add the URL to your store listings

### App Store Review
- iOS review takes 1-3 days
- Android review takes 1-7 days
- Make sure your app works perfectly before submitting

### Version Updates
To release updates:
1. Update version in `app.json`:
   - iOS: Increment `buildNumber`
   - Android: Increment `versionCode`
   - Both: Update `version` (e.g., "1.0.0" → "1.0.1")
2. Build again
3. Submit again

## Troubleshooting

### "Invalid Bundle Identifier" (iOS)
- Make sure bundle ID matches exactly: `com.nutrion.app`
- Verify it's registered in Apple Developer Portal

### "Package name already exists" (Android)
- Package name must be unique globally
- If taken, change in app.json: `"package": "com.yourcompany.nutrion"`

### Build Fails
- Run `eas build:configure` again
- Check that all dependencies are compatible with Expo 54
- Review build logs in EAS dashboard

### Submission Fails
- Verify all credentials are correct in eas.json
- Check that service account has proper permissions
- Ensure app meets store guidelines

## Next Steps After Deployment

1. Monitor crash reports in App Store Connect / Play Console
2. Respond to user reviews
3. Plan feature updates
4. Track analytics
5. Optimize app store listing based on performance

## Support

- EAS Documentation: https://docs.expo.dev/eas/
- App Store Connect Help: https://developer.apple.com/support/app-store-connect/
- Play Console Help: https://support.google.com/googleplay/android-developer/

Good luck with your deployment! 🚀

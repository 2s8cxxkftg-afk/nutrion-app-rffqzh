
# iOS Deployment Checklist - Nutrion

## 🔴 Pre-Build Requirements (MUST DO)

- [ ] **Remove react-native-maps**: `npm uninstall react-native-maps`
- [ ] **Clean install**: `rm -rf node_modules && npm install`
- [ ] **Clear cache**: `npx expo start --clear`
- [ ] **Verify .env file** exists with Supabase credentials
- [ ] **Test in Expo Go**: `npm run ios` (should launch without crash)

## 🟡 EAS Setup (Required for TestFlight)

- [ ] **Install EAS CLI**: `npm install -g eas-cli`
- [ ] **Login to Expo**: `eas login`
- [ ] **Initialize project**: `eas init` (updates projectId in app.json)
- [ ] **Configure Apple Developer account** in eas.json:
  - [ ] Add Apple ID email
  - [ ] Add App Store Connect App ID
  - [ ] Add Apple Team ID

## 🟢 Build & Test

### Development Build (Simulator)
- [ ] **Build**: `eas build --platform ios --profile development`
- [ ] **Install on simulator**
- [ ] **Test all features** (see testing checklist below)

### Production Build (TestFlight)
- [ ] **Build**: `eas build --platform ios --profile production`
- [ ] **Submit**: `eas submit --platform ios`
- [ ] **Wait for processing** (Apple takes 10-30 minutes)
- [ ] **Add testers** in App Store Connect
- [ ] **Test on real device** via TestFlight

## ✅ Feature Testing Checklist

### Core Functionality
- [ ] App launches without crashing
- [ ] Introduction screens display correctly
- [ ] Can skip or complete introduction
- [ ] Sign up with email works
- [ ] Email verification works (check inbox)
- [ ] Sign in with email works
- [ ] Forgot password flow works
- [ ] Password reset via email works

### Navigation
- [ ] Pantry tab loads and displays items
- [ ] Shopping tab loads and displays items
- [ ] Profile tab loads and displays user info
- [ ] Tab bar highlights active tab correctly
- [ ] Can navigate between tabs smoothly
- [ ] Back navigation works on all screens

### Pantry Management
- [ ] Can add new pantry item
- [ ] Can edit existing item
- [ ] Can delete item (with confirmation)
- [ ] Items display with correct expiration status
- [ ] Expiration colors work (green/yellow/red)
- [ ] Search/filter works
- [ ] Pull to refresh works

### Shopping List
- [ ] Can add shopping item
- [ ] Can mark item as completed
- [ ] Can delete item
- [ ] Can clear completed items
- [ ] Items sync correctly

### Camera & Scanning
- [ ] Camera permission request shows
- [ ] Camera opens without crash
- [ ] Can take photo
- [ ] Can select from photo library
- [ ] Receipt scanning works (premium)
- [ ] Barcode scanning works

### Notifications
- [ ] Notification permission request shows
- [ ] Can enable/disable notifications
- [ ] Expiration alerts work
- [ ] Daily reminders work (if enabled)
- [ ] Notification settings save correctly

### Premium Features
- [ ] AI Recipe Generator works
- [ ] Receipt Scanner works
- [ ] Subscription status displays correctly
- [ ] Premium badge shows on features

### Profile & Settings
- [ ] Profile displays user email
- [ ] Can edit profile
- [ ] Can change password
- [ ] Notification settings work
- [ ] Can sign out
- [ ] Sign out clears session correctly

### UI/UX
- [ ] Dark mode works correctly
- [ ] Light mode works correctly
- [ ] Animations are smooth
- [ ] No UI glitches or overlaps
- [ ] Tab bar doesn't cover content
- [ ] Safe areas respected (notch, home indicator)
- [ ] Keyboard doesn't cover inputs
- [ ] Loading states show correctly
- [ ] Error messages display correctly
- [ ] Success messages display correctly

### Offline Functionality
- [ ] App works without internet
- [ ] Local storage persists data
- [ ] Offline indicator shows (if implemented)
- [ ] Data syncs when back online

### Deep Links
- [ ] Password reset link opens app
- [ ] Deep link navigates to correct screen
- [ ] Session is restored from link

## 🔍 Console Log Verification

After launching, verify these logs appear:

```
✅ Expected Logs:
[Index] Platform: ios
[Index] === Checking App Status ===
[Supabase] ✅ Client initialized with URL: https://...
[AuthProvider] Initializing on platform: ios
[i18n] Initialized successfully
[RootLayout] Fonts loaded, hiding splash screen
[Index] Navigation ready - proceeding immediately
[Index] → /introduction (or /auth or /(tabs)/pantry)

❌ Bad Logs (Indicate Problems):
=== GLOBAL ERROR CAUGHT === (app crashed)
timeout (network or async operation too slow)
undefined is not an object (missing data)
Cannot read property (null reference)
```

## 📱 Device Testing

### Simulator Testing
- [ ] iPhone 15 Pro (iOS 17)
- [ ] iPhone 14 (iOS 16)
- [ ] iPad Pro (iOS 17)

### Real Device Testing (via TestFlight)
- [ ] iPhone with iOS 14.0+ (minimum supported)
- [ ] iPhone with iOS 17+ (latest)
- [ ] iPad (if supporting tablets)

## 🚀 Deployment Steps

### Step 1: Pre-Flight Check
```bash
# Verify everything is ready
npm run lint
npx tsc --noEmit
npx expo-doctor
```

### Step 2: Build for TestFlight
```bash
# Build production version
eas build --platform ios --profile production

# Wait for build to complete (10-20 minutes)
# You'll get a URL to download the .ipa file
```

### Step 3: Submit to TestFlight
```bash
# Submit to App Store Connect
eas submit --platform ios

# Or manually upload via Xcode/Transporter
```

### Step 4: Configure in App Store Connect
- [ ] Add app description
- [ ] Add screenshots
- [ ] Add privacy policy URL
- [ ] Add support URL
- [ ] Set age rating
- [ ] Add test users
- [ ] Submit for review (if going to App Store)

## 🎯 Success Criteria

Your app is ready for iOS when ALL of these are true:

- ✅ react-native-maps is removed from package.json
- ✅ App launches without crashing
- ✅ All tabs navigate correctly
- ✅ Can add/edit/delete items
- ✅ Camera works
- ✅ Notifications work
- ✅ No ERROR logs in console
- ✅ Works in both light and dark mode
- ✅ Works offline
- ✅ Deep links work
- ✅ Sign out works
- ✅ All features tested on real device

## 📊 Build Status

Track your build progress:

- [ ] Development build successful
- [ ] Tested on simulator
- [ ] All features working
- [ ] Production build successful
- [ ] Submitted to TestFlight
- [ ] TestFlight processing complete
- [ ] Tested on real device via TestFlight
- [ ] All testers can install and use
- [ ] Ready for App Store submission

## 🆘 If Something Goes Wrong

### Build Fails
1. Check console output for specific error
2. Run `npx expo-doctor`
3. Verify all dependencies are installed
4. Check eas.json configuration
5. See `IOS_TROUBLESHOOTING.md`

### App Crashes on Device
1. Check TestFlight crash logs
2. Look for `[ComponentName]` logs in Xcode console
3. Verify all permissions are granted
4. Test on different iOS version
5. Contact support with crash logs

### Features Don't Work
1. Check console logs for ERROR messages
2. Verify Supabase credentials
3. Check internet connection
4. Test in Expo Go first
5. See feature-specific troubleshooting in `IOS_TROUBLESHOOTING.md`

## 📞 Support

- **Email**: hello@solvralabs.net
- **Include**: 
  - Console logs (especially ERROR messages)
  - iOS version
  - Device model
  - Steps to reproduce
  - Screenshots/videos if applicable

## 🎉 Final Notes

All iOS-specific issues have been addressed in the code:
- ✅ Enhanced logging for debugging
- ✅ Better error handling
- ✅ Timeout protection
- ✅ Platform-specific optimizations
- ✅ Stable widget context
- ✅ Proper deep link support
- ✅ Consistent bundle identifiers
- ✅ Missing base files created

**The ONLY remaining manual step is removing react-native-maps.**

After that, your app should work perfectly on iOS! 🚀

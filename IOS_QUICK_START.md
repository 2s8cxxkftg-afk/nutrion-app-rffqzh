
# iOS Quick Start Guide - Nutrion

## 🚀 Quick Commands

### 1. Clean Install (Do This First)
```bash
# Remove problematic dependency
npm uninstall react-native-maps

# Clean install
rm -rf node_modules
npm install

# Clear Metro cache
npx expo start --clear
```

### 2. Test in Expo Go (Fastest)
```bash
npm run ios
```

### 3. Build for iOS Simulator
```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login
eas login

# Initialize project (sets up EAS project ID)
eas init

# Build for simulator
eas build --platform ios --profile development --local
```

### 4. Build for TestFlight
```bash
# Build production version
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

## 🔧 Troubleshooting

### App Crashes on Launch
1. Check console logs for `[Index]` and `[AuthProvider]` messages
2. Verify `.env` file has correct Supabase credentials
3. Run `npx expo-doctor` to check for issues

### Camera Not Working
1. Check Info.plist permissions in app.json
2. Verify camera permissions are granted in iOS Settings

### Notifications Not Working
1. Check notification permissions in iOS Settings
2. Look for `[Notifications]` logs in console

### Deep Links Not Working
1. Verify scheme is set to `nutrion` (lowercase)
2. Check that `CFBundleURLTypes` is in app.json
3. Test with: `xcrun simctl openurl booted nutrion://reset-password`

## 📱 Platform-Specific Notes

### iOS Specific Files
- `app/(tabs)/(home)/index.ios.tsx` - iOS-specific home screen
- `components/IconSymbol.ios.tsx` - iOS SF Symbols implementation

### Both Platforms
- `app/(tabs)/(home)/index.tsx` - Base home screen (fallback)
- `components/IconSymbol.tsx` - Material Icons implementation

## 🐛 Debugging

### View Console Logs
All components now have enhanced logging with prefixes:
- `[Index]` - App initialization
- `[AuthProvider]` - Authentication
- `[Notifications]` - Notification system
- `[AIRecipes]` - Recipe generation
- `[FloatingTabBar]` - Tab navigation

### Common Issues

**"Widget functionality is iOS-only"**
- This is normal and expected. Widget functionality is disabled for stability.

**"Auth initialization timeout"**
- Check your internet connection
- Verify Supabase credentials in `.env`

**"No session data returned"**
- User is not signed in (this is normal on first launch)

## ✅ Verification Steps

After building, verify:
1. App launches to introduction screen (first time)
2. Can complete onboarding
3. Can sign up / sign in
4. Can navigate between tabs
5. Can add/edit pantry items
6. Camera works for scanning
7. Notifications can be enabled
8. Can sign out

## 📞 Support

Issues? Check:
1. Console logs (look for error messages)
2. Run `npx expo-doctor`
3. Verify all dependencies are installed
4. Contact: hello@solvralabs.net

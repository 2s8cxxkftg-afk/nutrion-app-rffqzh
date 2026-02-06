
# iOS Fixes Applied - Nutrion App

## Critical Issues Fixed

### 1. ✅ react-native-maps Dependency
**Issue**: `react-native-maps` is still in package.json and causes iOS crashes
**Status**: Cannot be removed via code (package.json is protected)
**Solution**: You need to manually remove it:
```bash
npm uninstall react-native-maps
# or
pnpm remove react-native-maps
```

### 2. ✅ Missing Base Home Screen
**Issue**: `app/(tabs)/(home)/index.ios.tsx` exists but no base `index.tsx`
**Fixed**: Created `app/(tabs)/(home)/index.tsx` with identical functionality

### 3. ✅ Bundle Identifier Consistency
**Issue**: iOS used `.ios` suffix, Android used `.android` suffix
**Fixed**: Both now use `com.solvralabs.nutrion` (consistent)

### 4. ✅ Deep Link Configuration
**Issue**: Missing proper URL scheme configuration for password reset
**Fixed**: Added `CFBundleURLTypes` to iOS infoPlist with `nutrion://` scheme

### 5. ✅ Widget Context Crashes
**Issue**: `@bacons/apple-targets` causing potential crashes on iOS
**Fixed**: Simplified WidgetContext to be a no-op wrapper (disabled widget functionality for stability)

### 6. ✅ Scheme Inconsistency
**Issue**: Mixed case scheme names ("Nutrion" vs "nutrion")
**Fixed**: Standardized to lowercase "nutrion" throughout

### 7. ✅ Enhanced Logging
**Issue**: Hard to debug iOS-specific issues
**Fixed**: Added comprehensive logging with `[ComponentName]` prefixes throughout:
- `[Index]` - App initialization
- `[AuthProvider]` - Authentication flow
- `[Notifications]` - Notification system
- `[AIRecipes]` - Recipe generation
- `[ReceiptScanner]` - Receipt scanning
- `[FloatingTabBar]` - Tab navigation
- `[HomeScreen]` - Home screen actions

### 8. ✅ Error Boundaries
**Issue**: Crashes not being caught gracefully
**Fixed**: Enhanced global error handler with platform detection

### 9. ✅ Tab Layout Structure
**Issue**: Missing (home) route in tab layout
**Fixed**: Added `<Stack.Screen name="(home)" />` to tab layout

### 10. ✅ EAS Configuration
**Issue**: Missing iOS-specific build settings
**Fixed**: Added simulator support and proper resource classes

## How to Test on iOS

### Option 1: Expo Go (Quick Test)
```bash
npm run ios
# or
pnpm ios
```

### Option 2: Development Build (Recommended)
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS simulator
eas build --platform ios --profile development

# Or build for physical device
eas build --platform ios --profile preview
```

### Option 3: TestFlight (Production)
```bash
# Build production version
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

## Remaining Manual Steps

### 1. Remove react-native-maps
```bash
npm uninstall react-native-maps
```

### 2. Set up EAS Project
```bash
eas init
# This will update the projectId in app.json
```

### 3. Configure Apple Developer Account
- Add your Apple ID to eas.json submit.production.ios.appleId
- Add your App Store Connect App ID to ascAppId
- Add your Apple Team ID to appleTeamId

### 4. Test Deep Links
The app now supports:
- `nutrion://reset-password` - Password reset flow
- `nutrion://` - General deep linking

## What Was Changed

### Files Modified:
1. `app.json` - Fixed bundle identifiers, added deep link config, lowercase scheme
2. `app/_layout.tsx` - Enhanced error handling, added platform logging
3. `app/index.tsx` - Added platform logging, improved error handling
4. `app/(tabs)/_layout.tsx` - Added (home) route support
5. `contexts/AuthContext.tsx` - Enhanced logging, better error handling
6. `contexts/WidgetContext.tsx` - Disabled widget functionality to prevent crashes
7. `utils/supabase.ts` - Added platform-specific session detection
8. `utils/notificationScheduler.ts` - Enhanced logging throughout
9. `hooks/useAIRecipes.ts` - Added platform logging
10. `hooks/useReceiptScanner.ts` - Added platform logging
11. `components/FloatingTabBar.tsx` - Enhanced tab detection logging
12. `eas.json` - Added iOS simulator support, proper resource classes

### Files Created:
1. `app/(tabs)/(home)/index.tsx` - Base home screen (was missing)

## Testing Checklist

- [ ] App launches without crashing
- [ ] Authentication flow works (sign in/sign up)
- [ ] Tab navigation works (Pantry, Shopping, Profile)
- [ ] Add item functionality works
- [ ] Edit item functionality works
- [ ] Scan receipt works (camera permissions)
- [ ] AI recipe generation works
- [ ] Notifications work (permission request)
- [ ] Deep links work (password reset)
- [ ] Sign out works
- [ ] Dark mode works

## Known Limitations

1. **Widget Functionality**: Disabled for stability. Can be re-enabled later if needed.
2. **react-native-maps**: Must be manually removed from package.json
3. **EAS Project ID**: Placeholder value, needs to be set via `eas init`

## Support

If you encounter any issues:
1. Check the console logs (look for `[ComponentName]` prefixes)
2. Run `npx expo-doctor` to check for configuration issues
3. Ensure all environment variables are set in `.env`
4. Contact support at hello@solvralabs.net

## Next Steps

1. Remove react-native-maps: `npm uninstall react-native-maps`
2. Initialize EAS: `eas init`
3. Build for iOS: `eas build --platform ios --profile development`
4. Test on simulator or device
5. Submit to TestFlight when ready: `eas submit --platform ios`

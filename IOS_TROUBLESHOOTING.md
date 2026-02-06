
# iOS Troubleshooting Guide - Nutrion

## 🔴 Critical Issues & Solutions

### Issue 1: App Crashes on Launch
**Symptoms**: App opens then immediately closes

**Solutions**:
1. **Remove react-native-maps** (MOST COMMON CAUSE):
   ```bash
   npm uninstall react-native-maps
   rm -rf node_modules
   npm install
   ```

2. **Clear all caches**:
   ```bash
   npx expo start --clear
   rm -rf node_modules/.cache
   rm -rf .expo
   ```

3. **Check console logs**:
   - Look for `[Index]` logs to see if app is initializing
   - Look for `[AuthProvider]` logs to see if auth is working
   - Look for any `GLOBAL ERROR CAUGHT` messages

### Issue 2: White Screen / Stuck on Splash
**Symptoms**: App shows splash screen but never loads

**Solutions**:
1. **Check AsyncStorage**:
   ```bash
   # Reset onboarding flag
   # In app, go to Settings > Clear Data
   ```

2. **Check Supabase connection**:
   - Verify `.env` file exists with correct credentials
   - Look for `[Supabase]` logs showing "✅ Client initialized"

3. **Timeout issues**:
   - All async operations now have 3-5 second timeouts
   - If you see "timeout" in logs, it's a network issue

### Issue 3: Tabs Not Working
**Symptoms**: Can't navigate between tabs

**Solutions**:
1. **Check FloatingTabBar logs**:
   - Look for `[FloatingTabBar]` messages showing current pathname
   - Verify active tab index is being calculated

2. **Verify routes exist**:
   - `app/(tabs)/pantry.tsx` ✅
   - `app/(tabs)/shopping.tsx` ✅
   - `app/(tabs)/profile.tsx` ✅
   - `app/(tabs)/(home)/index.tsx` ✅ (NEW)
   - `app/(tabs)/(home)/index.ios.tsx` ✅

### Issue 4: Camera Not Working
**Symptoms**: Camera permission denied or black screen

**Solutions**:
1. **Check permissions in app.json**:
   - `NSCameraUsageDescription` is set ✅
   - `NSPhotoLibraryUsageDescription` is set ✅

2. **Grant permissions manually**:
   - iOS Settings > Nutrion > Camera > Allow
   - iOS Settings > Nutrion > Photos > All Photos

3. **Check logs**:
   - Look for camera permission request logs
   - Verify expo-camera is installed

### Issue 5: Notifications Not Working
**Symptoms**: No notification permission prompt or notifications not showing

**Solutions**:
1. **Check notification logs**:
   - Look for `[Notifications]` prefix in console
   - Verify "Permission status: granted" message

2. **Manual permission grant**:
   - iOS Settings > Nutrion > Notifications > Allow

3. **Timeout handling**:
   - Permission requests now have 5-second timeout
   - App continues even if notifications fail

### Issue 6: Deep Links Not Working
**Symptoms**: Password reset links don't open app

**Solutions**:
1. **Verify scheme configuration**:
   - app.json has `"scheme": "nutrion"` ✅
   - CFBundleURLTypes is configured ✅

2. **Test deep link**:
   ```bash
   # In simulator
   xcrun simctl openurl booted nutrion://reset-password
   ```

3. **Check logs**:
   - Look for "Deep link received" messages
   - Verify URL parsing is working

## 🟡 Common Warnings (Safe to Ignore)

### "Widget functionality is iOS-only"
- **Status**: Normal
- **Reason**: Widget feature is disabled for stability
- **Action**: None needed

### "Auth initialization timeout"
- **Status**: May indicate network issue
- **Reason**: Supabase connection taking too long
- **Action**: Check internet connection and Supabase credentials

### "props.pointerEvents is deprecated"
- **Status**: Normal (React Native warning)
- **Reason**: Library using old API
- **Action**: None needed (will be fixed in library updates)

### "shadow* style props are deprecated"
- **Status**: Normal (React Native warning)
- **Reason**: Using old shadow API
- **Action**: None needed (already using boxShadow where possible)

## 🟢 Verification Checklist

After applying fixes, verify:

- [ ] App launches without crashing
- [ ] Introduction screens show correctly
- [ ] Can sign up with email
- [ ] Can sign in with email
- [ ] Tabs navigate correctly (Pantry, Shopping, Profile)
- [ ] Can add pantry items
- [ ] Can edit pantry items
- [ ] Can delete pantry items
- [ ] Camera opens for scanning
- [ ] Notifications can be enabled
- [ ] Can sign out
- [ ] Deep links work (password reset)
- [ ] Dark mode works
- [ ] App works offline (local storage)

## 📊 Log Prefixes Reference

When debugging, look for these prefixes in console:

- `[Index]` - App initialization and routing
- `[AuthProvider]` - Authentication state management
- `[Supabase]` - Supabase client operations
- `[Notifications]` - Notification system
- `[AIRecipes]` - AI recipe generation
- `[ReceiptScanner]` - Receipt scanning
- `[FloatingTabBar]` - Tab navigation
- `[HomeScreen]` - Home screen actions
- `[i18n]` - Internationalization
- `[SplashScreen]` - Splash screen operations
- `[RootLayout]` - Root layout initialization
- `[Toast]` - Toast notifications

## 🔧 Advanced Debugging

### Enable Verbose Logging
All components now log their operations. To see everything:
1. Open app in Expo Go or development build
2. Watch console for `[ComponentName]` prefixes
3. Look for ERROR or WARN messages

### Check Specific Component
Example: To debug authentication:
```
# Look for these logs:
[AuthProvider] Initializing on platform: ios
[AuthProvider] Getting initial session...
[AuthProvider] Auth initialized, user: none
[AuthProvider] Auth state changed: INITIAL_SESSION
```

### Network Issues
If you see timeout errors:
1. Check internet connection
2. Verify Supabase URL is reachable
3. Check firewall/VPN settings
4. Try on different network

## 📱 Building for iOS

### Development Build (Simulator)
```bash
eas build --platform ios --profile development --local
```

### Production Build (TestFlight)
```bash
eas build --platform ios --profile production
```

### Submit to TestFlight
```bash
eas submit --platform ios
```

## 🆘 Still Having Issues?

1. **Check all logs** - Look for ERROR messages with component prefixes
2. **Run diagnostics**: `npx expo-doctor`
3. **Clean everything**:
   ```bash
   rm -rf node_modules
   rm -rf .expo
   npm install
   npx expo start --clear
   ```
4. **Contact support**: hello@solvralabs.net with:
   - Console logs (especially ERROR messages)
   - Platform (iOS version)
   - Steps to reproduce
   - Screenshots if applicable

## 📝 Changes Made

See `IOS_FIXES_APPLIED.md` for complete list of changes.

Key improvements:
- ✅ Enhanced logging throughout app
- ✅ Better error handling with timeouts
- ✅ Fixed bundle identifiers
- ✅ Added deep link support
- ✅ Disabled problematic widget functionality
- ✅ Created missing base home screen
- ✅ Improved tab navigation
- ✅ Platform-specific optimizations

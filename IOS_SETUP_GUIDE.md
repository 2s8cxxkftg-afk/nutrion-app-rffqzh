
# iOS Setup Guide for Nutrion

## Current Status
✅ SMTP Configuration: Password reset flow is correctly implemented
✅ Deep Linking: Configured with `nutrion://` scheme
❌ iOS Native Project: Not yet generated (required for iOS testing)

## Steps to Enable iOS Testing

### 1. Generate iOS Native Project
Run this command in your terminal to generate the iOS native files:

```bash
npx expo prebuild --platform ios
```

This will create the `ios/` folder with all necessary native iOS files including:
- Xcode project files
- Podfile for CocoaPods dependencies
- Native configuration for deep linking
- Info.plist with camera/photo permissions

### 2. Install iOS Dependencies
After prebuild completes, install the iOS native dependencies:

```bash
cd ios && pod install && cd ..
```

### 3. Run on iOS
You can now test on iOS using:

**iOS Simulator:**
```bash
npm run ios
```

**Physical iOS Device:**
1. Open `ios/Nutrion.xcworkspace` in Xcode
2. Select your device from the device dropdown
3. Click the Run button (▶️)

### 4. Verify Deep Linking on iOS
The password reset deep link (`nutrion://reset-password`) should now work on iOS.

Test it by:
1. Requesting a password reset email
2. Opening the email on your iOS device
3. Tapping the reset link
4. The app should open to the reset-password screen

## Supabase Configuration Checklist

Make sure these are configured in your Supabase Dashboard:

### Authentication → URL Configuration
Add these redirect URLs:
- `nutrion://reset-password` (for native iOS/Android)
- `exp://localhost:8081/--/reset-password` (for Expo Go development)
- `http://localhost:8081/reset-password` (for web development)

### Authentication → Email Templates
Enable "Reset Password" email template with:
- Subject: "Reset your Nutrion password"
- Confirmation URL: `{{ .ConfirmationURL }}`

### Authentication → SMTP Settings
Configure custom SMTP or use Supabase's built-in email service.

## Troubleshooting

### Issue: "No bundle URL present"
**Solution:** Make sure Metro bundler is running (`npm run dev`)

### Issue: "Command PhaseScriptExecution failed"
**Solution:** Clean build folder in Xcode (Cmd+Shift+K) and rebuild

### Issue: Deep link not opening app
**Solution:** 
1. Verify scheme is `nutrion` (lowercase) in app.json
2. Rebuild the app after changing app.json
3. Check Supabase redirect URLs match exactly

### Issue: "Unable to resolve module"
**Solution:** 
```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

## Next Steps

1. Run `npx expo prebuild --platform ios` to generate iOS project
2. Test password reset flow on iOS simulator
3. Test on physical iOS device if available
4. Verify all features work correctly on iOS

## Notes

- The iOS project files are gitignored by default
- You'll need to run `npx expo prebuild` again after:
  - Changing app.json configuration
  - Adding new native dependencies
  - Updating Expo SDK version
- For production builds, use EAS Build: `npm run build:ios`

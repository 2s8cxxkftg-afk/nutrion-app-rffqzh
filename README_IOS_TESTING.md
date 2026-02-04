
# 🍎 iOS Testing Setup for Nutrion

## ✅ What's Already Done

1. **SMTP Configuration**: Password reset emails are configured correctly
2. **Deep Linking**: The app is configured with `nutrion://` scheme for password reset
3. **Password Reset Flow**: Both screens (`forgot-password.tsx` and `reset-password.tsx`) are implemented
4. **Android Support**: Android native project is already generated and ready

## 🚀 What You Need to Do to Test on iOS

### Step 1: Generate iOS Native Project

The iOS native files don't exist yet. Run this command to generate them:

```bash
npx expo prebuild --platform ios
```

This will create the `ios/` folder with:
- Xcode project files (`.xcodeproj` and `.xcworkspace`)
- Podfile for managing iOS dependencies
- Native configuration for deep linking
- All required permissions (camera, photos, etc.)

### Step 2: Install iOS Dependencies

After prebuild completes, install the CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

### Step 3: Run on iOS

**Option A: iOS Simulator (Recommended for Testing)**
```bash
npm run ios
```

This will:
- Start Metro bundler
- Build the app
- Launch iOS Simulator
- Install and run the app

**Option B: Physical iOS Device**
1. Open `ios/Nutrion.xcworkspace` in Xcode (NOT .xcodeproj)
2. Connect your iPhone via USB
3. Select your device from the device dropdown
4. Click the Run button (▶️)
5. You may need to trust your developer certificate on the device

### Step 4: Test Password Reset on iOS

1. **Request Password Reset:**
   - Open the app on iOS
   - Go to login screen
   - Tap "Forgot Password?"
   - Enter your email
   - Tap "Send Reset Link"

2. **Check Email:**
   - Open the email on your iOS device
   - You should receive a password reset email from Supabase

3. **Test Deep Link:**
   - Tap the reset link in the email
   - The app should automatically open to the reset-password screen
   - Enter your new password
   - Tap "Reset Password"
   - You should be signed in and redirected to the pantry

## 🔧 Supabase Dashboard Configuration

Make sure these are configured in your Supabase Dashboard:

### 1. Redirect URLs (Authentication → URL Configuration)
Add these URLs:
```
nutrion://reset-password
exp://localhost:8081/--/reset-password
http://localhost:8081/reset-password
```

### 2. Email Template (Authentication → Email Templates)
Enable "Reset Password" template with:
- **Subject:** Reset your Nutrion password
- **Body:** Include `{{ .ConfirmationURL }}` button/link

### 3. SMTP Settings (Authentication → SMTP)
Either:
- Use Supabase's built-in email service (default)
- OR configure custom SMTP (Gmail, SendGrid, etc.)

## 🐛 Troubleshooting

### "No bundle URL present" Error
**Cause:** Metro bundler not running
**Fix:** Run `npm run dev` in a separate terminal

### "Command PhaseScriptExecution failed"
**Cause:** Build cache issue
**Fix:** 
```bash
cd ios
rm -rf build
pod deintegrate
pod install
cd ..
```

### Deep Link Not Opening App
**Cause:** Scheme mismatch or app not rebuilt
**Fix:**
1. Verify `app.json` has `"scheme": "nutrion"` (lowercase)
2. Run `npx expo prebuild --platform ios --clean` to regenerate
3. Rebuild the app

### "Unable to resolve module" Errors
**Cause:** Dependencies not installed correctly
**Fix:**
```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

### Password Reset Email Not Arriving
**Cause:** SMTP not configured or email in spam
**Fix:**
1. Check Supabase Dashboard → Authentication → SMTP settings
2. Check spam/junk folder
3. Try with a different email provider (Gmail, Outlook, etc.)

### Deep Link Opens Browser Instead of App
**Cause:** iOS needs the app installed first
**Fix:**
1. Make sure the app is installed on the device/simulator
2. The first time you click a deep link, iOS may ask which app to open it with
3. Select "Nutrion" and optionally choose "Always"

## 📱 Testing Checklist

- [ ] Run `npx expo prebuild --platform ios`
- [ ] Run `cd ios && pod install && cd ..`
- [ ] Run `npm run ios` to launch simulator
- [ ] App opens successfully on iOS
- [ ] Navigate to Forgot Password screen
- [ ] Enter email and request reset
- [ ] Check email inbox (and spam folder)
- [ ] Click reset link in email
- [ ] App opens to reset-password screen
- [ ] Enter new password
- [ ] Password resets successfully
- [ ] User is signed in and redirected to pantry

## 🎯 Key Differences: iOS vs Android vs Web

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Deep Linking | `nutrion://` via URL Schemes | `nutrion://` via Intent Filters | URL hash params |
| Token Location | Query params in deep link | Query params in deep link | Hash fragment (#) |
| Session Detection | `Linking.getInitialURL()` | `Linking.getInitialURL()` | `window.location.hash` |
| Native Project | Requires `npx expo prebuild` | Already generated | Not needed |

## 📝 Notes

- The `ios/` folder is gitignored by default (it's generated, not committed)
- You need to run `npx expo prebuild` again after:
  - Changing `app.json` configuration
  - Adding new native dependencies
  - Updating Expo SDK version
- For production iOS builds, use EAS Build: `npm run build:ios`
- The app uses Expo Router for navigation (file-based routing)
- Deep linking is handled automatically by Expo Router

## 🆘 Need Help?

If you encounter issues:
1. Check the console logs for error messages
2. Verify Supabase configuration in the dashboard
3. Make sure all redirect URLs are whitelisted
4. Try the password reset flow on web first (easier to debug)
5. Check that your `.env` file has correct Supabase credentials

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ App builds and runs on iOS simulator/device
- ✅ Password reset email arrives in inbox
- ✅ Clicking email link opens the app (not browser)
- ✅ Reset password screen shows with valid session
- ✅ Password updates successfully
- ✅ User is automatically signed in after reset

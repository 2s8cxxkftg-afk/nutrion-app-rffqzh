
# 🍎 Start Here: iOS Testing Setup

## Current Status
- ✅ Password reset code is correct
- ✅ SMTP is configured (you confirmed this)
- ✅ Deep linking is configured
- ⏳ iOS native project needs to be generated

## 3 Commands to Run (Copy & Paste)

```bash
# 1. Generate iOS project (takes 2-3 minutes)
npx expo prebuild --platform ios

# 2. Install iOS dependencies (takes 1-2 minutes)
cd ios && pod install && cd ..

# 3. Run on iOS simulator
npm run ios
```

## What These Commands Do

1. **`npx expo prebuild --platform ios`**
   - Creates the `ios/` folder with Xcode project
   - Configures deep linking for password reset
   - Sets up camera/photo permissions
   - Prepares app for iOS testing

2. **`cd ios && pod install && cd ..`**
   - Installs native iOS dependencies
   - Links camera, notifications, and other native modules
   - Prepares project for building

3. **`npm run ios`**
   - Builds the iOS app
   - Launches iOS Simulator
   - Installs and runs the app
   - Opens Metro bundler for hot reloading

## After Running These Commands

Your app will be running on iOS! Test the password reset:

1. Open app → Tap "Forgot Password?"
2. Enter email → Tap "Send Reset Link"
3. Check email inbox (and spam folder)
4. Click reset link in email
5. App should open to reset screen
6. Enter new password → Tap "Reset Password"
7. Done! You should be signed in ✅

## Supabase Dashboard: Verify These Settings

**Authentication → URL Configuration**
Make sure these URLs are whitelisted:
```
nutrion://reset-password
exp://localhost:8081/--/reset-password
http://localhost:8081/reset-password
```

**Authentication → Email Templates**
- "Reset Password" template should be enabled
- Should include `{{ .ConfirmationURL }}` button

**Authentication → SMTP**
- You confirmed this is already configured ✅

## Troubleshooting

**"No bundle URL present"**
→ Run `npm run dev` first, then `npm run ios` in another terminal

**"Command PhaseScriptExecution failed"**
→ Run `cd ios && pod install && cd ..` again

**Deep link opens Safari instead of app**
→ Normal on first use. iOS will ask which app to use. Select "Nutrion"

**Email not arriving**
→ Check spam folder. Emails can take 1-2 minutes to arrive.

## That's It!

Just run the 3 commands above and you'll be testing on iOS. 🚀

---

**Questions?** Check `README_IOS_TESTING.md` for detailed troubleshooting.

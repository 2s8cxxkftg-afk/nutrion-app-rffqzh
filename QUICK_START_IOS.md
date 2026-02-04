
# 🚀 Quick Start: iOS Testing

## One-Time Setup (Run These Commands)

```bash
# 1. Generate iOS native project
npx expo prebuild --platform ios

# 2. Install iOS dependencies
cd ios && pod install && cd ..

# 3. Run on iOS simulator
npm run ios
```

## That's It! 🎉

The app will now:
- Build for iOS
- Launch iOS Simulator
- Install and run the app
- Be ready for testing password reset

## Test Password Reset Flow

1. Open app on iOS
2. Go to "Forgot Password?"
3. Enter your email
4. Check email inbox
5. Click reset link
6. App should open to reset screen
7. Enter new password
8. Done! ✅

## Supabase Dashboard URLs to Whitelist

Go to: **Supabase Dashboard → Authentication → URL Configuration**

Add these redirect URLs:
```
nutrion://reset-password
exp://localhost:8081/--/reset-password
http://localhost:8081/reset-password
```

## Common Issues

**"No bundle URL present"**
→ Run `npm run dev` first

**"Command PhaseScriptExecution failed"**
→ Run `cd ios && pod install && cd ..`

**Deep link opens browser**
→ Make sure app is installed on device first

**Email not arriving**
→ Check spam folder, verify SMTP in Supabase Dashboard

## Need to Rebuild?

If you change `app.json` or add native dependencies:
```bash
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
npm run ios
```

---

**Current Status:**
- ✅ Password reset code is correct
- ✅ SMTP configuration is ready
- ✅ Deep linking is configured
- ⏳ iOS native project needs to be generated (run commands above)

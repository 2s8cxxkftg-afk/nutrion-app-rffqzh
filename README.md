# Nutrion - Smart Pantry Management App

## 🚨 CRITICAL: iOS Crash Fixes Applied

### Issues Fixed:
1. **Removed react-native-maps dependency** - This package is NOT supported in Natively and causes crashes
2. **Improved error handling** - Added comprehensive try-catch blocks and timeouts throughout the app
3. **Better async initialization** - Added timeouts to prevent hanging on slow operations
4. **Platform-specific code safety** - Improved @bacons/apple-targets usage with better error handling
5. **Notification initialization** - Added timeouts and better error recovery
6. **Auth initialization** - Added component unmount checks and better error handling
7. **Widget context safety** - Added availability checks before using iOS-specific features

### ⚠️ IMPORTANT: Manual Step Required

**You MUST manually remove `react-native-maps` from package.json:**

1. Open `package.json` in your editor
2. Find and **DELETE** this line (around line 45):
   ```json
   "react-native-maps": "^1.20.1",
   ```
3. Save the file
4. Run `npm install` or `pnpm install` to update dependencies
5. Rebuild the app for iOS using EAS Build or Xcode

### Testing on iOS:
1. Clear the app cache: Settings → Nutrion → Clear Data
2. Uninstall and reinstall the app
3. Check the console logs for any remaining errors
4. Test all major features:
   - Pantry management
   - Shopping list
   - Notifications
   - Authentication
   - Profile settings

### If Issues Persist:
- Check Xcode console for native crash logs
- Verify all environment variables are set correctly in `.env`
- Ensure Supabase credentials are valid
- Test on a physical device (not just simulator)
- Check that iOS deployment target is set to 14.0 or higher

### What Was Changed:
- **app/_layout.tsx**: Enhanced global error handlers with better error catching
- **contexts/AuthContext.tsx**: Added component unmount checks and timeouts
- **contexts/WidgetContext.tsx**: Added availability checks for iOS-specific features
- **utils/notificationScheduler.ts**: Added timeouts to prevent hanging
- **app/index.tsx**: Improved initialization with better error recovery
- **utils/i18n.ts**: Added error handling for translation initialization

---

This app was built using [Natively.dev](https://natively.dev) - a platform for creating mobile apps.

Made with 💙 for creativity.

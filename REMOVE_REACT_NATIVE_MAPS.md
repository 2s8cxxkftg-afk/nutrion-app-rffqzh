
# 🚨 CRITICAL: Remove react-native-maps

## Why This Is Critical

`react-native-maps` is causing your iOS app to crash. This dependency is incompatible with Natively and MUST be removed before the app will work on iOS.

## How to Remove It

### Option 1: Using npm
```bash
npm uninstall react-native-maps
```

### Option 2: Using pnpm
```bash
pnpm remove react-native-maps
```

### Option 3: Using yarn
```bash
yarn remove react-native-maps
```

## After Removal

### 1. Clean Install
```bash
rm -rf node_modules
npm install
```

### 2. Clear Metro Cache
```bash
npx expo start --clear
```

### 3. Verify Removal
Check `package.json` - the line `"react-native-maps": "^1.20.1",` should be gone.

## Why Can't This Be Done Automatically?

The `package.json` file is protected in the Natively environment to prevent dependency conflicts. You need to manually remove this dependency using the commands above.

## What If I Need Maps?

If you need map functionality in the future, use one of these alternatives:
1. **Web Maps**: Use `<iframe>` with Google Maps embed (web only)
2. **Static Maps**: Use Google Maps Static API for images
3. **Native Maps**: Use `expo-location` + web view with map URL

## Verification

After removing react-native-maps, your app should:
- ✅ Launch without crashing on iOS
- ✅ Show introduction screens
- ✅ Allow sign in/sign up
- ✅ Navigate between tabs smoothly

## Next Steps

1. Remove react-native-maps (commands above)
2. Clean install dependencies
3. Clear Metro cache
4. Test app: `npm run ios`
5. Verify no crashes in console

## Still Having Issues?

If the app still crashes after removing react-native-maps:
1. Check console logs for `[Index]` and `[AuthProvider]` messages
2. Run `npx expo-doctor` to check for other issues
3. See `IOS_TROUBLESHOOTING.md` for detailed debugging
4. Contact support: hello@solvralabs.net

## Summary

**DO THIS NOW**:
```bash
npm uninstall react-native-maps
rm -rf node_modules
npm install
npx expo start --clear
npm run ios
```

That's it! Your app should now work on iOS. 🎉

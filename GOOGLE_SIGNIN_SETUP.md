
# Google Sign-In Setup Guide for Nutrion

This guide will help you set up Google Sign-In authentication for the Nutrion app.

## Prerequisites

- A Google Cloud Platform account
- Access to your Supabase project dashboard
- Your app's package name (for Android) and Bundle ID (for iOS)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (or Internal if using Google Workspace)
3. Fill in the required information:
   - App name: **Nutrion**
   - User support email: Your email
   - Developer contact email: Your email
4. Add the following scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Save and continue

## Step 3: Create OAuth Client IDs

### For Web (Required for React Native)

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Name it "Nutrion Web Client"
5. Add authorized redirect URIs:
   - `https://xivsfhdsmsxwtsidxfyj.supabase.co/auth/v1/callback`
6. Click **Create**
7. **Copy the Client ID** - you'll need this!

### For Android (Optional - for native Android builds)

1. Create another OAuth client ID
2. Choose **Android**
3. Provide:
   - Package name: Your Android package name (e.g., `com.nutrion.app`)
   - SHA-1 certificate fingerprint (get this from your keystore)
4. Click **Create**

### For iOS (Optional - for native iOS builds)

1. Create another OAuth client ID
2. Choose **iOS**
3. Provide:
   - Bundle ID: Your iOS bundle identifier (e.g., `com.nutrion.app`)
4. Click **Create**

## Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (xivsfhdsmsxwtsidxfyj)
3. Go to **Authentication** > **Providers**
4. Find **Google** and enable it
5. Enter your credentials:
   - **Client ID**: Paste the Web Client ID from Step 3
   - **Client Secret**: Paste the Web Client Secret from Step 3
6. Add authorized redirect URLs if needed
7. Click **Save**

## Step 5: Update the App Code

1. Open `app/auth.tsx`
2. Find the line with `GoogleSignin.configure`
3. Replace `YOUR_WEB_CLIENT_ID_FROM_GOOGLE_CONSOLE` with your actual Web Client ID:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});
```

## Step 6: Test the Integration

1. Run your app: `npm run dev`
2. Complete the onboarding flow
3. On the auth screen, try signing in with Google
4. You should be redirected to Google's sign-in page
5. After successful authentication, you'll be redirected back to the app

## Troubleshooting

### "Sign in failed" error
- Verify your Web Client ID is correct
- Check that the redirect URI in Google Cloud matches your Supabase project URL
- Ensure the Google provider is enabled in Supabase

### "Play services not available" (Android)
- Make sure Google Play Services is installed on the device/emulator
- Update Google Play Services to the latest version

### "No ID token present"
- Verify the scopes are correctly configured in Google Cloud Console
- Check that you're using the Web Client ID, not the Android/iOS client ID

### Email not verified
- Users must verify their email before they can sign in
- Check your Supabase email templates are configured correctly
- Ensure the `emailRedirectTo` parameter is set to `https://natively.dev/email-confirmed`

## Security Best Practices

1. **Never commit your Client Secret** to version control
2. Use environment variables for sensitive data in production
3. Enable brand verification in Google Cloud Console
4. Set up a custom domain for your Supabase project
5. Regularly review OAuth consent screen settings
6. Monitor authentication logs in Supabase

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/web/sign-in)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Review the Supabase Auth logs in your dashboard
3. Verify all configuration steps were completed correctly
4. Ensure all dependencies are properly installed

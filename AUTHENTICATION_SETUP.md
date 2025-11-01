
# Authentication Setup for Nutrion

This document explains the authentication flow and setup for the Nutrion app.

## Overview

Nutrion uses Supabase Auth for user authentication, supporting:
- **Email/Password authentication** with email verification
- **Google OAuth** for social sign-in
- **Session management** with automatic token refresh
- **Secure storage** using AsyncStorage

## Authentication Flow

### 1. App Launch Flow

```
App Launch
    ↓
Check Onboarding Status
    ↓
├─ Not Completed → Onboarding Screen
│                      ↓
│                  Auth Screen
│                      ↓
└─ Completed → Check Auth Status
                   ↓
               ├─ Not Authenticated → Auth Screen
               │                          ↓
               └─ Authenticated → Main App (Pantry)
```

### 2. Sign Up Flow

```
User enters email & password
    ↓
Validation (email format, password length, etc.)
    ↓
Call supabase.auth.signUp()
    ↓
├─ Success → Email verification required
│               ↓
│           Show alert to check email
│               ↓
│           Switch to Sign In mode
│
└─ Error → Show error message
```

### 3. Sign In Flow

```
User enters email & password
    ↓
Validation
    ↓
Call supabase.auth.signInWithPassword()
    ↓
├─ Success → Navigate to Main App
│
└─ Error → Show error message
           (e.g., "Email not confirmed")
```

### 4. Google Sign-In Flow

```
User taps "Sign in with Google"
    ↓
GoogleSignin.signIn()
    ↓
Get ID token from Google
    ↓
Call supabase.auth.signInWithIdToken()
    ↓
├─ Success → Navigate to Main App
│
└─ Error → Show error message
```

## File Structure

```
app/
├── index.tsx              # Entry point - checks onboarding & auth status
├── onboarding.tsx         # Onboarding screens
├── auth.tsx               # Login/Sign-up screen
├── email-confirmed.tsx    # Email verification success screen
└── (tabs)/
    └── profile.tsx        # Profile with sign-out option

utils/
└── supabase.ts           # Supabase client configuration
```

## Key Components

### 1. Auth Screen (`app/auth.tsx`)

Features:
- Toggle between Sign In and Sign Up modes
- Email/Password authentication
- Google Sign-In button
- Password visibility toggle
- Form validation
- Loading states
- Error handling
- "Skip for now" option

### 2. Index Screen (`app/index.tsx`)

Responsibilities:
- Check if onboarding is completed
- Check if user is authenticated
- Show splash screen with logo
- Route to appropriate screen

### 3. Profile Screen (`app/(tabs)/profile.tsx`)

Features:
- Display user email
- Show pantry statistics
- Settings options
- **Sign Out button**

## Supabase Configuration

### Database Tables

The app uses the following tables with RLS policies:

```sql
-- pantry_items table
CREATE TABLE pantry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC,
  unit TEXT,
  date_added TIMESTAMP DEFAULT NOW(),
  expiration_date DATE,
  barcode TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own items"
  ON pantry_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON pantry_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON pantry_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON pantry_items FOR DELETE
  USING (auth.uid() = user_id);
```

### Email Templates

Configure email templates in Supabase Dashboard:
- **Confirm signup**: Email verification template
- **Magic Link**: For passwordless sign-in
- **Change Email Address**: Email change confirmation
- **Reset Password**: Password reset template

### Auth Settings

In Supabase Dashboard > Authentication > Settings:

1. **Email Auth**
   - Enable email provider
   - Enable "Confirm email" (recommended)
   - Set "Minimum password length" to 6

2. **Site URL**
   - Set to your app's URL or `https://natively.dev`

3. **Redirect URLs**
   - Add `https://natively.dev/email-confirmed`
   - Add any other redirect URLs needed

4. **Email Rate Limits**
   - Configure to prevent abuse

## Security Considerations

### 1. Row Level Security (RLS)

All database tables MUST have RLS enabled with appropriate policies:
- Users can only access their own data
- Policies check `auth.uid() = user_id`

### 2. Email Verification

- Users must verify their email before signing in
- Prevents spam accounts
- Configured via `emailRedirectTo` parameter

### 3. Password Requirements

- Minimum 6 characters (configurable in Supabase)
- Client-side validation before API call
- Server-side validation by Supabase

### 4. Session Management

- Sessions stored securely in AsyncStorage
- Automatic token refresh
- Session expires after inactivity

### 5. OAuth Security

- Use Web Client ID for React Native
- Never expose Client Secret in client code
- Validate ID tokens on server (handled by Supabase)

## Testing Authentication

### Test Sign Up

1. Launch app and complete onboarding
2. On auth screen, enter email and password
3. Tap "Create Account"
4. Check email for verification link
5. Click verification link
6. Return to app and sign in

### Test Sign In

1. Enter verified email and password
2. Tap "Sign In"
3. Should navigate to pantry screen
4. Check that user email appears in profile

### Test Google Sign-In

1. Tap "Sign in with Google"
2. Select Google account
3. Grant permissions
4. Should navigate to pantry screen

### Test Sign Out

1. Go to Profile tab
2. Scroll to Account section
3. Tap "Sign Out"
4. Confirm sign out
5. Should navigate back to auth screen

## Error Handling

Common errors and solutions:

### "Email not confirmed"
- User hasn't verified their email
- Resend verification email
- Check spam folder

### "Invalid login credentials"
- Wrong email or password
- User doesn't exist
- Account may be disabled

### "User already registered"
- Email already in use
- Try signing in instead
- Use password reset if forgotten

### "Failed to sign in with Google"
- Check Google Cloud Console configuration
- Verify Web Client ID is correct
- Ensure Google provider is enabled in Supabase

## Environment Variables

For production, use environment variables:

```bash
# .env
SUPABASE_URL=https://xivsfhdsmsxwtsidxfyj.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
GOOGLE_WEB_CLIENT_ID=your_client_id_here
```

## Migration from Unauthenticated to Authenticated

If users have data before authentication:

1. Store data locally with AsyncStorage
2. On first sign-in, sync local data to Supabase
3. Associate data with user_id
4. Clear local storage after successful sync

## Next Steps

1. ✅ Set up Google Cloud project
2. ✅ Configure OAuth consent screen
3. ✅ Create OAuth client IDs
4. ✅ Enable Google provider in Supabase
5. ✅ Update app code with Client ID
6. ✅ Test authentication flow
7. ⬜ Set up password reset flow
8. ⬜ Add biometric authentication (optional)
9. ⬜ Implement social sign-in with Apple (optional)

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google Sign-In Setup Guide](./GOOGLE_SIGNIN_SETUP.md)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

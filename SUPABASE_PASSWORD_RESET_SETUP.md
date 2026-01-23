
# Supabase Password Reset Email Configuration

## Overview
For the password reset functionality to work, you need to configure Supabase to send emails and set up the correct redirect URLs.

## Step 1: Configure Email Settings in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Configure Email Templates**
   - Go to **Authentication** → **Email Templates**
   - Find the **"Reset Password"** template
   - Make sure it's enabled

3. **Configure SMTP (Optional but Recommended)**
   - By default, Supabase uses their email service (limited to 3 emails per hour in free tier)
   - For production, configure your own SMTP:
     - Go to **Project Settings** → **Auth**
     - Scroll to **SMTP Settings**
     - Enable **"Enable Custom SMTP"**
     - Enter your SMTP credentials (Gmail, SendGrid, AWS SES, etc.)

## Step 2: Configure Redirect URLs

1. **Go to Authentication Settings**
   - Navigate to **Authentication** → **URL Configuration**

2. **Add Redirect URLs**
   Add the following URLs to the **"Redirect URLs"** list:
   
   ```
   nutrion://reset-password
   exp://localhost:8081/--/reset-password
   http://localhost:8081/reset-password
   ```

   For production, also add:
   ```
   https://yourdomain.com/reset-password
   ```

3. **Site URL Configuration**
   - Set the **Site URL** to your app's URL
   - For development: `http://localhost:8081`
   - For production: `https://yourdomain.com`

## Step 3: Configure Deep Linking in Your App

The app is already configured with the scheme `nutrion://` in `app.json`:

```json
{
  "scheme": "nutrion"
}
```

This allows Supabase to redirect back to your app after the user clicks the reset link.

## Step 4: Test the Password Reset Flow

1. **Request Password Reset**
   - Open the app
   - Go to the login screen
   - Tap "Forgot Password?"
   - Enter your email
   - Tap "Send Reset Link"

2. **Check Your Email**
   - You should receive an email from Supabase
   - The email contains a link to reset your password

3. **Click the Reset Link**
   - The link will open your app (if installed)
   - Or redirect to the web version
   - You'll be taken to the reset password screen

4. **Enter New Password**
   - Enter your new password
   - Confirm the password
   - Tap "Reset Password"
   - You'll be automatically signed in

## Troubleshooting

### Email Not Sending

**Problem:** No email is received after requesting password reset

**Solutions:**
1. Check Supabase email rate limits (3 emails/hour on free tier)
2. Check spam/junk folder
3. Verify email template is enabled in Supabase dashboard
4. Configure custom SMTP for better deliverability
5. Check Supabase logs: **Authentication** → **Logs**

### Invalid or Expired Reset Link

**Problem:** "Invalid or expired reset link" error

**Solutions:**
1. Reset links expire after 1 hour by default
2. Request a new reset link
3. Make sure redirect URLs are configured correctly in Supabase
4. Check that the app scheme matches in app.json and Supabase settings

### Deep Link Not Working

**Problem:** Clicking the email link doesn't open the app

**Solutions:**
1. Make sure the app is installed on the device
2. Verify the scheme is configured in app.json: `"scheme": "nutrion"`
3. For iOS: Rebuild the app after changing app.json
4. For Android: Rebuild the app after changing app.json
5. Test with: `npx uri-scheme open nutrion://reset-password --ios` or `--android`

### Timeout Errors

**Problem:** "Connection timeout" or "Request timeout" errors

**Solutions:**
1. Check your internet connection
2. Verify Supabase project is active (not paused)
3. Check Supabase status: https://status.supabase.com
4. The app has retry logic (3 attempts) built-in
5. Wait a few minutes and try again

## Email Rate Limits

### Free Tier
- 3 emails per hour
- 30 emails per day

### Pro Tier
- 100 emails per hour
- Unlimited daily emails

### Custom SMTP
- No Supabase limits (depends on your SMTP provider)

## Security Best Practices

1. **Password Requirements**
   - Minimum 6 characters (enforced in the app)
   - Consider adding complexity requirements

2. **Link Expiration**
   - Reset links expire after 1 hour (Supabase default)
   - Users must request a new link after expiration

3. **Rate Limiting**
   - Supabase has built-in rate limiting
   - Prevents abuse of password reset functionality

4. **Email Verification**
   - Only registered users can request password resets
   - Supabase verifies the email exists before sending

## Custom SMTP Configuration Examples

### Gmail
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password (not your regular password)
```

### SendGrid
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your-sendgrid-api-key
```

### AWS SES
```
Host: email-smtp.us-east-1.amazonaws.com
Port: 587
Username: your-smtp-username
Password: your-smtp-password
```

## Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_APP_SCHEME=nutrion
```

## Testing Checklist

- [ ] Supabase project is active
- [ ] Email template is enabled
- [ ] Redirect URLs are configured
- [ ] App scheme matches in app.json and Supabase
- [ ] Environment variables are set correctly
- [ ] App is rebuilt after configuration changes
- [ ] Email is received (check spam folder)
- [ ] Reset link opens the app
- [ ] Password can be changed successfully
- [ ] User is signed in after reset

## Support

If you continue to have issues:

1. Check Supabase logs: **Authentication** → **Logs**
2. Check app logs: Look for console.log messages in the app
3. Verify Supabase project status
4. Contact Supabase support if needed

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Expo Deep Linking](https://docs.expo.dev/guides/linking/)


# Supabase Password Reset Email Configuration Guide

## Overview
This guide explains how to configure Supabase to send password reset emails for the Nutrion app.

## Prerequisites
- Active Supabase project
- Access to Supabase Dashboard
- Email address for testing

---

## Step 1: Enable Password Reset Email Template

1. **Navigate to Email Templates:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project: **Nutrion**
   - Click **Authentication** in the left sidebar
   - Click **Email Templates**

2. **Configure Reset Password Template:**
   - Find the **"Reset Password"** template
   - Ensure it is **ENABLED** (toggle should be ON)
   - Review the email template content
   - The template should include a link with `{{ .ConfirmationURL }}`

3. **Verify Template Content:**
   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset your password:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   <p>If you didn't request this, you can safely ignore this email.</p>
   ```

---

## Step 2: Configure Redirect URLs (CRITICAL)

1. **Navigate to URL Configuration:**
   - Go to **Authentication** → **URL Configuration**
   - Find the **"Redirect URLs"** section

2. **Add ALL Required Redirect URLs:**
   Add these URLs to the whitelist (one per line):

   ```
   Nutrion://reset-password
   exp://localhost:8081/--/reset-password
   http://localhost:8081/reset-password
   https://localhost:8081/reset-password
   ```

   **For Production (add your actual domain):**
   ```
   https://yourdomain.com/reset-password
   https://www.yourdomain.com/reset-password
   ```

3. **Why This Matters:**
   - Supabase will ONLY send emails with redirect URLs that are whitelisted
   - If the URL is not whitelisted, the email will NOT be sent
   - Each platform (native, web, Expo Go) needs its own URL

---

## Step 3: Configure SMTP Settings (HIGHLY RECOMMENDED)

### Why Custom SMTP?
- **Default Supabase Email Limits:**
  - Free tier: 4 emails per hour
  - Rate limits can block password resets
  - May be flagged as spam by email providers

### Configure Custom SMTP:

1. **Navigate to SMTP Settings:**
   - Go to **Authentication** → **Settings** → **SMTP Settings**

2. **Choose an SMTP Provider:**

   **Option A: Gmail SMTP (Free, Easy)**
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: Your Gmail address
   - Password: [App Password](https://support.google.com/accounts/answer/185833) (not your regular password)
   - Enable TLS: Yes

   **Option B: SendGrid (Recommended for Production)**
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: Your SendGrid API key
   - Enable TLS: Yes

   **Option C: AWS SES, Mailgun, Postmark, etc.**
   - Follow provider's SMTP configuration

3. **Test SMTP Configuration:**
   - Save settings
   - Send a test email from Supabase dashboard
   - Verify email arrives in inbox

---

## Step 4: Test Password Reset Flow

### Testing Steps:

1. **Initiate Password Reset:**
   - Open the Nutrion app
   - Go to login screen
   - Tap **"Forgot Password?"**
   - Enter your email address
   - Tap **"Send Reset Link"**

2. **Check for Email:**
   - Check your inbox (should arrive within 1-2 minutes)
   - **Check spam/junk folder** if not in inbox
   - Email subject: "Reset Your Password"

3. **Click Reset Link:**
   - Open the email
   - Click the **"Reset Password"** link
   - App should open to reset password screen
   - Enter new password (minimum 6 characters)
   - Confirm password
   - Tap **"Reset Password"**

4. **Verify Success:**
   - You should see "Password updated successfully!"
   - App should navigate to pantry screen
   - You should be signed in automatically

---

## Troubleshooting

### Issue: No Email Received

**Possible Causes:**
1. **SMTP not configured** → Configure custom SMTP (Step 3)
2. **Rate limit exceeded** → Wait 5-10 minutes or use custom SMTP
3. **Email in spam folder** → Check spam/junk folder
4. **Email template disabled** → Enable in Email Templates (Step 1)
5. **Invalid email address** → Verify email is correct and registered

**Solutions:**
- Check Supabase logs: Dashboard → Logs → Auth Logs
- Verify SMTP settings are correct
- Test with a different email address
- Wait 10 minutes and try again (rate limit reset)

### Issue: "Invalid or Expired Reset Link"

**Possible Causes:**
1. **Redirect URL not whitelisted** → Add URL to whitelist (Step 2)
2. **Link expired** → Links expire after 1 hour, request new one
3. **Link already used** → Each link can only be used once
4. **Session error** → Clear app cache and try again

**Solutions:**
- Verify ALL redirect URLs are whitelisted in Supabase
- Request a new password reset link
- Clear app data and try again

### Issue: "Connection Timeout"

**Possible Causes:**
1. **Network connectivity** → Check internet connection
2. **Supabase service issue** → Check [Supabase Status](https://status.supabase.com/)
3. **Firewall blocking** → Check network firewall settings

**Solutions:**
- Check internet connection
- Try again in a few minutes
- Use a different network (mobile data vs WiFi)

### Issue: "Too Many Requests"

**Possible Causes:**
1. **Rate limit exceeded** → Default limit is 4 emails/hour
2. **Multiple reset attempts** → Supabase throttles requests

**Solutions:**
- Wait 10-15 minutes before trying again
- Configure custom SMTP to remove rate limits (Step 3)
- Check Supabase logs for rate limit details

---

## Verification Checklist

Before deploying to production, verify:

- [ ] Email template is enabled and configured
- [ ] All redirect URLs are whitelisted (native, web, Expo Go)
- [ ] Custom SMTP is configured (recommended)
- [ ] Test email is received successfully
- [ ] Reset link opens the app correctly
- [ ] Password can be changed successfully
- [ ] User is signed in after password reset
- [ ] Email arrives within 2 minutes
- [ ] Email is not in spam folder

---

## Production Deployment

### Required for Production:

1. **Custom SMTP Provider:**
   - DO NOT rely on default Supabase emails
   - Configure SendGrid, AWS SES, or similar
   - Verify sender domain (SPF, DKIM, DMARC)

2. **Production Redirect URLs:**
   - Add your production domain URLs
   - Example: `https://nutrion.app/reset-password`
   - Test on production environment

3. **Email Deliverability:**
   - Configure SPF records for your domain
   - Set up DKIM signing
   - Add DMARC policy
   - Monitor bounce rates

4. **Rate Limiting:**
   - Custom SMTP removes Supabase rate limits
   - Implement your own rate limiting if needed
   - Monitor for abuse

---

## Support

If you continue to have issues:

1. **Check Supabase Logs:**
   - Dashboard → Logs → Auth Logs
   - Look for password reset attempts
   - Check for error messages

2. **Verify Environment Variables:**
   - `EXPO_PUBLIC_SUPABASE_URL` is set correctly
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set correctly
   - `EXPO_PUBLIC_APP_SCHEME` is set to `nutrion`

3. **Test with Supabase CLI:**
   ```bash
   supabase auth reset-password --email your@email.com
   ```

4. **Contact Supabase Support:**
   - [Supabase Discord](https://discord.supabase.com/)
   - [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)

---

## Current Implementation Details

### Frontend Files:
- `app/forgot-password.tsx` - Password reset request screen
- `app/reset-password.tsx` - New password entry screen
- `app/auth.tsx` - Deep link handler for reset links
- `utils/supabase.ts` - Supabase client configuration

### Flow:
1. User enters email on forgot-password screen
2. App calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
3. Supabase sends email with reset link
4. User clicks link in email
5. App opens to reset-password screen via deep link
6. User enters new password
7. App calls `supabase.auth.updateUser({ password })`
8. User is signed in automatically

### Security:
- Links expire after 1 hour
- Each link can only be used once
- Supabase doesn't reveal if email exists (security best practice)
- PKCE flow for enhanced security

---

## Quick Start

**Minimum configuration to test:**

1. Enable "Reset Password" email template in Supabase
2. Add `nutrion://reset-password` to redirect URLs
3. Add `http://localhost:8081/reset-password` to redirect URLs
4. Test with your email address

**For production:**

1. Complete all steps above
2. Configure custom SMTP provider
3. Add production domain redirect URLs
4. Test thoroughly on all platforms (iOS, Android, Web)

---

Last Updated: 2026-02-03

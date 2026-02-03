
# 🚀 Quick Setup: Password Reset Email

## The Issue
Password reset emails are not being sent because Supabase needs to be configured.

## ✅ 3-Minute Fix

### 1. Enable Email Template (1 minute)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj)
2. Click **Authentication** → **Email Templates**
3. Find **"Reset Password"** template
4. Toggle it **ON** (if it's off)
5. Click **Save**

### 2. Whitelist Redirect URLs (1 minute)
1. Go to **Authentication** → **URL Configuration**
2. Scroll to **"Redirect URLs"** section
3. Add these URLs (copy-paste each one):
   ```
   Nutrion://reset-password
   exp://localhost:8081/--/reset-password
   http://localhost:8081/reset-password
   ```
4. Click **Save**

### 3. Test It (1 minute)
1. Open the Nutrion app
2. Go to login screen → **"Forgot Password?"**
3. Enter your email
4. Tap **"Send Reset Link"**
5. Check your email inbox (and spam folder)
6. Click the link in the email
7. Enter new password

---

## ⚠️ Still Not Working?

### Issue: No Email Received

**Most Common Cause:** Supabase free tier has email rate limits (4 emails/hour)

**Solution:** Configure custom SMTP

1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Choose a provider:
   - **Gmail** (easiest): smtp.gmail.com:587
   - **SendGrid** (recommended): smtp.sendgrid.net:587
3. Enter credentials
4. Click **Save**
5. Try password reset again

### Issue: Email Goes to Spam

**Solution:** Configure SPF/DKIM records for your domain (requires custom SMTP)

### Issue: "Invalid Reset Link"

**Solution:** Make sure ALL redirect URLs from Step 2 are added to Supabase

---

## 🎯 Quick Test

In the app, tap **"Show Setup Instructions"** at the bottom of the forgot password screen, then tap **"Test Supabase Connection"** to verify your configuration.

---

## 📧 Expected Behavior

1. User enters email → Tap "Send Reset Link"
2. App shows: "Email sent successfully!"
3. Email arrives within 1-2 minutes
4. User clicks link in email
5. App opens to reset password screen
6. User enters new password
7. Password is updated
8. User is signed in automatically

---

## 🆘 Need Help?

If you've completed all steps and it's still not working:

1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Look for error messages
3. Verify environment variables are set correctly
4. Try with a different email address
5. Wait 10 minutes (rate limit reset) and try again

---

**Project:** Nutrion
**Supabase Project ID:** xivsfhdsmsxwtsidxfyj
**Supabase URL:** https://xivsfhdsmsxwtsidxfyj.supabase.co

Last Updated: 2026-02-03

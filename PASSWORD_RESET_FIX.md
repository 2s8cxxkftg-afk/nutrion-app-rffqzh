
# 🔧 Password Reset Not Working? Here's the Fix

## The Problem
Password reset emails are not being sent because Supabase needs configuration.

---

## ⚡ 3-Step Fix (Takes 3 Minutes)

### Step 1: Enable Email Template
1. Go to: https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj/auth/templates
2. Find **"Reset Password"** template
3. Make sure it's **ENABLED** (toggle ON)
4. Click **Save**

### Step 2: Add Redirect URLs
1. Go to: https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj/auth/url-configuration
2. Scroll to **"Redirect URLs"**
3. Add these URLs (copy-paste):
   ```
   Nutrion://reset-password
   exp://localhost:8081/--/reset-password
   http://localhost:8081/reset-password
   ```
4. Click **Save**

### Step 3: Test It
1. Open Nutrion app
2. Tap **"Forgot Password?"**
3. Enter your email
4. Tap **"Send Reset Link"**
5. Check your email (and spam folder)
6. Click the link
7. Enter new password

---

## 🚨 Still Not Working?

### No Email Received?

**Most likely cause:** Supabase free tier email limits (4 emails/hour)

**Fix:** Configure custom SMTP
1. Go to: https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj/settings/auth
2. Scroll to **"SMTP Settings"**
3. Add Gmail or SendGrid SMTP credentials
4. Click **Save**
5. Try password reset again

### Email in Spam?

**Fix:** Use custom SMTP with verified domain (see above)

### "Invalid Link" Error?

**Fix:** Make sure ALL redirect URLs from Step 2 are added

---

## 📱 In-App Help

The app now has built-in setup instructions:

1. Open forgot password screen
2. Tap **"Show Setup Instructions"** at the bottom
3. Follow the checklist
4. Tap **"Test Supabase Connection"** to verify

---

## ✅ Expected Behavior

1. User enters email → "Email sent successfully!"
2. Email arrives in 1-2 minutes
3. User clicks link → App opens to reset screen
4. User enters new password → "Password updated!"
5. User is signed in automatically

---

**Need more help?** See `SUPABASE_PASSWORD_RESET_SETUP.md` for detailed instructions.

**Project:** Nutrion (xivsfhdsmsxwtsidxfyj)
**Updated:** 2026-02-03

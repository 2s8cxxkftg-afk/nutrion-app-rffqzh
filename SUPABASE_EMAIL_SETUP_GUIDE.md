
# 🚨 Supabase Email Configuration Guide for Password Reset

## Problem
You're getting the error: **"Error sending recovery email"**

This means Supabase cannot send password reset emails because the email service is not configured.

---

## ✅ Solution: Configure Supabase Email Service

### Step 1: Enable Email Templates
1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: **Nutrion**
3. Navigate to: **Authentication → Email Templates**
4. Find the **"Reset Password"** template
5. Click **Enable** (toggle it on)
6. Save changes

### Step 2: Configure SMTP Settings (CRITICAL)
Without SMTP, Supabase cannot send emails!

#### Option A: Use Supabase's Default Email Service (Easiest)
1. Go to: **Project Settings → Auth → SMTP Settings**
2. If you see "Use Supabase SMTP" option, enable it
3. This uses Supabase's built-in email service (limited to 3 emails/hour on free tier)

#### Option B: Configure Custom SMTP (Recommended for Production)
1. Go to: **Project Settings → Auth → SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Fill in your SMTP provider details:
   - **SMTP Host**: e.g., `smtp.gmail.com` (for Gmail)
   - **SMTP Port**: `587` (TLS) or `465` (SSL)
   - **SMTP User**: Your email address
   - **SMTP Password**: Your email password or app-specific password
   - **Sender Email**: The "from" email address
   - **Sender Name**: e.g., "Nutrion App"

**Popular SMTP Providers:**
- **Gmail**: smtp.gmail.com (port 587) - Requires app-specific password
- **SendGrid**: smtp.sendgrid.net (port 587)
- **Mailgun**: smtp.mailgun.org (port 587)
- **AWS SES**: email-smtp.us-east-1.amazonaws.com (port 587)

### Step 3: Whitelist Redirect URLs
1. Go to: **Authentication → URL Configuration**
2. Add these **Redirect URLs**:
   ```
   nutrion://reset-password
   exp://localhost:8081/--/reset-password
   http://localhost:8081/reset-password
   https://yourdomain.com/reset-password
   ```
3. Click **Save**

### Step 4: Test the Configuration
1. Go back to the Nutrion app
2. Navigate to **Forgot Password** screen
3. Enter your email address
4. Click **Send Reset Link**
5. Check your email inbox (and spam folder)

---

## 🔍 Troubleshooting

### Error: "Error sending recovery email"
- **Cause**: SMTP not configured or email template not enabled
- **Fix**: Follow Steps 1 and 2 above

### Error: "Invalid redirect URL"
- **Cause**: Redirect URLs not whitelisted
- **Fix**: Follow Step 3 above

### Error: "Rate limit exceeded"
- **Cause**: Too many password reset attempts
- **Fix**: Wait 10 minutes and try again

### Email not arriving
- **Check spam folder**
- **Wait 2-3 minutes** (emails can be delayed)
- **Verify SMTP credentials** are correct
- **Check Supabase logs**: Go to Logs → Auth Logs to see email sending status

---

## 📧 Gmail SMTP Setup (Most Common)

If you're using Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Nutrion App"
   - Copy the 16-character password
3. **Use these settings in Supabase**:
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP User: `your-email@gmail.com`
   - SMTP Password: `[16-character app password]`
   - Sender Email: `your-email@gmail.com`
   - Sender Name: `Nutrion App`

---

## ✅ Verification Checklist

- [ ] Email template "Reset Password" is enabled
- [ ] SMTP is configured (either Supabase default or custom)
- [ ] Redirect URLs are whitelisted
- [ ] Deep link scheme matches app.json (`nutrion://`)
- [ ] Test email sent successfully

---

## 🆘 Still Having Issues?

1. **Check Supabase Logs**:
   - Go to: **Logs → Auth Logs**
   - Look for password reset attempts and error messages

2. **Test SMTP Connection**:
   - Use an online SMTP tester to verify your credentials
   - Example: https://www.smtper.net/

3. **Contact Supabase Support**:
   - If using free tier, check rate limits
   - Verify your project is not suspended

---

## 📱 App Configuration

The app is already configured correctly:
- ✅ Deep link scheme: `nutrion://reset-password`
- ✅ Web redirect: `http://localhost:8081/reset-password`
- ✅ Error handling and user feedback
- ✅ Detailed logging for debugging

**The only thing missing is the Supabase email configuration!**

---

## 🎯 Quick Start (TL;DR)

1. Supabase Dashboard → Authentication → Email Templates → Enable "Reset Password"
2. Project Settings → Auth → SMTP Settings → Configure SMTP
3. Authentication → URL Configuration → Add redirect URLs
4. Test in the app

That's it! 🎉

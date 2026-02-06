
# 🔐 Password Reset Setup Guide for Nutrion

## ✅ WHAT'S BEEN FIXED IN THE CODE:

1. ✅ Deep linking scheme standardized to lowercase `"nutrion"` in app.json
2. ✅ iOS deep link configuration added (CFBundleURLTypes)
3. ✅ Android deep link configuration added (intentFilters)
4. ✅ Platform-specific redirect URL handling (web vs native)
5. ✅ Enhanced error logging and debugging
6. ✅ Setup instructions shown on configuration errors
7. ✅ Test connection button added to forgot password screen

---

## 🚨 CRITICAL: MANUAL STEPS REQUIRED IN SUPABASE DASHBOARD

The code is now correct, but you **MUST** configure these settings in your Supabase Dashboard for password reset to work:

### **STEP 1: Add Redirect URLs** (MANDATORY)

1. Go to: https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj
2. Navigate to: **Authentication** → **URL Configuration**
3. In the **Redirect URLs** section, add these URLs (one per line):

```
nutrion://reset-password
exp://localhost:8081/--/reset-password
http://localhost:8081/reset-password
https://your-production-domain.com/reset-password
```

4. Click **Save**

**Why this is needed:** Supabase will only send password reset emails with redirect URLs that are whitelisted. Without this, the email won't be sent.

---

### **STEP 2: Enable Password Reset Email Template** (MANDATORY)

1. Go to: **Authentication** → **Email Templates**
2. Find the **"Reset Password"** template
3. Make sure it's **ENABLED** (toggle should be ON)
4. Verify the template contains the magic link: `{{ .ConfirmationURL }}`
5. Click **Save** if you made any changes

**Why this is needed:** If the template is disabled, no emails will be sent.

---

### **STEP 3: Configure SMTP** (OPTIONAL BUT RECOMMENDED FOR PRODUCTION)

**Note:** Supabase's default email service is limited to 3 emails per hour in development. For production, you should configure custom SMTP.

1. Go to: **Authentication** → **Settings** → **SMTP Settings**
2. Choose an email provider:
   - **SendGrid** (recommended, free tier available)
   - **AWS SES** (cheap, reliable)
   - **Mailgun** (easy setup)
   - **Gmail** (for testing only, not recommended for production)
3. Enter your SMTP credentials:
   - Host
   - Port
   - Username
   - Password
   - Sender email
   - Sender name
4. Click **Save**
5. Send a test email to verify it works

**Why this is needed:** Without SMTP, you're limited to 3 emails/hour and emails may be unreliable.

---

## 🧪 TESTING THE PASSWORD RESET FLOW

### **Test on Web:**

1. Open the app in your browser: http://localhost:8081
2. Go to the login screen
3. Click "Forgot Password?"
4. Enter your email address
5. Click "Send Reset Link"
6. Check your email inbox (and spam folder)
7. Click the reset link in the email
8. You should be redirected to the reset password screen
9. Enter your new password
10. Click "Reset Password"
11. You should be signed in and redirected to the pantry

### **Test on iOS/Android:**

1. Build and run the app on your device or simulator
2. Follow the same steps as web
3. When you click the reset link in your email, the app should open automatically
4. If the app doesn't open, check that the deep link scheme is configured correctly

---

## 🐛 TROUBLESHOOTING

### **"Configuration error: Redirect URLs not whitelisted"**
- ✅ **Fix:** Add the redirect URLs in Supabase Dashboard (Step 1 above)

### **"Email configuration error"**
- ✅ **Fix:** Enable the Reset Password email template (Step 2 above)
- ✅ **Fix:** Configure SMTP if using production (Step 3 above)

### **"Too many password reset attempts"**
- ✅ **Fix:** Wait 10 minutes before trying again (Supabase rate limit)

### **Email not received:**
- ✅ Check spam folder
- ✅ Wait 1-2 minutes (emails can be delayed)
- ✅ Verify the email template is enabled in Supabase
- ✅ Check Supabase logs: Authentication → Logs

### **Deep link doesn't open the app (iOS/Android):**
- ✅ Rebuild the app after changing app.json
- ✅ Verify the scheme in app.json matches the code (`nutrion`)
- ✅ Check that the redirect URL in Supabase includes `nutrion://reset-password`

### **"Invalid or expired reset link"**
- ✅ Reset links expire after 1 hour
- ✅ Request a new reset link
- ✅ Make sure you're clicking the full link from the email

---

## 📱 PLATFORM-SPECIFIC NOTES

### **iOS:**
- Deep links use the scheme: `nutrion://reset-password`
- Configured in `CFBundleURLTypes` in app.json
- Requires app rebuild after changing app.json

### **Android:**
- Deep links use the scheme: `nutrion://reset-password`
- Configured in `intentFilters` in app.json
- Requires app rebuild after changing app.json

### **Web:**
- Uses standard HTTP URLs: `http://localhost:8081/reset-password`
- Tokens are passed in the URL hash: `#access_token=...&type=recovery`
- No rebuild required

---

## 🎯 QUICK CHECKLIST

Before testing, make sure you've completed:

- [ ] Added redirect URLs in Supabase Dashboard (Step 1)
- [ ] Enabled Reset Password email template (Step 2)
- [ ] (Optional) Configured SMTP for production (Step 3)
- [ ] Rebuilt the app if testing on iOS/Android
- [ ] Verified Supabase credentials in .env file

---

## 📞 STILL NOT WORKING?

If you've completed all the steps above and it's still not working:

1. **Check Supabase Auth Logs:**
   - Go to: Authentication → Logs
   - Look for password reset requests
   - Check for any error messages

2. **Use the Test Connection Button:**
   - On the forgot password screen, tap "🔍 Test Supabase Connection"
   - This will verify your Supabase configuration

3. **Check the Console Logs:**
   - Look for `[ForgotPassword]` and `[ResetPassword]` log messages
   - These will show exactly what's happening

4. **Verify Environment Variables:**
   - Make sure `.env` file exists and has correct values
   - Restart the Expo dev server after changing .env

---

## 🎉 EXPECTED BEHAVIOR WHEN WORKING:

1. User enters email on forgot password screen
2. User receives email within 1-2 minutes
3. User clicks link in email
4. App opens to reset password screen (or web page opens)
5. User enters new password
6. Password is updated successfully
7. User is automatically signed in and redirected to pantry

---

**Last Updated:** 2026-02-06
**App Version:** 1.0.0
**Supabase Project:** xivsfhdsmsxwtsidxfyj

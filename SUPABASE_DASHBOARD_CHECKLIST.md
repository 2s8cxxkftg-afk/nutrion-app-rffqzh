
# ✅ Supabase Dashboard Configuration Checklist

## 🎯 Quick Links
- **Your Supabase Project:** https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj
- **Authentication Settings:** https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj/auth/templates
- **URL Configuration:** https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj/auth/url-configuration

---

## 📋 Configuration Checklist

### ✅ Task 1: Enable Password Reset Email Template
**Location:** Authentication → Email Templates

- [ ] Click on **"Reset Password"** template
- [ ] Verify toggle is **ON** (enabled)
- [ ] Template should contain `{{ .ConfirmationURL }}`
- [ ] Click **Save** if you made changes

**Expected Result:** Template shows as "Enabled" with green indicator

---

### ✅ Task 2: Add Redirect URLs
**Location:** Authentication → URL Configuration → Redirect URLs

Copy and paste each URL below into the "Redirect URLs" field:

```
Nutrion://reset-password
```

```
exp://localhost:8081/--/reset-password
```

```
http://localhost:8081/reset-password
```

```
https://localhost:8081/reset-password
```

**For Production Web (replace with your domain):**
```
https://yourdomain.com/reset-password
```

- [ ] All URLs added to the list
- [ ] Click **Save**

**Expected Result:** All URLs appear in the "Redirect URLs" list

---

### ✅ Task 3: Configure SMTP (Optional but Recommended)
**Location:** Authentication → Settings → SMTP Settings

**Why?** Default Supabase emails are limited to 4 per hour. Custom SMTP removes this limit.

**Option A: Gmail SMTP (Easiest)**
- [ ] Host: `smtp.gmail.com`
- [ ] Port: `587`
- [ ] Username: Your Gmail address
- [ ] Password: [Create App Password](https://myaccount.google.com/apppasswords)
- [ ] Enable TLS: **Yes**
- [ ] Sender Name: `Nutrion`
- [ ] Sender Email: Your Gmail address
- [ ] Click **Save**

**Option B: SendGrid (Recommended for Production)**
- [ ] Host: `smtp.sendgrid.net`
- [ ] Port: `587`
- [ ] Username: `apikey`
- [ ] Password: Your SendGrid API key
- [ ] Enable TLS: **Yes**
- [ ] Sender Name: `Nutrion`
- [ ] Sender Email: Your verified sender email
- [ ] Click **Save**

**Expected Result:** "SMTP settings saved successfully"

---

## 🧪 Testing

### Test Password Reset Flow:

1. **Open Nutrion App**
   - Go to login screen
   - Tap **"Forgot Password?"**

2. **Enter Email**
   - Type your email address
   - Tap **"Send Reset Link"**
   - Should see: "Email sent successfully!"

3. **Check Email**
   - Check inbox (wait 1-2 minutes)
   - Check spam/junk folder
   - Email subject: "Reset Your Password"

4. **Click Reset Link**
   - Click the link in the email
   - App should open to reset password screen
   - If app doesn't open, copy the link and paste in browser

5. **Set New Password**
   - Enter new password (min 6 characters)
   - Confirm password
   - Tap **"Reset Password"**
   - Should see: "Password updated successfully!"
   - Should be signed in automatically

---

## 🐛 Troubleshooting

### No Email Received?

**Check These:**
1. ✓ Email template is enabled
2. ✓ Redirect URLs are whitelisted
3. ✓ Email address is correct
4. ✓ Check spam folder
5. ✓ Wait 2-3 minutes (emails can be delayed)

**If still no email:**
- Check Supabase logs: Dashboard → Logs → Auth Logs
- Look for "password reset" or "email sent" entries
- Check for error messages
- Verify SMTP settings if configured

### "Rate Limit Exceeded" Error?

**Solution:**
- Wait 10-15 minutes
- OR configure custom SMTP (Task 3 above)

### "Invalid Reset Link" Error?

**Solution:**
- Verify ALL redirect URLs are whitelisted (Task 2)
- Request a new reset link (links expire after 1 hour)
- Clear app cache and try again

### Email Goes to Spam?

**Solution:**
- Configure custom SMTP with verified domain
- Set up SPF, DKIM, and DMARC records for your domain
- Use a reputable SMTP provider (SendGrid, AWS SES)

---

## ✅ Verification

After completing all tasks, verify:

- [ ] Email template is enabled
- [ ] All redirect URLs are whitelisted
- [ ] SMTP is configured (optional but recommended)
- [ ] Test email is received successfully
- [ ] Reset link opens the app
- [ ] Password can be changed
- [ ] User is signed in after reset

---

## 📞 Support

**Supabase Documentation:**
- [Email Auth Guide](https://supabase.com/docs/guides/auth/auth-email)
- [Password Reset](https://supabase.com/docs/guides/auth/auth-password-reset)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

**Supabase Support:**
- [Discord Community](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Project:** Nutrion
**Supabase Project ID:** xivsfhdsmsxwtsidxfyj
**Last Updated:** 2026-02-03

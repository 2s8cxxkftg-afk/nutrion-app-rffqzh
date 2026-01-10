
# 🚀 Quick Start: Deploy Nutrion to Google Play Store

## ⚡ Fast Track (5 Steps)

### 1️⃣ Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2️⃣ Configure Project
```bash
eas build:configure
```
This will update your `app.json` with your EAS project ID.

### 3️⃣ Build Production AAB
```bash
npm run build:android
```
Or:
```bash
eas build --platform android --profile production
```

⏱️ **Wait 10-20 minutes** for the build to complete.

### 4️⃣ Download AAB
- Go to https://expo.dev/accounts/[your-account]/projects/nutrion-app/builds
- Download the `.aab` file

### 5️⃣ Upload to Google Play Console
1. Go to https://play.google.com/console
2. Create new app: **Nutrion**
3. Complete store listing (see GOOGLE_PLAY_DEPLOYMENT.md)
4. Upload your `.aab` file
5. Submit for review

---

## 📋 Required Before Submission

### ✅ Store Listing Info
- **App name:** Nutrion
- **Short description:** Smart pantry management with expiration tracking
- **Category:** Food & Drink
- **Screenshots:** At least 2 (take from your device)
- **App icon:** 512x512 PNG
- **Feature graphic:** 1024x500 PNG

### ✅ Privacy Policy
**REQUIRED** - Create one at:
- https://www.privacypolicygenerator.info/
- https://app-privacy-policy-generator.firebaseapp.com/

Include:
- Email collection (for authentication)
- Pantry data storage (Supabase)
- Payment processing (Stripe)
- Notifications (expiration alerts)

### ✅ Content Rating
Fill out the questionnaire in Google Play Console (takes 5 minutes)

---

## 🎯 Current Configuration

Your app is now configured with:
- ✅ **App name:** Nutrion
- ✅ **Package:** com.nutrion.app
- ✅ **Version:** 1.0.0 (versionCode: 1)
- ✅ **Permissions:** Camera, Notifications, Internet
- ✅ **Build type:** AAB (Android App Bundle)
- ✅ **Auto-increment:** Enabled

---

## 🔄 For Future Updates

```bash
# Build new version
npm run build:android

# Submit to Google Play
npm run submit:android
```

---

## 🆘 Need Help?

See detailed guide: `GOOGLE_PLAY_DEPLOYMENT.md`

**Common Commands:**
```bash
# Check build status
eas build:list

# Cancel a build
eas build:cancel

# View build logs
eas build:view [build-id]
```

---

## 📞 Support

- **EAS Docs:** https://docs.expo.dev/build/introduction/
- **Google Play Console:** https://play.google.com/console
- **Expo Discord:** https://chat.expo.dev/

---

**You're all set! 🎉**

Run `npm run build:android` to start your first build!


# Nutrion - Smart Pantry Management App

Nutrion helps users manage their pantry, track food expiration dates, and automatically plan balanced meals based on what's already available at home.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- EAS CLI installed globally: `npm install -g eas-cli`
- For iOS: Xcode 14+ and macOS
- For Android: Android Studio with SDK 34+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Development

Run the app in development mode:

```bash
# Start Expo dev server
npm run dev

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 📱 Building for Production

### Android APK

Build an APK for testing:
```bash
npm run build:android
```

This will create an APK file that you can install on Android devices for testing.

### iOS TestFlight

Build for iOS TestFlight:
```bash
npm run build:ios
```

After the build completes, submit to TestFlight:
```bash
npm run submit:ios
```

### Important Notes

**Before building:**
1. Update `eas.json` with your EAS project ID
2. Configure your Supabase project with proper authentication settings
3. Set up SMTP for password reset emails in Supabase Dashboard
4. Add redirect URLs in Supabase Auth settings:
   - `nutrion://reset-password`
   - `exp://localhost:8081/--/reset-password`
   - Your production deep link URL

**iOS Specific:**
- Bundle identifier: `com.solvralabs.nutrion`
- Deployment target: iOS 14.0+
- Deep linking scheme: `nutrion://`

**Android Specific:**
- Package name: `com.solvralabs.nutrion`
- Min SDK: 23 (Android 6.0)
- Target SDK: 34 (Android 14)
- Deep linking scheme: `nutrion://`

## 🔧 Configuration

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Enable Email authentication in Authentication settings
3. Configure SMTP for email delivery (required for password reset)
4. Add redirect URLs for password reset flow
5. Copy your project URL and anon key to `.env`

### Deep Linking

The app uses the `nutrion://` scheme for deep linking. This is configured in:
- `app.json` - scheme configuration
- iOS: `CFBundleURLTypes` in Info.plist
- Android: `intentFilters` in AndroidManifest.xml

## 📦 Features

- ✅ Smart Pantry Inventory with barcode scanning
- ✅ AI-powered Recipe Suggestions (Premium)
- ✅ Receipt Scanning with AI (Premium)
- ✅ Expiration Date Tracking & Alerts
- ✅ Shopping List Management
- ✅ Email Authentication with Password Reset
- ✅ Cross-platform (iOS, Android, Web)
- ✅ Dark Mode Support
- ✅ Offline-first Architecture

## 🛠️ Tech Stack

- **Framework**: React Native + Expo 54
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (Auth + Database)
- **State Management**: React Context API
- **Storage**: AsyncStorage (local) + Supabase (cloud sync)
- **Notifications**: Expo Notifications
- **Camera**: Expo Camera (barcode scanning)
- **AI**: Supabase Edge Functions with OpenAI

## 📝 Project Structure

```
nutrion/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── pantry.tsx     # Main pantry screen
│   │   ├── shopping.tsx   # Shopping list screen
│   │   └── profile.tsx    # User profile screen
│   ├── auth.tsx           # Authentication screen
│   ├── add-item.tsx       # Add pantry item
│   ├── edit-item.tsx      # Edit pantry item
│   ├── scan-receipt.tsx   # AI receipt scanner (Premium)
│   ├── ai-recipes.tsx     # AI recipe generator (Premium)
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable components
├── contexts/              # React contexts (Auth, Widget)
├── hooks/                 # Custom React hooks
├── styles/                # Shared styles and theme
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── assets/                # Images, fonts, etc.
```

## 🔐 Authentication

The app uses Supabase Auth with:
- Email/Password authentication
- Password reset via email
- Deep linking for password reset flow
- Session persistence with AsyncStorage

## 🐛 Troubleshooting

### Build Issues

If you encounter build errors:

1. Clear cache and reinstall:
```bash
rm -rf node_modules
npm install
```

2. Clear Expo cache:
```bash
npx expo start -c
```

3. For iOS, regenerate native project:
```bash
npx expo prebuild --clean
```

### Common Issues

**"Supabase credentials not found"**
- Make sure `.env` file exists with valid Supabase credentials
- Restart the dev server after adding environment variables

**"Password reset email not received"**
- Configure SMTP in Supabase Dashboard
- Add redirect URLs in Supabase Auth settings
- Check spam folder

**"App crashes on iOS"**
- Ensure you're using iOS 14.0+ deployment target
- Check that all native dependencies are properly linked
- Review Xcode console logs for specific errors

## 📄 License

© 2024 Solvra Labs. All rights reserved.

## 🤝 Support

For issues or questions, contact: hello@solvralabs.net

---

Built with 💚 using [Natively.dev](https://natively.dev)

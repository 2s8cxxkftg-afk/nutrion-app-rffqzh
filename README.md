
# Nutrion - Smart Pantry Management App

A React Native + Expo 54 app that helps users manage their pantry, track food expiration dates, and reduce food waste with AI-powered features.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or pnpm installed
- Expo CLI installed: `npm install -g expo-cli`
- For iOS: Xcode 14+ and iOS Simulator
- For Android: Android Studio and Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nutrion-app-rffqzh

# CRITICAL: Remove problematic dependency
npm uninstall react-native-maps

# Install dependencies
npm install

# Create .env file with your Supabase credentials
cp .env.example .env
# Edit .env and add your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

# Start the development server
npm run dev
```

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📱 Platform-Specific Setup

### iOS Setup

**CRITICAL**: Before building for iOS, you MUST remove react-native-maps:
```bash
npm uninstall react-native-maps
```

#### Development Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS project
eas init

# Build for iOS simulator
eas build --platform ios --profile development

# Or build locally (faster)
eas build --platform ios --profile development --local
```

#### TestFlight Submission
```bash
# Build production version
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

**See `IOS_QUICK_START.md` for detailed iOS instructions**

### Android Setup

```bash
# Build APK
eas build --platform android --profile production

# Or build AAB for Play Store
eas build --platform android --profile production-aab

# Submit to Play Store
eas submit --platform android
```

## 🏗️ Project Structure

```
nutrion-app-rffqzh/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── (home)/              # Home tab (iOS-specific version available)
│   │   ├── pantry.tsx           # Pantry management
│   │   ├── shopping.tsx         # Shopping list
│   │   └── profile.tsx          # User profile
│   ├── auth.tsx                 # Authentication screen
│   ├── add-item.tsx             # Add pantry item
│   ├── edit-item.tsx            # Edit pantry item
│   ├── ai-recipes.tsx           # AI recipe generator
│   ├── scan-receipt.tsx         # Receipt scanner
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable components
│   ├── FloatingTabBar.tsx       # Custom tab bar
│   ├── IconSymbol.tsx           # Cross-platform icons
│   ├── IconSymbol.ios.tsx       # iOS SF Symbols
│   └── Toast.tsx                # Toast notifications
├── contexts/                     # React contexts
│   ├── AuthContext.tsx          # Authentication state
│   └── WidgetContext.tsx        # iOS widget support
├── hooks/                        # Custom hooks
│   ├── useAIRecipes.ts          # AI recipe generation
│   └── useReceiptScanner.ts     # Receipt scanning
├── utils/                        # Utility functions
│   ├── supabase.ts              # Supabase client
│   ├── storage.ts               # Local storage
│   ├── notificationScheduler.ts # Notifications
│   └── i18n.ts                  # Internationalization
├── styles/                       # Styling
│   └── commonStyles.ts          # Shared styles
└── types/                        # TypeScript types
    └── pantry.ts                # Data types
```

## 🎯 Key Features

### Core Features
- ✅ Smart pantry inventory management
- ✅ Expiration date tracking with alerts
- ✅ Shopping list management
- ✅ Barcode scanning (camera)
- ✅ Manual item entry
- ✅ Category-based organization
- ✅ Dark mode support

### Premium Features (Supabase Edge Functions)
- 🌟 AI Recipe Generator (GPT-4)
- 🌟 Receipt Scanner (GPT-4 Vision)
- 🌟 Meal planning suggestions
- 🌟 Nutritional information

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Enable Email authentication
3. Deploy Edge Functions for AI features:
   - `generate-recipe-suggestions` - AI recipe generation
   - `generate-text` - Receipt scanning with GPT-4 Vision

### Deep Links
The app supports deep linking for password reset:
- Scheme: `nutrion://`
- Reset password: `nutrion://reset-password`

Configure in Supabase Dashboard:
1. Go to Authentication > URL Configuration
2. Add redirect URLs:
   - `nutrion://reset-password`
   - `exp://localhost:8081/--/reset-password`
   - Your production URL

## 🐛 Debugging

### Console Logs
All components use prefixed logging for easy debugging:
- `[Index]` - App initialization
- `[AuthProvider]` - Authentication
- `[Notifications]` - Notification system
- `[AIRecipes]` - Recipe generation
- `[FloatingTabBar]` - Tab navigation

### Common Issues

**"react-native-maps" causing crashes**
```bash
npm uninstall react-native-maps
```

**"Auth initialization timeout"**
- Check internet connection
- Verify Supabase credentials in `.env`

**"Widget functionality is iOS-only"**
- This is normal - widget feature is disabled for stability

**Camera not working**
- Grant camera permissions in iOS Settings
- Check `NSCameraUsageDescription` in app.json

**Tabs not navigating**
- Check `[FloatingTabBar]` logs
- Verify all tab screens exist

### Run Diagnostics
```bash
npx expo-doctor
```

## 📚 Documentation

- `IOS_FIXES_APPLIED.md` - Complete list of iOS fixes
- `IOS_QUICK_START.md` - Quick iOS setup guide
- `IOS_TROUBLESHOOTING.md` - This file

## 🧪 Testing

### Manual Testing Checklist
- [ ] App launches without crashing
- [ ] Introduction screens work
- [ ] Sign up / Sign in works
- [ ] Tab navigation works
- [ ] Add item works
- [ ] Edit item works
- [ ] Delete item works
- [ ] Camera opens
- [ ] Notifications work
- [ ] AI recipes work (premium)
- [ ] Receipt scanning works (premium)
- [ ] Sign out works
- [ ] Dark mode works

### Automated Testing
```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## 🚢 Deployment

### iOS TestFlight
```bash
# Build
eas build --platform ios --profile production

# Submit
eas submit --platform ios
```

### Android Play Store
```bash
# Build AAB
eas build --platform android --profile production-aab

# Submit
eas submit --platform android
```

## 🔐 Security

- Authentication via Supabase Auth
- Secure token storage with expo-secure-store
- PKCE flow for OAuth
- Row Level Security (RLS) on Supabase

## 📄 License

© 2024 Solvra Labs. All rights reserved.

## 🆘 Support

- Email: hello@solvralabs.net
- Documentation: See `IOS_*.md` files
- Issues: Check console logs with component prefixes

## 🎉 What's New in This Version

### iOS Stability Improvements
- ✅ Removed react-native-maps dependency (major crash cause)
- ✅ Enhanced error handling with timeouts
- ✅ Comprehensive logging throughout app
- ✅ Fixed bundle identifier consistency
- ✅ Added deep link support for password reset
- ✅ Disabled problematic widget functionality
- ✅ Created missing base home screen
- ✅ Improved tab navigation
- ✅ Platform-specific optimizations

### Enhanced Debugging
- All components now have `[ComponentName]` log prefixes
- Better error messages with context
- Timeout handling for all async operations
- Graceful degradation when features fail

### Better User Experience
- Faster app initialization
- Improved offline support
- Better error messages
- Smoother animations
- More responsive UI

## 🔄 Migration Notes

If upgrading from a previous version:
1. Remove react-native-maps: `npm uninstall react-native-maps`
2. Clear caches: `npx expo start --clear`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Update app.json scheme to lowercase: `"scheme": "nutrion"`
5. Test all features thoroughly

## 📞 Getting Help

1. **Check logs first** - Look for `[ComponentName]` prefixes
2. **Run diagnostics** - `npx expo-doctor`
3. **Read troubleshooting** - See `IOS_TROUBLESHOOTING.md`
4. **Contact support** - hello@solvralabs.net with logs and screenshots

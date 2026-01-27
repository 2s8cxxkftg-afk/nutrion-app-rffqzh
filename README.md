# Nutrion

Smart pantry management app that helps you track food expiration dates, reduce waste, and plan meals.

## Features

- 📦 **Smart Pantry Inventory** - Track all your food items with expiration dates
- 🛒 **Shopping List** - Manage your grocery shopping efficiently
- 🔔 **Expiration Alerts** - Get notified before items expire
- 🤖 **AI Recipe Generator** (Premium) - Get personalized recipes based on your pantry
- 📸 **Receipt Scanner** (Premium) - Automatically add items from grocery receipts
- 🌙 **Dark Mode** - Full support for light and dark themes

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open the app:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

## Tech Stack

- **Framework**: React Native + Expo 54
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (authentication + database)
- **State Management**: React Context API
- **Styling**: React Native StyleSheet
- **Animations**: React Native Reanimated

## Project Structure

```
app/
  (tabs)/          # Main tab screens (Pantry, Shopping, Profile)
  auth.tsx         # Authentication screen
  add-item.tsx     # Add pantry item
  edit-item.tsx    # Edit pantry item
  ai-recipes.tsx   # AI recipe generator (premium)
  scan-receipt.tsx # Receipt scanner (premium)
components/        # Reusable UI components
utils/             # Helper functions and utilities
styles/            # Common styles and theme
types/             # TypeScript type definitions
```

## Environment Variables

Create a `.env` file with:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_APP_SCHEME=nutrion
```

## Building for Production

### iOS
```bash
npm run build:ios
```

### Android
```bash
npm run build:android
```

## License

© 2024 Solvra Labs. All rights reserved.

---

Made with 💚 by [Solvra Labs](https://solvralabs.net)

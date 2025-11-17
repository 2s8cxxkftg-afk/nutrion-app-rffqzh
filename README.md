
# Nutrion - Smart Pantry Management App

A React Native + Expo app for managing your pantry, tracking food expiration dates, and planning meals.

## Features

- **Smart Pantry Inventory**: Track food items with expiration dates
- **Expiration Alerts**: Get notified when items are about to expire
- **Shopping List**: Manage your grocery shopping with quantities
- **Multi-language Support**: Available in 20+ languages
- **User Profiles**: Personalized experience with profile management
- **Premium Subscription**: Enhanced features with 7-day free trial

## Tech Stack

- React Native 0.81.4
- Expo 54
- Supabase (Backend, Auth, Storage)
- TypeScript
- i18next (Internationalization)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Run on specific platform:
   ```bash
   npm run ios
   npm run android
   npm run web
   ```

## Project Structure

- `/app` - Application screens and navigation
- `/components` - Reusable UI components
- `/utils` - Utility functions and helpers
- `/types` - TypeScript type definitions
- `/styles` - Common styles and theme
- `/assets` - Images, fonts, and other static assets

## Environment Setup

The app requires a Supabase project with the following tables:
- `profiles` - User profile information
- `pantry_items` - Pantry inventory
- `shopping_items` - Shopping list items
- `subscriptions` - User subscription data

## License

Private - All rights reserved


# Nutrion App - Setup Instructions

## Current Status

The Nutrion app is fully functional with local storage using AsyncStorage. All core features work without requiring a backend:

- ✅ Pantry inventory management
- ✅ Expiration date tracking with color-coded indicators
- ✅ Meal planner with recipe suggestions
- ✅ Shopping list management
- ✅ Barcode scanning (camera integration)
- ✅ Pull-to-refresh functionality
- ✅ Date picker for expiration dates
- ✅ Search and filter capabilities

## Bugs Fixed

1. **Added useFocusEffect** - Items now reload automatically when navigating back to screens
2. **Added RefreshControl** - Pull-to-refresh functionality on all list screens
3. **Improved date picker** - Using native DateTimePicker instead of manual text entry
4. **Better error handling** - Try-catch blocks with user-friendly error messages
5. **Fixed padding issues** - Consistent bottom padding across platforms
6. **Enhanced tab bar** - Better contrast and visual feedback
7. **Added loading states** - Proper loading indicators and refresh states
8. **Stats tracking** - Profile screen now shows real-time statistics

## Optional: Supabase Integration

Supabase is **not required** for the app to function. However, if you want to add cloud sync and user authentication, follow these steps:

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait for the database to be provisioned
4. Go to Project Settings > API
5. Copy your project URL and anon key

### 3. Configure Credentials

Open `utils/supabase.ts` and:
1. Uncomment all the code
2. Replace `YOUR_SUPABASE_URL` with your project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your anon key

### 4. Create Database Tables

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE IF EXISTS pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shopping_items ENABLE ROW LEVEL SECURITY;

-- Pantry Items Table
CREATE TABLE pantry_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_date DATE NOT NULL,
  barcode TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes Table
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  instructions TEXT NOT NULL,
  prep_time INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping Items Table
CREATE TABLE shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
CREATE POLICY "Users can view their own pantry items"
  ON pantry_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pantry items"
  ON pantry_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry items"
  ON pantry_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pantry items"
  ON pantry_items FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for recipes and shopping_items
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shopping items"
  ON shopping_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping items"
  ON shopping_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items"
  ON shopping_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items"
  ON shopping_items FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Update Storage Functions

Modify `utils/storage.ts` to sync with Supabase when configured. You can keep AsyncStorage as a fallback for offline mode.

## Testing

1. **Test without Supabase**: The app works perfectly with local storage
2. **Test with Supabase**: After configuration, data will sync to the cloud
3. **Test offline mode**: App continues to work offline with AsyncStorage

## Known Limitations

- Barcode scanning shows barcode data but doesn't fetch product information (requires external API)
- Notifications are configured but not fully implemented (requires expo-notifications setup)
- Supabase integration is optional and requires manual setup

## Next Steps

1. Test all features with local storage
2. (Optional) Set up Supabase for cloud sync
3. (Optional) Integrate barcode lookup API (e.g., Open Food Facts)
4. (Optional) Implement push notifications for expiration alerts
5. (Optional) Add Stripe integration for subscription payments

## Support

For issues or questions:
- Check console logs for detailed error messages
- Verify AsyncStorage is working properly
- Ensure camera permissions are granted for barcode scanning
- Check date formats are correct (YYYY-MM-DD)

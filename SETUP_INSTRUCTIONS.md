
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
- ✅ **NEW: AI-Powered Recipe Suggestions with OpenAI**

## Bugs Fixed

1. **Added useFocusEffect** - Items now reload automatically when navigating back to screens
2. **Added RefreshControl** - Pull-to-refresh functionality on all list screens
3. **Improved date picker** - Using native DateTimePicker instead of manual text entry
4. **Better error handling** - Try-catch blocks with user-friendly error messages
5. **Fixed padding issues** - Consistent bottom padding across platforms
6. **Enhanced tab bar** - Better contrast and visual feedback
7. **Added loading states** - Proper loading indicators and refresh states
8. **Stats tracking** - Profile screen now shows real-time statistics

## NEW: OpenAI Integration for Recipe Suggestions

The app now includes AI-powered recipe suggestions! See **[OPENAI_SETUP.md](./OPENAI_SETUP.md)** for detailed setup instructions.

### Quick Setup:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to Supabase: **Project Settings** → **Edge Functions** → **Secrets**
   - Name: `OPENAI_API_KEY`
   - Value: Your API key
3. Test in the app: Go to **Planner** tab → Tap **"Get AI Recipe Suggestions"**

### Features:

- 🤖 AI analyzes your pantry and suggests creative recipes
- 📊 Shows match percentage for available ingredients
- 📝 Detailed cooking instructions
- ⏱️ Prep time and serving information
- 🔄 Toggle between AI suggestions and default recipes

## Supabase Integration (Required for OpenAI)

Supabase is **required** for the OpenAI integration to work. The app uses Supabase Edge Functions to securely call the OpenAI API.

### Supabase is Already Configured!

The app is already connected to your Supabase project:
- ✅ Project URL: `https://xivsfhdsmsxwtsidxfyj.supabase.co`
- ✅ Supabase client configured in `utils/supabase.ts`
- ✅ Edge function deployed: `generate-recipe-suggestions`

### Optional: Database Tables for Cloud Sync

If you want to sync pantry data to the cloud (optional), create these tables:

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

## Testing

1. **Test without OpenAI**: The app works perfectly with local storage and default recipes
2. **Test with OpenAI**: After adding API key, get AI-powered recipe suggestions
3. **Test offline mode**: App continues to work offline with AsyncStorage

## Known Limitations

- Barcode scanning shows barcode data but doesn't fetch product information (requires external API)
- Notifications are configured but not fully implemented (requires expo-notifications setup)
- OpenAI suggestions require internet connection and API credits

## Cost Information

- **OpenAI API**: ~$0.001-0.005 per suggestion (less than a penny)
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth, 50MB file storage
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## Next Steps

1. ✅ Test all features with local storage
2. ✅ Set up OpenAI API key for AI suggestions (see OPENAI_SETUP.md)
3. (Optional) Integrate barcode lookup API (e.g., Open Food Facts)
4. (Optional) Implement push notifications for expiration alerts
5. (Optional) Add Stripe integration for subscription payments
6. (Optional) Add user authentication for cloud sync

## Support

For issues or questions:
- Check console logs for detailed error messages
- Verify AsyncStorage is working properly
- Ensure camera permissions are granted for barcode scanning
- Check date formats are correct (YYYY-MM-DD)
- For OpenAI issues, see OPENAI_SETUP.md troubleshooting section

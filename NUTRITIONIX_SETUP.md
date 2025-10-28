
# Nutritionix API Setup Instructions

## Overview
The Food Search feature uses the Nutritionix API to provide smart predictive food suggestions similar to MyFitnessPal.

## Getting Your API Credentials

1. **Sign up for Nutritionix API**
   - Go to https://www.nutritionix.com/business/api
   - Click "Get Your API Key"
   - Sign up for a free developer account

2. **Get Your Credentials**
   - After signing up, you'll receive:
     - Application ID (x-app-id)
     - Application Key (x-app-key)

3. **Update the App**
   - Open `app/food-search.tsx`
   - Replace the placeholder values:
     ```typescript
     const NUTRITIONIX_APP_ID = 'YOUR_APP_ID'; // Replace with your actual app ID
     const NUTRITIONIX_APP_KEY = 'YOUR_APP_KEY'; // Replace with your actual app key
     ```

## API Features Used

- **Instant Search**: `/v2/search/instant` endpoint
  - Provides predictive suggestions as users type
  - Returns both common foods and branded items
  - Includes nutritional information and images

## API Limits

- Free tier: 500 requests per day
- Rate limit: 10 requests per second

## Alternative: Environment Variables

For better security, you can store credentials in environment variables:

1. Create a `.env` file in the project root:
   ```
   NUTRITIONIX_APP_ID=your_app_id_here
   NUTRITIONIX_APP_KEY=your_app_key_here
   ```

2. Install expo-constants if not already installed

3. Update the code to use environment variables:
   ```typescript
   import Constants from 'expo-constants';
   
   const NUTRITIONIX_APP_ID = Constants.expoConfig?.extra?.nutritionixAppId;
   const NUTRITIONIX_APP_KEY = Constants.expoConfig?.extra?.nutritionixAppKey;
   ```

## Testing

Once configured, test the Food Search feature:

1. Open the app
2. Navigate to Pantry screen
3. Tap the search icon (magnifying glass)
4. Type a food name (e.g., "banana", "chicken")
5. Results should appear after typing 2+ characters

## Troubleshooting

- **No results appearing**: Check your API credentials
- **401 Unauthorized**: Verify your app ID and key are correct
- **Rate limit exceeded**: Wait a few minutes or upgrade your plan
- **Network errors**: Check your internet connection

## Support

For API issues, contact Nutritionix support: https://www.nutritionix.com/contact

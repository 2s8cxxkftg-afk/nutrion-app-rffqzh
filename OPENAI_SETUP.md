
# OpenAI Integration Setup Guide for Nutrion

This guide will help you set up OpenAI integration for AI-powered recipe suggestions in your Nutrion app.

## Prerequisites

- A Supabase project (already configured)
- An OpenAI API account

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the API key (it starts with `sk-...`)
6. **Important**: Save this key securely - you won't be able to see it again!

## Step 2: Add OpenAI API Key to Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (the one starting with `sk-...`)
4. Click **Save**

## Step 3: Test the Integration

1. Open your Nutrion app
2. Add some items to your pantry (e.g., chicken, rice, tomatoes, onions)
3. Navigate to the **Planner** tab
4. Tap the **"Get AI Recipe Suggestions"** button
5. Wait a few seconds for the AI to generate suggestions
6. You should see creative recipe ideas based on your pantry items!

## Features

### AI-Powered Recipe Suggestions

The integration provides:

- **Smart Recipe Generation**: AI analyzes your pantry items and suggests creative recipes
- **Match Percentage**: Shows how many ingredients you already have
- **Detailed Instructions**: Step-by-step cooking instructions
- **Prep Time & Servings**: Practical information for meal planning
- **Category Tags**: Breakfast, Lunch, Dinner, Snack, or Dessert

### Toggle Between Views

- **AI Suggestions**: Creative, personalized recipes from OpenAI
- **Default Recipes**: Pre-loaded recipe database

## Cost Considerations

- OpenAI charges per API call based on tokens used
- The app uses `gpt-4o-mini` model which is cost-effective
- Typical cost per suggestion: ~$0.001-0.005 (less than a penny)
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## Troubleshooting

### "OpenAI API key not configured" Error

- Make sure you added the `OPENAI_API_KEY` secret in Supabase
- The secret name must be exactly `OPENAI_API_KEY` (case-sensitive)
- Redeploy the edge function if you just added the secret

### "No pantry items provided" Error

- Add at least one item to your pantry before requesting suggestions
- Go to the Pantry tab and add some food items

### Slow Response Times

- AI generation typically takes 3-10 seconds
- This is normal for AI processing
- Make sure you have a stable internet connection

### Empty or Invalid Suggestions

- Try adding more diverse items to your pantry
- The AI works best with 5+ different ingredients
- Check that your OpenAI account has available credits

## Advanced Customization

You can customize the AI suggestions by modifying the edge function:

1. Go to Supabase Dashboard → **Edge Functions** → `generate-recipe-suggestions`
2. Modify the prompt to include:
   - Dietary restrictions (vegetarian, vegan, gluten-free)
   - Cuisine preferences (Italian, Asian, Mexican)
   - Difficulty levels (beginner, intermediate, advanced)
   - Cooking methods (baking, grilling, slow-cooker)

Example modification in the edge function:

```typescript
// Add to the prompt
if (preferences?.dietary) {
  prompt += `Dietary preference: ${preferences.dietary}. `;
}
if (preferences?.cuisine) {
  prompt += `Cuisine preference: ${preferences.cuisine}. `;
}
```

Then update the frontend to pass these preferences when calling the function.

## Privacy & Security

- Your pantry data is only sent to OpenAI when you explicitly request suggestions
- No data is stored by OpenAI after processing
- All API calls are authenticated through Supabase
- Your OpenAI API key is securely stored in Supabase secrets

## Support

If you encounter any issues:

1. Check the Supabase Edge Function logs for errors
2. Verify your OpenAI API key is valid and has credits
3. Ensure your internet connection is stable
4. Check the app console logs for detailed error messages

## Next Steps

Consider adding:

- **Preference Settings**: Let users set dietary restrictions and cuisine preferences
- **Save Favorites**: Allow users to save AI-generated recipes
- **Shopping List Integration**: Auto-add missing ingredients to shopping list
- **Meal Planning**: Generate weekly meal plans based on pantry inventory
- **Nutritional Information**: Add calorie and macro tracking

Enjoy your AI-powered meal planning! 🍳✨


# OpenAI API Setup for Recipe Suggestions

## Overview
The AI Recipe Suggestions feature uses OpenAI's GPT-4o-mini model to generate diverse, culturally-rich recipe suggestions based on your pantry items.

## Setup Instructions

### 1. Get Your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (it starts with `sk-...`)

### 2. Add the API Key to Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **xivsfhdsmsxwtsidxfyj**
3. Navigate to **Edge Functions** → **Manage secrets**
4. Add a new secret:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-...`)
5. Click **Save**

### 3. Verify the Setup
After adding the API key:
1. Open the Nutrion app
2. Go to the **Planner** tab
3. Make sure you have some items in your pantry
4. Tap **Get AI Recipe Suggestions**
5. Wait for the recipes to generate (usually 2-5 seconds)

## Troubleshooting

### Error: "OpenAI API key not configured"
- **Solution**: The `OPENAI_API_KEY` environment variable is not set in Supabase
- Follow step 2 above to add the API key

### Error: "API quota exceeded"
- **Solution**: Your OpenAI account has run out of credits
- Add credits to your OpenAI account at [OpenAI Billing](https://platform.openai.com/account/billing)

### Error: "Too many requests"
- **Solution**: You've hit the rate limit
- Wait a few seconds and try again
- Consider upgrading your OpenAI plan for higher rate limits

### Error: "Failed to connect to OpenAI API"
- **Solution**: Network connectivity issue
- Check your internet connection
- Try again in a moment

### Error: "Invalid API key"
- **Solution**: The API key is incorrect or has been revoked
- Generate a new API key from OpenAI
- Update the `OPENAI_API_KEY` secret in Supabase

## Features

The AI Recipe Suggestions feature provides:

- **Diverse Cuisines**: Recipes from Chinese, Italian, Thai, Mexican, Indian, Japanese, and more
- **Cultural Context**: Interesting facts about each dish and its origin
- **Smart Matching**: Shows which ingredients you already have
- **Detailed Instructions**: Step-by-step cooking instructions
- **Nutritional Info**: Prep time, servings, and meal category

## API Usage & Costs

- **Model**: GPT-4o-mini (cost-effective and fast)
- **Average Cost**: ~$0.01-0.02 per recipe generation
- **Tokens Used**: ~1,500-2,500 tokens per request
- **Response Time**: 2-5 seconds

## Edge Function Details

The edge function is deployed at:
```
https://xivsfhdsmsxwtsidxfyj.supabase.co/functions/v1/generate-recipe-suggestions
```

**Current Version**: 4
**Status**: Active
**Last Updated**: Recently deployed with enhanced error handling

## Error Handling

The system now includes comprehensive error handling:

1. **Configuration Errors**: Clear messages when API key is missing
2. **API Errors**: User-friendly messages for rate limits, quota issues
3. **Network Errors**: Guidance for connectivity problems
4. **Parse Errors**: Fallback handling for malformed responses
5. **CORS Support**: Proper headers for cross-origin requests

## Support

If you continue to experience issues:

1. Check the Supabase Edge Function logs:
   - Go to **Edge Functions** → **generate-recipe-suggestions** → **Logs**
   - Look for error messages with ❌ emoji

2. Verify your OpenAI API key:
   - Test it at [OpenAI Playground](https://platform.openai.com/playground)

3. Check your OpenAI account status:
   - Ensure you have available credits
   - Check rate limits for your plan

## Recent Improvements

**Version 4 (Latest)**:
- ✅ Enhanced error handling with user-friendly messages
- ✅ CORS headers for all responses
- ✅ Better OpenAI error parsing
- ✅ Detailed logging for debugging
- ✅ Graceful fallbacks for missing data
- ✅ Configuration validation on startup

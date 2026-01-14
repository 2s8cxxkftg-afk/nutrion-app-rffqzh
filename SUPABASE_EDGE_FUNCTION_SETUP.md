
# Supabase Edge Function Setup Guide

This guide will help you deploy the `generate-text` Edge Function to enable AI recipe generation in the Nutrion app.

## Prerequisites

1. Supabase CLI installed
2. OpenAI API key
3. Supabase project (already created: xivsfhdsmsxwtsidxfyj)

## Step 1: Install Supabase CLI

If you haven't already, install the Supabase CLI:

```bash
npm install -g supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

## Step 3: Link Your Project

```bash
supabase link --project-ref xivsfhdsmsxwtsidxfyj
```

## Step 4: Deploy the Edge Function

The Edge Function code is already in `supabase/functions/generate-text/index.ts`. Deploy it with:

```bash
supabase functions deploy generate-text
```

## Step 5: Set OpenAI API Key

You need to add your OpenAI API key as a secret:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

### Alternative: Set via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/xivsfhdsmsxwtsidxfyj
2. Navigate to **Edge Functions** in the left sidebar
3. Click on **Manage secrets**
4. Add a new secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

## Step 6: Test the Function

You can test the function using the Supabase Dashboard or with curl:

```bash
curl -i --location --request POST 'https://xivsfhdsmsxwtsidxfyj.supabase.co/functions/v1/generate-text' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"prompt":"Generate a simple recipe using apples","system":"You are a chef","model":"gpt-4o-mini"}'
```

## Troubleshooting

### Error: "Failed to send a request to the Edge Function"

This usually means:
1. The Edge Function hasn't been deployed yet
2. The OpenAI API key hasn't been set
3. There's a network connectivity issue

**Solution:**
- Make sure you've completed steps 4 and 5 above
- Check the Edge Function logs in the Supabase Dashboard

### Error: "OpenAI API key not configured"

**Solution:**
- Set the OPENAI_API_KEY secret (Step 5)
- Redeploy the function after setting the secret

### How to View Logs

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click on **generate-text**
4. View the **Logs** tab

## Verification

Once deployed, the AI Recipe Generator in the app should work. You can verify by:

1. Opening the app
2. Going to the Profile tab
3. Tapping "AI Recipe Generator"
4. Adding some items to your pantry
5. Clicking "Generate Recipes"

If you see recipes generated, the setup is complete! 🎉

## Getting an OpenAI API Key

If you don't have an OpenAI API key:

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to **API Keys** in your account settings
4. Click **Create new secret key**
5. Copy the key (you won't be able to see it again!)
6. Use this key in Step 5 above

## Cost Considerations

The `gpt-4o-mini` model is very cost-effective:
- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens

A typical recipe generation request costs less than $0.01.

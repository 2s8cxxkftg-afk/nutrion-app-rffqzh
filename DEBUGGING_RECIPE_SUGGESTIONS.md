
# Quick Debugging Guide for Recipe Suggestions

## Quick Checks

### 1. Is the OpenAI API Key Set?
**Location**: Supabase Dashboard → Edge Functions → Manage secrets

**Check**:
- Look for a secret named `OPENAI_API_KEY`
- Value should start with `sk-`

**If Missing**:
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to Supabase secrets as `OPENAI_API_KEY`

### 2. Check Edge Function Logs
**Location**: Supabase Dashboard → Edge Functions → generate-recipe-suggestions → Logs

**What to Look For**:
- ✅ Success: "Successfully generated X recipes"
- ❌ Error: Look for error messages with ❌ emoji
- 🤖 API Call: "Calling OpenAI API..."

### 3. Test in the App
**Steps**:
1. Open Nutrion app
2. Go to Pantry tab
3. Add at least 3-5 items (e.g., rice, chicken, garlic, onion, soy sauce)
4. Go to Planner tab
5. Tap "Get AI Recipe Suggestions"
6. Wait 2-5 seconds

**Expected Result**:
- Loading spinner appears
- Success toast: "Generated X diverse recipe suggestions!"
- Recipes appear with cuisine types and cultural context

## Common Errors & Solutions

### Error: "OpenAI API key is not configured"
**Cause**: Missing `OPENAI_API_KEY` in Supabase secrets

**Solution**:
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy the key (starts with `sk-`)
4. Go to Supabase Dashboard → Edge Functions → Manage secrets
5. Add secret: Name = `OPENAI_API_KEY`, Value = your key
6. Try again in the app

### Error: "Too many requests"
**Cause**: OpenAI rate limit exceeded

**Solution**:
- Wait 30-60 seconds
- Try again
- Consider upgrading OpenAI plan for higher limits

### Error: "API quota exceeded"
**Cause**: OpenAI account out of credits

**Solution**:
1. Go to [OpenAI Billing](https://platform.openai.com/account/billing)
2. Add credits to your account
3. Try again in the app

### Error: "Network error"
**Cause**: No internet connection or network issue

**Solution**:
- Check device internet connection
- Try again
- Check if OpenAI API is down at [OpenAI Status](https://status.openai.com/)

### Error: "Failed to generate suggestions"
**Cause**: Generic error, check logs for details

**Solution**:
1. Check Supabase Edge Function logs
2. Look for specific error message
3. Follow troubleshooting for that specific error

## Testing the Fix

### Test 1: Basic Functionality
```
1. Add items to pantry: rice, chicken, garlic, onion, soy sauce
2. Go to Planner tab
3. Tap "Get AI Recipe Suggestions"
4. Expected: 4-6 recipes from different cuisines
```

### Test 2: Error Handling (No API Key)
```
1. Remove OPENAI_API_KEY from Supabase secrets
2. Try to generate suggestions
3. Expected: Clear error message about missing API key
4. Re-add the API key
```

### Test 3: Error Handling (No Pantry Items)
```
1. Clear all pantry items
2. Go to Planner tab
3. Tap "Get AI Recipe Suggestions"
4. Expected: Alert asking to add pantry items first
```

### Test 4: Multiple Requests
```
1. Generate suggestions once
2. Wait for completion
3. Generate again immediately
4. Expected: Both requests should succeed (or rate limit message)
```

## Monitoring

### Real-time Logs
**Command** (if using Supabase CLI):
```bash
supabase functions logs generate-recipe-suggestions --project-ref xivsfhdsmsxwtsidxfyj
```

### Dashboard Logs
1. Go to Supabase Dashboard
2. Select project: xivsfhdsmsxwtsidxfyj
3. Navigate to Edge Functions → generate-recipe-suggestions
4. Click "Logs" tab
5. Set time range to "Last hour"

### What to Monitor
- **Request Count**: How many requests per hour
- **Success Rate**: Percentage of 200 responses
- **Error Rate**: Percentage of 4xx/5xx responses
- **Response Time**: Average time to generate recipes
- **Token Usage**: OpenAI tokens consumed

## Performance Metrics

### Normal Operation
- **Response Time**: 2-5 seconds
- **Success Rate**: >95%
- **Token Usage**: 1,500-2,500 per request
- **Cost**: $0.01-0.02 per request

### Warning Signs
- Response time >10 seconds
- Success rate <80%
- Frequent rate limit errors
- High token usage (>3,000 per request)

## Quick Fixes

### Fix 1: Restart Edge Function
1. Go to Supabase Dashboard
2. Edge Functions → generate-recipe-suggestions
3. Click "Redeploy"
4. Wait for deployment to complete

### Fix 2: Clear App Cache
1. Close Nutrion app completely
2. Clear app cache (device settings)
3. Reopen app
4. Try again

### Fix 3: Verify API Key
1. Copy your OpenAI API key from Supabase secrets
2. Test it at [OpenAI Playground](https://platform.openai.com/playground)
3. If it doesn't work, generate a new key
4. Update Supabase secret with new key

## Contact Information

### OpenAI Support
- Dashboard: https://platform.openai.com/
- Status: https://status.openai.com/
- Docs: https://platform.openai.com/docs

### Supabase Support
- Dashboard: https://supabase.com/dashboard
- Status: https://status.supabase.com/
- Docs: https://supabase.com/docs

## Checklist

Before reporting an issue, verify:

- [ ] OpenAI API key is set in Supabase secrets
- [ ] API key is valid (test in OpenAI Playground)
- [ ] OpenAI account has available credits
- [ ] Pantry has at least 3-5 items
- [ ] Internet connection is working
- [ ] Edge function logs show specific error
- [ ] Tried waiting 1 minute and retrying
- [ ] App is up to date
- [ ] Supabase project is active

## Version Info

- **Edge Function Version**: 4 (latest)
- **Last Updated**: Recently deployed
- **Status**: Active
- **Model**: GPT-4o-mini
- **Features**: Diverse cuisines, cultural context, smart matching

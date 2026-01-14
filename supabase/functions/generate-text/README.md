
# Generate Text Edge Function

This Supabase Edge Function generates text using OpenAI's GPT models.

## Setup

1. Deploy this function to Supabase:
   ```bash
   supabase functions deploy generate-text
   ```

2. Set the OpenAI API key as a secret:
   ```bash
   supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
   ```

   Or set it in the Supabase Dashboard:
   - Go to your project in Supabase Dashboard
   - Navigate to Edge Functions
   - Click on "Manage secrets"
   - Add `OPENAI_API_KEY` with your OpenAI API key

## Usage

The function accepts the following parameters:

- `prompt` (required): The text prompt to send to OpenAI
- `system` (optional): System message to set the context
- `temperature` (optional, default: 0.7): Controls randomness (0-1)
- `max_tokens` (optional, default: 1000): Maximum tokens to generate
- `format` (optional, default: 'text'): Response format ('text' or 'json')
- `model` (optional, default: 'gpt-4o-mini'): OpenAI model to use

## Example Request

```javascript
const { data, error } = await supabase.functions.invoke('generate-text', {
  body: {
    prompt: 'Generate 3 recipes using apples and cinnamon',
    system: 'You are a professional chef',
    temperature: 0.8,
    max_tokens: 2000,
    format: 'json',
    model: 'gpt-4o-mini'
  }
})
```

## Response

```json
{
  "text": "Generated text content",
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 200,
    "total_tokens": 300
  }
}
```

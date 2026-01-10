
# Fix HTML Entity Display Issue

## Problem
Text displays `Don&apos;t` instead of `Don't` - HTML entities are rendering as literal text.

## Solution
Replace all instances of `&apos;` with `'` (apostrophe character) in your JSX/TSX files.

### Example Fix:
```tsx
// ❌ Wrong
<Text>Don&apos;t have an account? Sign Up</Text>

// ✅ Correct
<Text>Don't have an account? Sign Up</Text>
```

### Files to Check:
- Authentication screens (login/signup)
- Any text containing contractions (don't, can't, won't, etc.)

This ensures proper text rendering in React Native.

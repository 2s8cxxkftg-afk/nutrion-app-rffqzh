
# UI/UX Improvements Implementation Plan

## 1. Profile Display Name Fix
- Update `app/(tabs)/profile.tsx` to use `user.name` from AuthContext instead of hardcoded "John Doe"
- Import `useAuth()` hook and display `user?.name || user?.email || 'User'`

## 2. Number Input with Dropdown Arrows
- Create new component `components/NumberInput.tsx` with up/down arrow buttons
- Style to match the attached image (boxed input with arrow dropdown)
- Replace quantity inputs in add-item and edit-item screens
- Support both tap arrows and manual text input

## 3. Receipt Scanner Integration
- Add "Scan Receipt" button to pantry/home page
- Navigate to existing receipt scanner functionality
- Use IconSymbol with "camera" or "doc.text.viewfinder" icon

## 4. AI Recipe Generator Page
- Create new route `app/ai-recipes.tsx`
- Add navigation button from home/pantry page
- Design with recipe card layout and generation interface
- Use IconSymbol with "sparkles" or "wand.and.stars" icon

## Implementation Notes
- Use existing GlassView components for consistent styling
- Follow theme colors from `@react-navigation/native`
- Maintain floating tab bar spacing (paddingBottom: 100)
- Use IconSymbol for all icons (iOS + Android support)

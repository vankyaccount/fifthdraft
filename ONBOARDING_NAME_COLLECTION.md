# Onboarding Name Collection Enhancement

**Date**: January 9, 2026
**Status**: ✅ Implemented

---

## Feature Added

### Name Collection During Onboarding

Added a welcome step (Step 0) to the onboarding flow that collects the user's name before personalization settings.

---

## Changes Made

### 1. New Welcome Step (Step 0)

**What it does**:
- Greets user with "Welcome to FifthDraft! 👋"
- Asks "What should we call you?"
- Optional text input field for user's name
- User can skip by leaving it blank

**UI Features**:
- Clean, centered design with user icon
- Autofocus on name input for immediate typing
- Optional field (can proceed without entering name)
- Clear helper text: "This helps personalize your experience. You can skip this if you prefer."

### 2. Updated Onboarding Flow

**Before**: 3 steps (Writing Style → Note Structure → Confirmation)
**After**: 4 steps (Welcome/Name → Writing Style → Note Structure → Confirmation)

**Progress Bar**:
- Updated from "Step X of 3" to "Step X of 4"
- Progress percentage recalculated: `((step + 1) / 4) * 100`

**Navigation**:
- Step 0 (Welcome): No back button, only "Continue"
- Step 1 (Writing Style): Back button goes to Step 0
- Step 2 (Note Structure): Back button goes to Step 1
- Step 3 (Confirmation): Back button goes to Step 2

### 3. Database Integration

**What gets saved**:
```typescript
await supabase
  .from('profiles')
  .update({
    full_name: fullName.trim() || null,  // NEW: Save name
    onboarding_completed: true,           // NEW: Mark onboarding done
    settings: {
      writing_style: writingStyle,
      note_structure: noteStructure,
      output_preferences: { ... }
    }
  })
  .eq('id', user.id)
```

**Data handling**:
- Name is trimmed to remove whitespace
- If blank, saves `null` (not empty string)
- `onboarding_completed` flag set to `true`

---

## How It Works

### User Journey

1. **User signs up** → Redirected to `/onboarding`
2. **Step 0 (Welcome)**:
   - See friendly welcome message
   - Enter name (optional)
   - Click "Continue"
3. **Step 1 (Writing Style)**:
   - Select tone, formality, detail level
   - See preview of how notes will look
   - Can go back to edit name
4. **Step 2 (Note Structure)**:
   - Choose which sections to include
   - Select from 6 options (summary, key points, etc.)
5. **Step 3 (Confirmation)**:
   - Review all settings
   - Click "Go to Dashboard"
6. **Saved to database**:
   - Name → `profiles.full_name`
   - Settings → `profiles.settings`
   - Flag → `profiles.onboarding_completed = true`

### Where Name Appears

Once saved, the user's name appears in:

1. **Dashboard Sidebar** (Bottom):
   ```
   [Avatar]  John Doe
             Free Plan
   ```

2. **Dashboard Header** (Top):
   ```
   Welcome back, John Doe!
   0 / 30 minutes used this month
   ```

3. **Fallback Behavior**:
   - If no name entered → Shows "User" in sidebar
   - Header uses email username: "Welcome back, john.doe!"
   - Can be updated later in Settings (when implemented)

---

## Code Changes

### File Modified: `src/app/onboarding/page.tsx`

**State added**:
```typescript
const [step, setStep] = useState(0)  // Changed from 1 to 0
const [fullName, setFullName] = useState('')  // NEW
```

**Save function updated**:
```typescript
full_name: fullName.trim() || null,  // Added
onboarding_completed: true,           // Added
```

**New Step 0 JSX**:
```tsx
{step === 0 && (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <div className="text-center mb-8">
      <div className="w-20 h-20 bg-indigo-100 rounded-full...">
        <svg>...</svg> {/* User icon */}
      </div>
      <h1>Welcome to FifthDraft! 👋</h1>
      <p>Let's get to know you and set up your perfect note-taking experience</p>
    </div>

    <div className="max-w-md mx-auto">
      <label>What should we call you?</label>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Enter your name (optional)"
        autoFocus
      />
      <p className="text-sm text-gray-500">
        This helps personalize your experience. You can skip this if you prefer.
      </p>
    </div>

    <button onClick={() => setStep(1)}>Continue</button>
  </div>
)}
```

---

## Benefits

### User Experience
✅ More welcoming onboarding flow
✅ Personalized dashboard with user's name
✅ Optional - doesn't force users to provide name
✅ Can proceed even if skipped

### Technical
✅ Properly saves to database
✅ Sets `onboarding_completed` flag for tracking
✅ Trims whitespace (prevents " " as name)
✅ Stores `null` if blank (clean data)

### Future-Proof
✅ Name can be edited in Settings page later
✅ `onboarding_completed` flag can trigger different UX
✅ Can add more steps without breaking flow

---

## Testing Checklist

- [ ] New user sees Step 0 first
- [ ] Name input has autofocus
- [ ] Can proceed with blank name
- [ ] Name is saved to `profiles.full_name`
- [ ] Sidebar shows name (or "User" if blank)
- [ ] Header shows name (or email username if blank)
- [ ] Progress bar shows "Step 1 of 4" correctly
- [ ] Back button on Step 1 returns to Step 0
- [ ] All 4 steps work in sequence

---

## Optional Future Enhancements

1. **Name validation**:
   - Min/max length (e.g., 2-50 characters)
   - Character validation (letters, spaces, hyphens)
   - Display validation error inline

2. **Profile picture upload**:
   - Add Step 0.5 for avatar upload
   - Or defer to Settings page

3. **Email confirmation**:
   - Show user's email with "Is this correct?"
   - Allow editing if wrong

4. **Skip onboarding option**:
   - "Skip and use defaults" button
   - Quick setup for users who want to jump in

5. **Personalization**:
   - Use name in welcome messages
   - "Good morning, John!"
   - Personalized tips based on preferences

---

## Summary

✅ **Added**: Welcome step with name collection
✅ **Updated**: Onboarding flow from 3 to 4 steps
✅ **Saved**: Name to `profiles.full_name` column
✅ **Fixed**: Sidebar now shows user's name instead of generic "User"
✅ **Result**: More personalized, welcoming user experience

The onboarding flow now properly collects and saves the user's name, which appears throughout the dashboard interface.

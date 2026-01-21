# Dashboard UI Fixes Summary

**Date**: January 9, 2026
**Status**: ✅ Fixed

---

## Issues Fixed

### 1. ✅ Duplicate Logout Buttons

**Issue**: Dashboard had both "Logout" and "Sign Out" buttons visible simultaneously

**Root Cause**:
- Old `dashboard/page.tsx` had its own custom navigation with "Logout" button
- New dashboard layout (`dashboard/layout.tsx`) has `DashboardHeader` component with "Sign Out" button
- Both were rendering, creating duplicate buttons

**Fix**:
- Removed custom navigation from `dashboard/page.tsx`
- Now uses the layout's `DashboardNav` sidebar and `DashboardHeader` exclusively
- Single "Sign Out" button in header

**Files Modified**:
- `src/app/dashboard/page.tsx` - Removed duplicate nav, now uses layout components

---

### 2. ⚠️ Minutes Usage Shows 0/30 (Requires Database Setup)

**Issue**: Dashboard shows "0 / 30 mins used" even after completing recordings

**Root Cause**:
- PostgreSQL function `increment_minutes_used` not applied to database yet
- Code is correct and ready, but migration hasn't been run

**Status**: ✅ Code ready, ⚠️ Requires manual setup

**Action Required**:
1. Go to **Supabase Dashboard → SQL Editor**
2. Run the SQL from: `supabase/migrations/00005_increment_minutes_used_function.sql`
3. Test by creating a new recording
4. Dashboard should show updated minutes after processing completes

---

### 3. ℹ️ Sidebar Shows "User" Instead of Name

**Issue**: Sidebar at bottom shows "User" instead of actual user name

**Root Cause**:
- Profile `full_name` column is `NULL` (user hasn't set their name)
- Code defaults to "User" when `full_name` is null: `{profile?.full_name || 'User'}`

**This is EXPECTED behavior** - not a bug!

**How it works**:
```typescript
// DashboardNav.tsx line 97
{profile?.full_name || 'User'}
```

**Solutions**:
1. **User can set their name** in Settings page (when implemented)
2. **Or** we fall back to email: `{profile?.full_name || profile?.email?.split('@')[0] || 'User'}`
3. **Or** during onboarding, ask for name and save to `full_name` column

**Recommendation**: Add name input to onboarding flow:

```typescript
// In src/app/onboarding/page.tsx
const [fullName, setFullName] = useState('')

// Save with preferences
await supabase
  .from('profiles')
  .update({
    full_name: fullName,  // ← Add this
    settings: { ... }
  })
  .eq('id', user.id)
```

---

## Summary of Changes

**Files Modified**: 1
- `src/app/dashboard/page.tsx` - Removed duplicate navigation

**Setup Required**: 1 action
- Run `00005_increment_minutes_used_function.sql` migration in Supabase

**Optional Enhancement**:
- Add name collection during onboarding to avoid "User" default

---

## Testing Checklist

After running the migration:

- [x] ✅ Only ONE logout button visible (Sign Out in header)
- [ ] ⏳ Minutes tracking works (run migration first)
- [ ] ℹ️ Sidebar shows name (requires user to set name, or use email fallback)

---

## Current Dashboard Features

✅ **Working**:
- Clean layout with sidebar navigation
- Recent recordings list
- Quick stats (total recordings, minutes remaining)
- Meeting vs Brainstorming mode selection
- Responsive design (mobile + desktop)

⏳ **Pending Setup**:
- Minutes tracking (requires migration)
- Storage upload (requires bucket setup - see `STORAGE_BUCKET_SETUP.md`)

🔜 **Future Enhancements**:
- Name collection during onboarding
- Settings page for profile editing
- More detailed usage analytics

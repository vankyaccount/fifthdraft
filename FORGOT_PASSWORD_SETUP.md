# Forgot Password Functionality - Setup Guide

## Overview

The forgot password functionality has been successfully implemented with a complete user flow that includes:

1. **Forgot Password Page** (`/forgot-password`) - Where users request a password reset
2. **Reset Password Page** (`/reset-password`) - Where users set their new password
3. **Updated Login Page** - With a link to the forgot password page

## File Structure

```
src/app/(auth)/
├── login/
│   └── page.tsx          # Updated with link to forgot-password
├── forgot-password/
│   └── page.tsx          # New: Request password reset
└── reset-password/
    └── page.tsx          # New: Set new password
```

## User Flow

### 1. Request Password Reset
- User navigates to `/forgot-password` (or clicks "Forgot your password?" on login page)
- User enters their email address
- System sends password reset email via Supabase Auth
- User sees confirmation message with option to try again if needed

### 2. Email Link
- User receives email with reset link
- Link contains secure token and redirects to `/reset-password`
- Token is automatically validated when page loads

### 3. Set New Password
- User enters new password (minimum 6 characters)
- User confirms new password
- System validates password match and strength
- Upon success, user is automatically logged in and redirected to dashboard

## Supabase Configuration

### Required Settings

You need to configure the redirect URL in your Supabase project:

#### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add the following redirect URL to **Redirect URLs**:
   ```
   http://localhost:3000/reset-password
   ```
4. For production, also add:
   ```
   https://yourdomain.com/reset-password
   ```
5. Click **Save**

#### Option 2: Via Supabase CLI

If you're using Supabase CLI, update your `supabase/config.toml`:

```toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/reset-password"]
```

### Email Template (Optional Customization)

To customize the password reset email:

1. Go to **Authentication** → **Email Templates** in Supabase Dashboard
2. Select **Reset Password** template
3. Customize the email content while keeping the `{{ .ConfirmationURL }}` variable
4. Example template:
   ```html
   <h2>Reset your password</h2>
   <p>Follow this link to reset your password:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   <p>If you didn't request this, you can safely ignore this email.</p>
   ```

## Features

### Security Features
- ✅ Token expiration (configurable in Supabase)
- ✅ Secure password reset flow using Supabase Auth
- ✅ Password strength validation (minimum 6 characters)
- ✅ Password confirmation matching
- ✅ Invalid/expired token detection

### User Experience Features
- ✅ Clear error and success messages
- ✅ Loading states during API calls
- ✅ Ability to retry if email isn't received
- ✅ Automatic redirect after successful reset
- ✅ Mobile-responsive design
- ✅ Consistent styling with existing auth pages

### Middleware Protection
- ✅ `/forgot-password` - Public access, redirects authenticated users to dashboard
- ✅ `/reset-password` - Requires valid reset token from email
- ✅ Proper route protection in `src/middleware.ts`

## Testing the Flow

### Local Testing

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the forgot password flow:**
   - Navigate to `http://localhost:3000/login`
   - Click "Forgot your password?"
   - Enter a test user email
   - Check your email inbox (or Supabase logs for development)
   - Click the reset link in the email
   - Enter and confirm new password
   - Verify redirect to dashboard

### Email Testing Tips

**Development Environment:**
- Check Supabase dashboard logs: **Authentication** → **Logs**
- Emails in development may go to spam
- Consider using a test email service like Mailtrap for development

**Production Environment:**
- Configure SMTP settings in Supabase for reliable email delivery
- Test with multiple email providers (Gmail, Outlook, etc.)
- Check email deliverability

## Troubleshooting

### Email Not Received
1. Check Supabase authentication logs
2. Verify email exists in your users database
3. Check spam/junk folder
4. Verify SMTP configuration (production)
5. Check rate limiting settings in Supabase

### "Invalid or Expired Link" Error
1. Links expire after a set time (default: 1 hour)
2. Links can only be used once
3. Request a new reset link
4. Check if redirect URL is properly configured in Supabase

### Password Not Updating
1. Ensure password meets minimum requirements (6+ characters)
2. Check browser console for errors
3. Verify Supabase connection
4. Check authentication logs in Supabase dashboard

### Redirect Issues
1. Verify redirect URLs in Supabase dashboard
2. Check middleware configuration in `src/middleware.ts`
3. Clear browser cache and cookies
4. Check for environment variable mismatches

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Code Highlights

### Forgot Password Request
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
})
```

### Password Update
```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword,
})
```

### Token Validation
```typescript
const { data: { session }, error } = await supabase.auth.getSession()
// Session exists if user clicked valid reset link
```

## Best Practices Implemented

1. **Clear User Communication** - Users always know what's happening
2. **Error Handling** - All error states are handled gracefully
3. **Security** - Uses Supabase's built-in security features
4. **Accessibility** - Proper labels and semantic HTML
5. **Mobile Responsive** - Works on all device sizes
6. **Consistent Design** - Matches existing auth pages

## Next Steps

1. **Configure Supabase redirect URLs** (see Configuration section above)
2. **Test the complete flow** with a test user
3. **Customize email templates** (optional)
4. **Set up production SMTP** for reliable email delivery
5. **Monitor authentication logs** for any issues

## Support

If you encounter issues:
1. Check Supabase authentication logs
2. Verify all configuration settings
3. Review the troubleshooting section above
4. Check browser console for client-side errors
5. Review server logs for server-side errors

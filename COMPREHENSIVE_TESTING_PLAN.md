# FifthDraft - Comprehensive End-to-End Testing Plan

## Executive Summary

This document outlines a complete testing strategy for FifthDraft covering all user flows, features, and user journeys from signup through advanced feature usage. Testing will be conducted in a Dev/Test environment using Supabase for development, with a migration path to self-hosted VPS PostgreSQL for production.

---

## 1. TEST ENVIRONMENT SETUP

### 1.1 Development Environment (Current)
- **Database**: Supabase (Development Instance)
- **Deployment**: Local or staging server
- **Purpose**: Feature development, initial testing
- **Data**: Test fixtures, synthetic user data

### 1.2 Testing Environment (Recommended)
- **Database**: Supabase (Staging Instance)
- **Deployment**: Staging server (prod-like)
- **Purpose**: End-to-end testing, QA validation
- **Data**: Test fixtures matching production scenario
- **Duration**: 2-week cycle before production deployment

### 1.3 Production Environment (Post-Migration)
- **Database**: Self-Hosted PostgreSQL on VPS
- **Deployment**: Production VPS
- **Purpose**: Live user data
- **Data**: Real user data
- **Backup Strategy**: Daily automated backups with 30-day retention

---

## 2. USER FLOW MATRIX

### 2.1 Authentication Flows

#### Flow 1: New User Signup
**Path**: `/signup` → Verification → Dashboard

**Test Steps**:
1. Navigate to landing page
2. Click "Get Started Free" CTA
3. Fill signup form (email, password)
4. Verify password validation rules applied
5. Check email verification link sent
6. Click verification link
7. Redirect to `/onboarding` or dashboard
8. Verify user record created in database
9. Verify initial free tier quota allocated (30 min/month)

**Expected Results**:
- Email sent with verification link
- User account created with "free" tier
- User can access dashboard
- Quota reset logic works (monthly reset)
- Session persists across page reloads

**Test Scenarios**:
- Valid email, valid password
- Invalid email format
- Password too short
- Password without special characters
- Existing email (duplicate)
- Email verification link expired (24h+ old)
- Multiple signup attempts in quick succession

---

#### Flow 2: Existing User Login
**Path**: `/login` → Dashboard

**Test Steps**:
1. Navigate to login page
2. Enter email and password
3. Click "Sign In"
4. Verify redirect to dashboard
5. Check session persists across pages
6. Verify "Stay signed in" toggle works
7. Close browser and reopen - verify persistence

**Expected Results**:
- Correct credentials → dashboard access
- Wrong password → error message shown
- Non-existent email → error message shown
- Session persists (localStorage/cookie)
- User settings load correctly

**Test Scenarios**:
- Correct credentials
- Wrong password
- Email doesn't exist
- Account locked (after N failed attempts)
- Remember me toggle enabled
- Login from different devices
- Concurrent sessions

---

#### Flow 3: Password Recovery
**Path**: Forgot Password → Email Link → Reset Password

**Test Steps**:
1. Navigate to `/forgot-password`
2. Enter email
3. Click "Send Reset Link"
4. Check password reset email received
5. Click reset link in email
6. Verify redirect to `/reset-password?token=...`
7. Enter new password
8. Submit password reset
9. Verify can login with new password
10. Verify old password doesn't work

**Expected Results**:
- Reset email sent
- Reset link valid for 24 hours
- Password actually changes
- Old session invalidated
- User can login immediately with new password

**Test Scenarios**:
- Valid reset link
- Expired reset link (>24h)
- Already-used reset link
- Invalid token format
- Password doesn't meet requirements
- Same password as before (rejected)

---

#### Flow 4: Email Verification
**Path**: `/verify-email` page handling

**Test Steps**:
1. New signup without immediate verification click
2. Check user account status (verified: false)
3. Access verification page with token
4. Verify account status changes (verified: true)
5. Verify dashboard access unchanged
6. Attempt to verify same token twice
7. Verify second attempt fails or shows "already verified"

**Expected Results**:
- Unverified users can still access most features
- Verification link works one time only
- Expired links don't work
- Users can resend verification email

---

### 2.2 Onboarding Flows

#### Flow 5: Post-Signup Onboarding
**Path**: `/signup` → `/onboarding` → Dashboard → Recording

**Test Steps**:
1. Complete signup
2. Redirect to onboarding automatically
3. Step 0: Welcome + Name Collection
   - Enter first name and last name
   - Verify names saved to user profile
4. Step 1: Writing Style Preferences
   - Select tone (Professional, Casual, etc.)
   - Select formality level
   - Select detail level
   - Verify selections saved
5. Step 2: Note Structure Preferences
   - Check/uncheck note structure components
   - Example options: Action Items, Decisions, Key Points
   - Verify selections saved
6. Step 3: Confirmation
   - Review preferences
   - Click "Done" or "Finish"
   - Redirect to dashboard
7. Verify preferences applied in first recording

**Expected Results**:
- All preferences saved to user profile
- Can skip onboarding if desired
- Preferences persist across sessions
- First recording uses selected preferences
- Can edit preferences later in settings

**Test Scenarios**:
- Complete full onboarding
- Skip onboarding
- Go back to previous steps
- Edit preferences after completing onboarding
- Use defaults if no preference selected

---

### 2.3 Dashboard Flows

#### Flow 6: Dashboard Home Page
**Path**: `/dashboard` → See overview

**Test Steps**:
1. Login as free tier user
2. Navigate to `/dashboard`
3. Verify page loads with:
   - Welcome message with user's name
   - Monthly quota display (30/30 minutes for free)
   - Recording history/recent recordings
   - Quick action buttons (Start Recording, New Note, etc.)
   - Upgrade CTA visible to free users
4. Login as Pro user
5. Verify quota shows 2000 minutes/month
6. Verify "Idea Studio" recording option available
7. Login as Pro+ user
8. Verify quota shows 4000 minutes/month
9. Verify "System Audio" option available

**Expected Results**:
- Correct quota displayed per tier
- Monthly quota resets on schedule
- Recent recording list accurate
- Recording counts accurate
- UI elements appropriate for tier

**Test Scenarios**:
- Free user (limited features)
- Pro user (all features)
- Pro+ user (team features if available)
- User with no recordings
- User with 100+ recordings
- Quota almost exhausted (1 minute left)
- Quota completely exhausted

---

#### Flow 7: Recording Mode Selection
**Path**: `/dashboard` → Click Recording Type

**Test Steps**:
1. Free user clicks "Start Recording"
2. Verify only "Meeting Notes" option available
3. Verify "Idea Studio" grayed out with "Pro Feature" label
4. Pro user clicks "Start Recording"
5. Verify both "Meeting Notes" and "Idea Studio" available
6. Pro user selects "Idea Studio"
7. Verify redirect to `/dashboard/record?mode=brainstorming`
8. Pro user selects "Meeting Notes"
9. Verify redirect to `/dashboard/record?mode=meeting`
10. Pro+ user clicks "System Audio" option
11. Verify system audio permission dialog appears

**Expected Results**:
- Feature availability matches tier
- Correct recording page loads
- System audio options appear for Pro+
- Lock icons appear on unavailable features

---

### 2.4 Recording Flows

#### Flow 8: Browser Recording (Meeting Notes)
**Path**: `/dashboard/record?mode=meeting` → Record → Process → View Notes

**Test Steps**:
1. Navigate to recording page
2. Verify microphone permission request
3. Click "Start Recording"
4. Speak test text: "Today we discussed the new project timeline. Key decisions: launch in Q2, budget approved. Action items: Sarah to draft requirements, John to schedule kickoff."
5. Allow recording for 30-60 seconds
6. Click "Stop Recording"
7. Verify audio playback works
8. Click "Generate Notes"
9. Verify loading state appears
10. Wait for transcription and processing
11. Verify notes appear with:
    - Full transcript
    - Extracted action items
    - Key decisions highlighted
    - Professional formatting
12. Verify export buttons available (MD, PDF, DOCX)
13. Click "Export as PDF"
14. Verify PDF downloads and contains all sections

**Expected Results**:
- Audio captures cleanly
- Transcription is accurate
- Meeting notes format is correct
- All required sections present
- Export works for all formats
- Notes saved to database

**Test Scenarios**:
- Clear audio input
- Background noise
- Multiple speakers
- Accented speech
- Technical jargon
- Recording < 10 seconds (too short)
- Recording > tier quota (rejected)

---

#### Flow 9: Browser Recording (Idea Studio)
**Path**: `/dashboard/record?mode=brainstorming` → Record → Process → View Insights

**Test Steps**:
1. Navigate to recording page (Pro tier or above)
2. Click "Start Recording"
3. Speak brainstorming text: "What if we created a platform for small businesses to track their expenses? We could integrate with their bank accounts. Maybe add AI analysis for spending patterns. We could charge per transaction or monthly subscription. Competitors are probably doing this though. We'd need to focus on ease of use."
4. Allow recording for 60+ seconds
5. Click "Stop Recording"
6. Click "Transform with Idea Studio"
7. Verify loading state and processing bar
8. Wait for full Idea Studio output
9. Verify output includes all 7 components:
    - Core Ideas & Connections (with tags showing relationships)
    - Expansion Opportunities (new angles suggested)
    - Research Questions (what to investigate)
    - Potential Obstacles (warnings/challenges)
    - Creative Prompts (brainstorming questions)
    - Next Steps (prioritized actions)
    - AI Research Findings (if research enabled)
    - Project Brief (if available)
    - Mind Map (visual diagram)
10. Test mind map interaction (hover, click nodes)
11. Test export of full output
12. Test searching within the document

**Expected Results**:
- All 7 Idea Studio components present
- Content is relevant and insightful
- Mind map renders correctly
- All interactive elements work
- Export includes all sections
- Performance acceptable (< 10 sec processing)

**Test Scenarios**:
- Short brainstorm session (1 min)
- Long brainstorm session (10+ min)
- Multiple ideas jumbled together
- Clear, sequential ideas
- Brainstorm with specific problem statement
- Brainstorm with no clear focus
- Ideas with technical/non-technical language

---

#### Flow 10: System Audio Recording (Pro+)
**Path**: `/dashboard/record?mode=meeting` → System Audio → Record Zoom/Teams Call

**Test Steps**:
1. Navigate to recording page (Pro+ tier)
2. Click "System Audio" tab
3. Verify system audio permission request
4. Grant system audio permission
5. Open Zoom call / Teams meeting / YouTube video
6. Start FifthDraft recording with system audio
7. Verify system audio level meter shows input
8. Record for 1-2 minutes
9. Stop FifthDraft recording
10. Verify audio contains both:
    - Microphone input (your voice)
    - System audio (speakers from meeting/video)
11. Stop Zoom/Teams call
12. Generate notes
13. Verify both speakers captured in transcript
14. Verify action items and decisions extracted correctly

**Expected Results**:
- System audio permission flows work
- Audio level meter responsive
- Both audio sources captured
- Transcription accurate for both sources
- Meeting notes process normally
- Idea Studio available for system audio recordings

**Test Scenarios**:
- Zoom meeting with multiple participants
- Teams call with screen share
- YouTube video with narration
- Podcast playing
- Meeting with poor audio quality
- System audio only (no microphone)
- Microphone + system audio mix

---

#### Flow 11: File Upload Recording
**Path**: `/dashboard/record?mode=meeting` → Upload File

**Test Steps**:
1. Navigate to recording page
2. Click "Upload Audio File"
3. Verify file type restrictions (MP3, WAV, M4A, OGG, WebM, etc.)
4. Verify file size limit shown (120MB for Pro, 240MB for Pro+)
5. Upload valid audio file
6. Verify upload progress bar
7. Wait for upload to complete
8. Verify "Uploading..." state
9. Verify transcription starts automatically
10. Wait for transcription completion
11. Generate notes from transcribed audio
12. Verify notes match uploaded audio content
13. Test with file that has:
    - Clear speech
    - Multiple speakers
    - Background noise
    - Different language (if supported)
14. Test file size limit enforcement
    - Try uploading file > Pro limit → rejected with message
    - Try uploading file < Pro limit → accepted

**Expected Results**:
- Valid files upload and process
- Oversized files rejected with clear message
- Transcription accurate
- All note types work with uploaded files
- Upload history saved
- Can re-process same file with different modes

**Test Scenarios**:
- MP3 file
- WAV file
- M4A file
- File with poor quality
- File with multiple languages
- File exceeding size limit (for Free user)
- Empty file / corrupted file

---

### 2.5 Notes Management Flows

#### Flow 12: View Recorded Notes
**Path**: `/dashboard` → Click Recording → `/dashboard/notes/[id]`

**Test Steps**:
1. Navigate to dashboard
2. Click on a recorded note from history
3. Verify page loads with:
   - Note title (auto-generated or custom)
   - Timestamp of recording
   - Duration of recording
   - Mode used (Meeting Notes vs Idea Studio)
   - Full content organized by sections
4. For Meeting Notes, verify sections:
   - Full transcript
   - Action items (with owner, due date, priority)
   - Key decisions
   - Follow-ups/open questions
5. For Idea Studio, verify sections:
   - Core ideas
   - Expansion opportunities
   - Research questions
   - Next steps
   - Mind map (if applicable)
6. Test interactive features:
   - Click action item → edit fields
   - Click decision → view context in transcript
   - Search within note
   - Copy text to clipboard

**Expected Results**:
- Note loads completely
- All sections organized correctly
- Formatting preserved
- Interactive elements responsive
- Timestamps accurate
- Performance good (< 2 sec load)

**Test Scenarios**:
- Short note (1 min recording)
- Long note (100+ min recording)
- Note with few action items (1-2)
- Note with many action items (10+)
- Note from 30 days ago (retention)
- Note from 12 months ago (if Pro user)

---

#### Flow 13: Edit Notes
**Path**: `/dashboard/notes/[id]` → Edit

**Test Steps**:
1. Open a note
2. Click "Edit" button
3. Verify editable fields unlock:
   - Title
   - Action items (individual fields)
   - Notes/custom sections
   - Tags/categories
4. Edit title: Change to "New Title"
5. Edit action item: Change status, due date, owner
6. Add new action item
7. Delete action item
8. Click "Save"
9. Verify changes persisted
10. Reload page
11. Verify changes still present
12. Edit transcript (if available)
13. Save again
14. Verify transcript edit reflected in subsequent requests

**Expected Results**:
- All fields editable
- Changes save immediately
- Edit history tracked (optional)
- Undo available (optional)
- Auto-save functionality (optional but recommended)

**Test Scenarios**:
- Edit title only
- Edit action items
- Add multiple action items
- Delete multiple action items
- Edit transcript directly
- Rapid saves (debounced)
- Edit while offline (if supported)

---

#### Flow 14: Share Notes
**Path**: `/dashboard/notes/[id]` → Share

**Test Steps**:
1. Open a note
2. Click "Share" button
3. Verify share options appear:
   - Copy link to clipboard
   - Generate shareable link
   - Email note to recipients
   - Get embed code
4. Test "Copy Link":
   - Click copy button
   - Verify toast notification "Copied!"
   - Paste in new tab
   - Verify note accessible (if public share enabled)
5. Test "Email Note":
   - Click email icon
   - Enter recipient email
   - Verify email sent
   - Verify recipient receives note
   - Test unsubscribe link in email
6. Test link expiration (if applicable):
   - Set expiration: "24 hours"
   - Test link valid for 24h
   - Test link invalid after 24h+

**Expected Results**:
- Share links work
- Emails send successfully
- Shared notes readable by recipients
- Links can be revoked
- Expiration enforced

**Test Scenarios**:
- Share with user outside organization
- Share with multiple recipients
- Share and then edit note (recipient sees updates if not snapshots)
- Revoke share link
- Create password-protected share
- Share with expiration date

---

#### Flow 15: Export Notes
**Path**: `/dashboard/notes/[id]` → Export

**Test Steps**:
1. Open a note
2. Click "Export" button
3. Verify format options:
   - Markdown (.md)
   - PDF (.pdf)
   - Word (.docx)
   - HTML (.html)
   - JSON (for power users)
4. Test Markdown export:
   - Click "Export as Markdown"
   - Verify download completes
   - Open file in text editor
   - Verify formatting correct
   - Verify all sections present
5. Test PDF export:
   - Click "Export as PDF"
   - Verify download completes
   - Open file in PDF reader
   - Verify formatting professional
   - Verify page breaks appropriate
   - Verify images/diagrams (for Idea Studio) render
6. Test DOCX export:
   - Click "Export as Word"
   - Verify download completes
   - Open in Microsoft Word
   - Verify formatting preserved
   - Verify editable in Word
   - Verify styles applied
7. Test bulk export (if available):
   - Select multiple notes
   - Export all as ZIP
   - Verify all notes included

**Expected Results**:
- Export in requested format works
- Downloads complete successfully
- Formatting accurate
- All content included
- File sizes reasonable
- No corruption in files

**Test Scenarios**:
- Export short note
- Export very long note (100+ pages)
- Export with special characters
- Export with images/diagrams
- Export multiple notes
- Export and re-import
- Export from different browsers

---

#### Flow 16: Delete Notes
**Path**: `/dashboard` → Note Actions → Delete

**Test Steps**:
1. Navigate to dashboard
2. Hover over a note
3. Click three-dot menu
4. Click "Delete"
5. Verify confirmation dialog appears
   - Message: "Are you sure? This action cannot be undone."
   - Buttons: "Cancel" and "Delete"
6. Click "Cancel"
7. Verify note still exists
8. Click delete again
9. Click "Delete" in confirmation
10. Verify note removed from list
11. Verify note deleted from database
12. Attempt to access deleted note directly by URL
13. Verify 404 or "Note not found" error

**Expected Results**:
- Delete requires confirmation
- Confirmation can be canceled
- Note actually deleted after confirmation
- Deleted notes not recoverable (unless backup available)
- Database cleanup occurs

**Test Scenarios**:
- Delete note with no action items
- Delete note with multiple action items
- Delete recently created note
- Delete note 12 months old
- Delete all notes (bulk delete if available)
- Attempt to delete someone else's note (should fail)

---

### 2.6 Tier & Billing Flows

#### Flow 17: Free Tier Usage Limits
**Path**: `/dashboard` → Record → Hit Quota

**Test Steps**:
1. Create free account
2. Verify initial quota: 30 minutes/month
3. Record 10 minutes of audio
4. Verify quota updates: 20 minutes remaining
5. Record 15 more minutes
6. Verify quota updates: 5 minutes remaining
7. Attempt to record 10 minutes
8. Verify quota check fails with message:
   - "You have only 5 minutes remaining. Upgrade to Pro for more."
9. Click upgrade suggestion
10. Redirect to pricing page
11. Verify Pro tier highlighted
12. Click "Upgrade to Pro"
13. Verify payment flow begins

**Expected Results**:
- Quota tracked accurately
- Cannot record beyond quota
- Clear messaging about limits
- Easy upgrade path
- Quota resets monthly

**Test Scenarios**:
- Use exactly all 30 minutes
- Use some, let reset happen, use more
- Attempt to exceed quota
- Upgrade mid-month
- Pro quota (2000 minutes) allows significant usage

---

#### Flow 18: Upgrade to Pro
**Path**: Pricing Page → Select Pro → Payment → Success

**Test Steps**:
1. Navigate to pricing page
2. Click "Upgrade to Pro" button
3. Verify pricing displayed:
   - Annual: $149/year (~$12.40/month)
   - Monthly: $15/month
4. Click "Monthly" toggle
5. Verify price updates to $15/month
6. Click "Choose Plan"
7. Verify redirect to payment processor (Stripe)
8. Enter test card: 4242 4242 4242 4242
9. Enter expiry: 12/25
10. Enter CVC: 123
11. Enter name: Test User
12. Click "Pay Now"
13. Verify payment processing indicator
14. Verify successful payment confirmation
15. Verify redirect to dashboard
16. Verify user now Pro tier
17. Verify quota updated to 2000 minutes/month
18. Verify Idea Studio recording option now available
19. Verify invoice in user account / email
20. Verify receipt sent to email
21. Test cancellation (from account settings)
22. Verify Pro features disabled upon cancellation
23. Verify data retained after cancellation

**Expected Results**:
- Payment processing works
- Tier updates immediately
- Features unlock immediately
- Invoice/receipt sent
- Subscription renewal set up correctly
- Can cancel anytime
- Can resubscribe later
- Pro features disabled after cancellation but data remains

**Test Scenarios**:
- Monthly payment
- Annual payment
- Card declined (test card)
- Duplicate payment attempt (idempotency)
- Change billing email
- Update payment method
- Apply coupon/discount code (if available)

---

#### Flow 19: Pro+ Waitlist Signup
**Path**: Pricing Page → Pro+ Section → Join Waitlist

**Test Steps**:
1. Navigate to pricing page
2. Scroll to Pro+ tier (marked "Coming Soon")
3. Verify features listed:
   - 4000 minutes/month
   - Team workspaces
   - System audio capture
   - Large file uploads
   - Real-time collaboration
   - Advanced analytics
   - Priority support
   - Custom integrations
4. Click "Join Waitlist" button
5. Verify email capture form appears
6. Enter email address
7. Click "Join Waitlist"
8. Verify success message: "Thanks for joining! We'll notify you when Pro+ launches."
9. Verify confirmation email sent
10. Verify email address added to waitlist database
11. Verify duplicate emails not added (or indicated as already on waitlist)
12. Access account settings
13. Verify Pro+ waitlist status visible

**Expected Results**:
- Waitlist signup works
- Confirmation email sent
- Email stored in database
- Duplicate prevention works
- Can view waitlist status in account
- Clear communication about launch timeline

**Test Scenarios**:
- Signup as free user
- Signup as Pro user
- Signup as authenticated user
- Signup as non-authenticated user
- Invalid email format
- Already on waitlist attempt

---

### 2.7 Settings & Account Management

#### Flow 20: User Profile Settings
**Path**: `/dashboard/settings` → Profile

**Test Steps**:
1. Navigate to settings page
2. Click "Profile" tab
3. Verify current information displayed:
   - First name
   - Last name
   - Email
   - Profile picture (if applicable)
   - Account creation date
4. Edit first name: "John" → "Jonathan"
5. Click "Save"
6. Verify toast notification "Profile updated"
7. Reload page
8. Verify new name persisted
9. Verify name reflects in dashboard welcome message
10. Test profile picture upload (if available):
    - Click "Upload Photo"
    - Select image file
    - Verify upload progress
    - Verify image displays
    - Verify image persists after reload

**Expected Results**:
- All fields editable
- Changes save immediately
- Changes persist across sessions
- Profile updates reflect everywhere
- File upload works
- Image formatting correct

---

#### Flow 21: Preferences & Onboarding Review
**Path**: `/dashboard/settings` → Preferences

**Test Steps**:
1. Navigate to settings
2. Click "Preferences" tab
3. Verify saved preferences displayed:
   - Writing style (tone, formality, detail)
   - Note structure components
   - Default recording mode
4. Edit tone: Professional → Casual
5. Edit formality: Formal → Medium
6. Check/uncheck note structure components
7. Click "Save"
8. Create new recording
9. Generate notes
10. Verify new preferences applied
11. Verify style changes reflected in output

**Expected Results**:
- Preferences display correctly
- Changes save immediately
- Changes apply to future recordings
- Past recordings unaffected
- Can re-run onboarding if desired

---

#### Flow 22: Change Password
**Path**: `/dashboard/settings` → Security

**Test Steps**:
1. Navigate to settings
2. Click "Security" tab
3. Click "Change Password"
4. Enter current password
5. Enter new password
6. Confirm new password
7. Click "Update Password"
8. Verify success message
9. Logout
10. Login with old password
11. Verify login fails
12. Login with new password
13. Verify login succeeds

**Expected Results**:
- Password change requires current password
- New password must be different
- New password must meet requirements
- Old sessions invalidated (logout other sessions option)
- Can immediately login with new password

---

#### Flow 23: Delete Account
**Path**: `/dashboard/settings` → Danger Zone

**Test Steps**:
1. Navigate to settings
2. Click "Danger Zone" / "Advanced" tab
3. Click "Delete Account"
4. Verify warning dialog:
   - "Are you sure? This action cannot be undone."
   - "All your data will be permanently deleted."
   - Require password confirmation
5. Enter password
6. Click "Delete Account"
7. Verify account deleted
8. Attempt to login with deleted account
9. Verify login fails with "Account not found" or similar
10. Verify data deleted from database
11. Verify no traces of account in system

**Expected Results**:
- Account deletion requires password confirmation
- All user data deleted
- Account completely inaccessible
- Subscription canceled if active
- Cannot recover deleted account

---

### 2.8 Public Page Flows

#### Flow 24: Landing Page Navigation
**Path**: `/` → Browse → Navigate

**Test Steps**:
1. Navigate to landing page
2. Verify page loads completely (< 3 sec)
3. Verify hero section displays Idea Studio messaging
4. Verify CTA buttons visible:
   - "Get Started Free"
   - "Learn About Idea Studio"
5. Click "Learn About Idea Studio"
6. Verify scroll to Idea Studio section
7. Click section CTA
8. Verify redirect to signup
9. Click logo
10. Verify redirect to landing page home
11. Click "Sign In" in header
12. Verify redirect to login page
13. Test responsiveness:
    - Test on mobile (375px width)
    - Test on tablet (768px width)
    - Test on desktop (1920px width)
    - Verify layout adjustments correctly
    - Verify touch targets adequate

**Expected Results**:
- Page loads quickly
- All CTAs functional
- Navigation correct
- Mobile responsive
- No console errors
- Accessibility features work (screen readers, keyboard nav)

---

#### Flow 25: Pricing Page Browsing
**Path**: `/pricing` → Compare Tiers

**Test Steps**:
1. Navigate to pricing page
2. Verify all three tiers displayed:
   - Free
   - Pro (marked "Most Popular")
   - Pro+ (marked "Coming Soon")
3. Review feature comparison table
4. Verify Idea Studio availability:
   - Free: Not available (grayed out)
   - Pro: Available (checked)
   - Pro+: Available (checked)
5. Verify RAAS features highlighted:
   - Browser recording (all tiers)
   - System audio (Pro+ only)
   - File uploads (Pro only)
6. Click "Get Started" on Free tier
7. Redirect to signup
8. Click "Upgrade to Pro"
9. Redirect to payment
10. Click "Join Waitlist" on Pro+
11. Verify waitlist form

**Expected Results**:
- All tiers clearly displayed
- Feature comparison accurate
- CTAs functional
- Pricing clearly stated
- Tier differences obvious
- No hidden pricing surprises

---

#### Flow 26: Help/FAQ Page Searching
**Path**: `/help` → Search Questions

**Test Steps**:
1. Navigate to help page
2. Verify FAQ structure organized by category:
   - Getting Started
   - Idea Studio (new section)
   - Meeting Notes
   - RAAS & Recording (new section)
   - Tier Features
   - Privacy & Security
   - Technical Issues
3. Search for "Idea Studio": verify results show
4. Search for "RAAS": verify results show
5. Search for "Pro+": verify results show
6. Click on FAQ question
7. Verify answer expands/displays
8. Click on linked sections (e.g., "Pro features")
9. Verify correct navigation
10. Test on mobile
11. Verify search is functional on mobile too

**Expected Results**:
- Search functional
- Relevant results returned
- FAQ structure clear
- Mobile friendly
- Links work
- Good UX for finding answers

---

#### Flow 27: Sample Pages
**Path**: `/samples/idea-studio` and `/samples/meeting-notes`

**Test Steps**:
1. Navigate to Idea Studio sample
2. Verify sample output displays:
   - Core ideas with connections
   - Expansion opportunities
   - Research questions
   - Next steps
   - Mind map (if applicable)
3. Verify sample is realistic and impressive
4. Test interactivity (if any):
   - Click mind map nodes
   - Click idea cards
   - Click expansion opportunities
5. Click "Create Your Own"
6. Redirect to signup (if not logged in)
7. Navigate to Meeting Notes sample
8. Verify sample output displays:
   - Transcript
   - Action items table
   - Key decisions
   - Follow-ups
9. Verify professional formatting
10. Test export buttons
11. Verify PDF/MD export works

**Expected Results**:
- Samples impressive and realistic
- Interactive elements functional
- Export functionality works
- Clear path to try own recording
- Mobile responsive

---

### 2.9 Error Handling & Edge Cases

#### Flow 28: Network Error Handling
**Test Steps**:
1. Start recording
2. Simulate network disconnection
3. Verify recording continues locally
4. Reconnect network
5. Verify recording syncs to backend
6. Simulate network error during upload
7. Verify retry mechanism
8. Verify user-friendly error message

**Expected Results**:
- App doesn't crash on network errors
- Clear error messages shown
- Automatic retry (with backoff)
- Can manually retry
- No data loss

---

#### Flow 29: Browser/Device Compatibility
**Test Browsers**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Chrome
- Mobile Safari

**Test Steps**:
1. Test signup/login flow in each browser
2. Test recording functionality
3. Test file upload
4. Test export functionality
5. Verify responsive design
6. Verify no console errors
7. Verify performance acceptable

**Expected Results**:
- Works in all major browsers
- Mobile responsive
- No browser-specific bugs
- Good performance across devices

---

#### Flow 30: Performance Testing
**Test Metrics**:
- Landing page load time: < 2 sec
- Dashboard load time: < 2 sec
- Recording page load time: < 1 sec
- Export generation: < 30 sec for reasonable file size
- Idea Studio generation: < 2 min for typical 30-min recording

**Test Steps**:
1. Use Google Lighthouse to measure performance
2. Use Chrome DevTools to monitor memory usage
3. Test with slow 3G network
4. Test with 4G network
5. Verify no memory leaks
6. Verify smooth animations/transitions

**Expected Results**:
- Fast load times
- No memory leaks
- Responsive UI
- Smooth interactions
- Good Lighthouse scores (90+)

---

## 3. TESTING EXECUTION SCHEDULE

### Week 1: Core Flows Testing
- [ ] Authentication flows (Flows 1-4)
- [ ] Onboarding flow (Flow 5)
- [ ] Dashboard overview (Flow 6)
- [ ] Recording mode selection (Flow 7)
- [ ] Browser recording - Meeting Notes (Flow 8)

### Week 2: Feature Testing
- [ ] Browser recording - Idea Studio (Flow 9)
- [ ] System audio recording (Flow 10)
- [ ] File upload recording (Flow 11)
- [ ] View recorded notes (Flow 12)
- [ ] Edit notes (Flow 13)

### Week 3: Advanced Features
- [ ] Share notes (Flow 14)
- [ ] Export notes (Flow 15)
- [ ] Delete notes (Flow 16)
- [ ] Tier limits (Flow 17)
- [ ] Upgrade to Pro (Flow 18)

### Week 4: Edge Cases & Optimization
- [ ] Pro+ waitlist (Flow 19)
- [ ] Settings flows (Flows 20-23)
- [ ] Public pages (Flows 24-27)
- [ ] Error handling (Flow 28)
- [ ] Browser/device compatibility (Flow 29)
- [ ] Performance testing (Flow 30)

---

## 4. TEST DATA REQUIREMENTS

### Test User Accounts
```
Free Tier User:
- Email: test.free@example.com
- Password: Test123!
- Quota: 30 min/month
- Status: Verified

Pro Tier User:
- Email: test.pro@example.com
- Password: Test123!
- Quota: 2000 min/month
- Status: Verified, Active subscription

Pro+ Waitlist User:
- Email: test.proplus@example.com
- Status: On waitlist
```

### Test Audio Files
- Meeting recording (5 min, clear audio)
- Brainstorming session (10 min, mixed clarity)
- System audio capture (5 min, Zoom meeting)
- Poor quality audio (3 min, background noise)
- Multiple speakers (5 min, 3+ people)

### Test Cases for Each File
- Transcription accuracy
- Format detection
- Duration calculation
- Quality assessment

---

## 5. BUG TRACKING & RESOLUTION

### Bug Severity Levels
- **Critical**: App crash, data loss, security issue → Fix immediately
- **High**: Feature doesn't work, blocks workflow → Fix before release
- **Medium**: Formatting issue, minor functionality → Fix in next iteration
- **Low**: UI polish, minor typo → Fix when convenient

### Bug Reporting Format
```
Title: [Feature] Brief description of issue
Severity: Critical/High/Medium/Low
Steps to Reproduce:
1. Step 1
2. Step 2
Expected Result: What should happen
Actual Result: What actually happened
Screenshots/Video: [if applicable]
Affected Browsers: Chrome, Firefox, etc.
```

---

## 6. PRODUCTION READINESS CHECKLIST

### Before Final Deployment
- [ ] All 30 flows tested and passing
- [ ] No critical/high severity bugs remaining
- [ ] Performance benchmarks met
- [ ] Browser compatibility verified (5+ browsers)
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility audit passed
- [ ] Security audit passed
- [ ] Database backups configured
- [ ] Monitoring & logging set up
- [ ] Error tracking (Sentry or similar) configured
- [ ] Analytics tracking implemented
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Support/contact information visible
- [ ] Help documentation complete
- [ ] Onboarding tutorial tested
- [ ] Email templates tested
- [ ] Payment processing tested (test & production)
- [ ] Webhook handlers verified
- [ ] Rate limiting configured
- [ ] DDOS protection enabled

---

## 7. POST-DEPLOYMENT MONITORING

### First 24 Hours
- [ ] Monitor error rates (target: < 0.1%)
- [ ] Monitor performance metrics
- [ ] Review user feedback/support tickets
- [ ] Check payment processing success rate
- [ ] Monitor database query performance
- [ ] Verify email delivery rate
- [ ] Test critical user journeys manually

### Week 1
- [ ] Review analytics data
- [ ] Monitor conversion funnel
- [ ] Check churn rate
- [ ] Review user feedback
- [ ] Monitor API response times
- [ ] Check cache hit rates

### Month 1
- [ ] Comprehensive analytics review
- [ ] User feedback patterns
- [ ] Feature usage statistics
- [ ] Performance trends
- [ ] Revenue metrics
- [ ] Plan improvements

---

## 8. REGRESSION TESTING (Ongoing)

### Before Each Release
- [ ] Run all 30 user flow tests
- [ ] Test all public pages
- [ ] Test payment processing
- [ ] Test email functionality
- [ ] Test database migrations
- [ ] Test performance benchmarks

### Automated Testing Recommendations
Consider implementing:
- [ ] Unit tests (Jest for React components)
- [ ] Integration tests (database + API)
- [ ] End-to-end tests (Cypress or Playwright)
- [ ] Visual regression tests (Percy or similar)
- [ ] Performance tests (Lighthouse CI)

---

## 9. APPENDIX: Test Environment URLs

```
Development:
- App: http://localhost:3000
- Supabase: https://dev-supabase.fifthraft.local
- API: http://localhost:3000/api

Staging:
- App: https://staging.fifthraft.com
- Database: Supabase (staging instance)
- API: https://staging.fifthraft.com/api

Production (Post-VPS):
- App: https://fifthraft.com
- Database: Self-hosted PostgreSQL on VPS
- API: https://fifthraft.com/api
```


# FifthDraft Testing Execution Checklist

## Test Environment Setup

**Test Date**: _____________
**Tester Name**: _____________
**Environment**: [ ] Dev [ ] Staging [ ] Production
**Browser**: _____________
**Device**: [ ] Desktop [ ] Mobile [ ] Tablet

---

## PHASE 1: Authentication & Onboarding (Flows 1-5)

### Flow 1: New User Signup ✓
- [ ] Navigate to landing page
- [ ] Click "Try Idea Studio Free" CTA
- [ ] Fill signup form (email, password)
- [ ] Verify password validation rules
- [ ] Verify email verification link sent
- [ ] Click verification link in email
- [ ] Redirect to onboarding works
- [ ] User account created in database
- [ ] Initial free tier quota allocated (30 min/month)
- [ ] No errors in console

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 2: Email Verification ✓
- [ ] New signup without immediate verification
- [ ] Check user account status (verified: false)
- [ ] Access verification page with token
- [ ] Verification completes successfully
- [ ] Account status changes to verified
- [ ] Dashboard access granted
- [ ] Attempt to verify same token twice
- [ ] Second verification properly rejected

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 3: User Login ✓
- [ ] Navigate to login page
- [ ] Enter correct email and password
- [ ] Click "Sign In"
- [ ] Redirect to dashboard succeeds
- [ ] Session persists across page reloads
- [ ] "Stay signed in" toggle works
- [ ] Close browser and reopen - session persists
- [ ] Test with wrong password - error shown
- [ ] Test with non-existent email - error shown

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 4: Password Recovery ✓
- [ ] Navigate to forgot password page
- [ ] Enter registered email
- [ ] Click "Send Reset Link"
- [ ] Check password reset email received
- [ ] Click reset link in email
- [ ] Redirect to reset password page works
- [ ] Enter new password
- [ ] Submit password reset
- [ ] Can login with new password
- [ ] Old password doesn't work
- [ ] Test expired reset link (>24h) - properly rejected

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 5: Post-Signup Onboarding ✓
- [ ] Complete signup flow
- [ ] Redirect to onboarding automatically
- [ ] Step 0: Welcome + Name Collection
  - [ ] Enter first name and last name
  - [ ] Names saved to user profile
- [ ] Step 1: Writing Style Preferences
  - [ ] Select tone, formality, detail level
  - [ ] Selections save properly
- [ ] Step 2: Note Structure Preferences
  - [ ] Check/uncheck structure components
  - [ ] Selections save properly
- [ ] Step 3: Confirmation
  - [ ] Review preferences displayed
  - [ ] Click "Done" or "Finish"
  - [ ] Redirect to dashboard
- [ ] Verify preferences applied in first recording
- [ ] Can skip onboarding if desired
- [ ] Can edit preferences later in settings

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

## PHASE 2: Dashboard & Recording (Flows 6-11)

### Flow 6: Dashboard Home Page ✓
- [ ] **Free Tier User**:
  - [ ] Dashboard loads successfully
  - [ ] Welcome message with user's name displayed
  - [ ] Monthly quota shows 30/30 minutes
  - [ ] Recording history visible
  - [ ] Quick action buttons present
  - [ ] Pro upgrade CTA visible
- [ ] **Pro Tier User**:
  - [ ] Quota shows 2000 minutes/month
  - [ ] "Idea Studio" recording option available
  - [ ] System audio option grayed out
- [ ] **Pro+ Tier User**:
  - [ ] Quota shows 4000 minutes/month
  - [ ] System audio option available
  - [ ] Team features visible (if enabled)

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 7: Recording Mode Selection ✓
- [ ] **Free User**:
  - [ ] Clicks "Start Recording"
  - [ ] Only "Meeting Notes" option available
  - [ ] "Idea Studio" grayed out with "Pro Feature" label
- [ ] **Pro User**:
  - [ ] Both "Meeting Notes" and "Idea Studio" available
  - [ ] Click "Idea Studio" → redirects to correct page
  - [ ] Click "Meeting Notes" → redirects to correct page
- [ ] **Pro+ User**:
  - [ ] System audio option appears
  - [ ] System audio permission dialog shows
  - [ ] Lock icons on unavailable features

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 8: Browser Recording (Meeting Notes) ✓
- [ ] Navigate to recording page (mode=meeting)
- [ ] Click "Start Recording"
- [ ] Microphone permission request appears
- [ ] Speak test text
- [ ] Allow recording for 30-60 seconds
- [ ] Click "Stop Recording"
- [ ] Audio playback works
- [ ] Click "Generate Notes"
- [ ] Loading state appears
- [ ] Notes appear with all sections:
  - [ ] Full transcript
  - [ ] Extracted action items
  - [ ] Key decisions highlighted
  - [ ] Professional formatting
- [ ] Export buttons work:
  - [ ] Markdown export
  - [ ] PDF export
  - [ ] DOCX export
- [ ] Notes saved to database
- [ ] **Performance**: Notes generated < 30 seconds

**Test Audio Content**: "Today we discussed the new project timeline. Key decisions: launch in Q2, budget approved. Action items: Sarah to draft requirements, John to schedule kickoff."

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 9: Browser Recording (Idea Studio) ✓
- [ ] Navigate to recording page (mode=brainstorming)
- [ ] Click "Start Recording"
- [ ] Speak brainstorming text
- [ ] Allow recording for 60+ seconds
- [ ] Click "Stop Recording"
- [ ] Click "Transform with Idea Studio"
- [ ] Loading state and processing bar appears
- [ ] Verify output includes all 7 components:
  - [ ] Core Ideas & Connections
  - [ ] Expansion Opportunities
  - [ ] Research Questions
  - [ ] Potential Obstacles
  - [ ] Creative Prompts
  - [ ] Next Steps
  - [ ] AI Research Findings (if enabled)
  - [ ] Project Brief (if available)
  - [ ] Mind Map
- [ ] Mind map interactive (hover, click nodes)
- [ ] Export functionality works
- [ ] Search within document works
- [ ] **Performance**: Processing < 2 minutes

**Test Audio Content**: "What if we created a platform for small businesses to track expenses? Integrate with bank accounts. Add AI analysis for spending patterns. Maybe charge per transaction or monthly. Competitors probably doing this. Focus on ease of use."

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 10: System Audio Recording (Pro+) ✓
- [ ] Navigate to recording page (Pro+ tier required)
- [ ] Click "System Audio" tab
- [ ] System audio permission request appears
- [ ] Grant system audio permission
- [ ] Open Zoom call / Teams meeting / YouTube video
- [ ] Start FifthDraft recording with system audio
- [ ] System audio level meter shows input
- [ ] Record for 1-2 minutes
- [ ] Stop FifthDraft recording
- [ ] Verify audio contains both:
  - [ ] Microphone input (your voice)
  - [ ] System audio (speakers from meeting/video)
- [ ] Generate notes successfully
- [ ] Stop Zoom/Teams call
- [ ] Verify both speakers captured in transcript
- [ ] Verify action items extracted correctly

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 11: File Upload Recording ✓
- [ ] Navigate to recording page
- [ ] Click "Upload Audio File"
- [ ] Verify file type restrictions shown
- [ ] Verify file size limit shown:
  - [ ] Free/Pro: 120MB
  - [ ] Pro+: 240MB
- [ ] Upload valid audio file (MP3/WAV)
- [ ] Verify upload progress bar
- [ ] Upload completes successfully
- [ ] Transcription starts automatically
- [ ] Verify transcription completes
- [ ] Generate notes from uploaded file
- [ ] Verify notes match uploaded content
- [ ] Test file size limit enforcement:
  - [ ] Free user upload >120MB → rejected
  - [ ] Pro user upload >120MB → accepted
  - [ ] Pro user upload >240MB → rejected
- [ ] Upload history saved
- [ ] Can re-process same file with different modes

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

## PHASE 3: Notes Management (Flows 12-16)

### Flow 12: View Recorded Notes ✓
- [ ] Navigate to dashboard
- [ ] Click on a recorded note
- [ ] Page loads with:
  - [ ] Note title
  - [ ] Timestamp of recording
  - [ ] Duration of recording
  - [ ] Mode used (Meeting Notes vs Idea Studio)
  - [ ] Full content organized by sections
- [ ] **For Meeting Notes**:
  - [ ] Full transcript present
  - [ ] Action items with owner, due date, priority
  - [ ] Key decisions section
  - [ ] Follow-ups/open questions
- [ ] **For Idea Studio**:
  - [ ] Core ideas with connections
  - [ ] Expansion opportunities
  - [ ] Research questions
  - [ ] Next steps
  - [ ] Mind map renders
- [ ] Interactive features work:
  - [ ] Click action item → edit fields
  - [ ] Click decision → view context
  - [ ] Search within note works
  - [ ] Copy text to clipboard works
- [ ] **Performance**: Load < 2 seconds
- [ ] No console errors

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 13: Edit Notes ✓
- [ ] Open a note
- [ ] Click "Edit" button
- [ ] Verify editable fields unlock:
  - [ ] Title
  - [ ] Action items (individual fields)
  - [ ] Notes/custom sections
  - [ ] Tags/categories
- [ ] Edit title to "New Title"
- [ ] Edit action item:
  - [ ] Change status
  - [ ] Change due date
  - [ ] Change owner
- [ ] Add new action item
- [ ] Delete action item
- [ ] Click "Save"
- [ ] Verify changes persisted
- [ ] Reload page - changes still present
- [ ] Edit transcript (if available)
- [ ] Save again - changes reflected

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 14: Share Notes ✓
- [ ] Open a note
- [ ] Click "Share" button
- [ ] Verify share options:
  - [ ] Copy link to clipboard
  - [ ] Email note to recipients
  - [ ] Get embed code (if available)
- [ ] Test "Copy Link":
  - [ ] Click copy button
  - [ ] Toast notification "Copied!" appears
  - [ ] Paste in new tab
  - [ ] Note accessible
- [ ] Test "Email Note":
  - [ ] Click email icon
  - [ ] Enter recipient email
  - [ ] Email sent successfully
  - [ ] Recipient receives note
  - [ ] Unsubscribe link in email works
- [ ] Test link expiration (if applicable):
  - [ ] Set expiration: "24 hours"
  - [ ] Link valid for 24h
  - [ ] Link invalid after 24h+

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 15: Export Notes ✓
- [ ] Open a note
- [ ] Click "Export" button
- [ ] Verify format options available:
  - [ ] Markdown (.md)
  - [ ] PDF (.pdf)
  - [ ] Word (.docx)
  - [ ] HTML (.html)
  - [ ] JSON (for power users)
- [ ] Test Markdown export:
  - [ ] Click "Export as Markdown"
  - [ ] Download completes
  - [ ] Open file in text editor
  - [ ] Formatting correct
  - [ ] All sections present
- [ ] Test PDF export:
  - [ ] Click "Export as PDF"
  - [ ] Download completes
  - [ ] Open in PDF reader
  - [ ] Formatting professional
  - [ ] Page breaks appropriate
  - [ ] Images/diagrams render (for Idea Studio)
- [ ] Test DOCX export:
  - [ ] Click "Export as Word"
  - [ ] Download completes
  - [ ] Open in Microsoft Word
  - [ ] Formatting preserved
  - [ ] Editable in Word
  - [ ] Styles applied
- [ ] Test bulk export (if available):
  - [ ] Select multiple notes
  - [ ] Export all as ZIP
  - [ ] All notes included

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 16: Delete Notes ✓
- [ ] Navigate to dashboard
- [ ] Hover over a note
- [ ] Click three-dot menu
- [ ] Click "Delete"
- [ ] Confirmation dialog appears with:
  - [ ] Message: "Are you sure?"
  - [ ] Buttons: "Cancel" and "Delete"
- [ ] Click "Cancel" - note still exists
- [ ] Click delete again
- [ ] Click "Delete" in confirmation
- [ ] Note removed from list
- [ ] Note deleted from database
- [ ] Attempt to access deleted note by URL
- [ ] 404 or "Note not found" error appears

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

## PHASE 4: Tier Management & Payments (Flows 17-19)

### Flow 17: Free Tier Usage Limits ✓
- [ ] Create free account
- [ ] Verify initial quota: 30 minutes/month
- [ ] Record 10 minutes of audio
- [ ] Verify quota updates: 20 minutes remaining
- [ ] Record 15 more minutes
- [ ] Verify quota updates: 5 minutes remaining
- [ ] Attempt to record 10 minutes
- [ ] Quota check fails with proper message
- [ ] Click upgrade suggestion
- [ ] Redirect to pricing page
- [ ] Pro tier highlighted
- [ ] Click "Upgrade to Pro"
- [ ] Payment flow begins
- [ ] Quota resets monthly correctly

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 18: Upgrade to Pro ✓
- [ ] Navigate to pricing page
- [ ] Verify pricing displayed:
  - [ ] Annual: $149/year
  - [ ] Monthly: $15/month
- [ ] Click "Monthly" toggle
- [ ] Price updates correctly
- [ ] Click "Choose Plan"
- [ ] Redirect to Stripe Checkout
- [ ] **Test Card**: 4242 4242 4242 4242
- [ ] **Expiry**: 12/25 | **CVC**: 123
- [ ] Click "Pay Now"
- [ ] Payment processing shows
- [ ] Successful payment confirmation
- [ ] Redirect to dashboard
- [ ] User now Pro tier
- [ ] Quota updated to 2000 minutes/month
- [ ] Idea Studio recording option available
- [ ] Invoice in user account / email
- [ ] Receipt sent to email
- [ ] **Test Cancellation**:
  - [ ] Access account settings
  - [ ] Click "Manage Subscription"
  - [ ] Click "Cancel Subscription"
  - [ ] Confirmation appears
  - [ ] Pro features disabled
  - [ ] Data retained after cancellation
- [ ] **Test Duplicate Payment**: Idempotency check passes

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 19: Pro+ Waitlist Signup ✓
- [ ] Navigate to pricing page
- [ ] Scroll to Pro+ tier
- [ ] Verify features listed:
  - [ ] 4000 minutes/month
  - [ ] Team workspaces
  - [ ] System audio capture
  - [ ] Large file uploads
  - [ ] Real-time collaboration
  - [ ] Advanced analytics
  - [ ] Priority support
  - [ ] Custom integrations
- [ ] Verify "Coming Soon - Waitlist" badge
- [ ] Click "Join Waitlist" button
- [ ] Email capture form appears
- [ ] Enter email address
- [ ] Click "Join Waitlist"
- [ ] Success message appears
- [ ] Confirmation email sent
- [ ] Email added to waitlist database
- [ ] Duplicate emails handled (no duplicates)
- [ ] Access account settings
- [ ] Verify Pro+ waitlist status visible

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

## PHASE 5: Settings & Account Management (Flows 20-23)

### Flow 20: User Profile Settings ✓
- [ ] Navigate to settings page
- [ ] Click "Profile" tab
- [ ] Verify current information:
  - [ ] First name
  - [ ] Last name
  - [ ] Email
  - [ ] Account creation date
- [ ] Edit first name: "John" → "Jonathan"
- [ ] Click "Save"
- [ ] Toast notification appears
- [ ] Reload page - new name persists
- [ ] Name reflects in dashboard welcome message
- [ ] **Profile Picture (if available)**:
  - [ ] Click "Upload Photo"
  - [ ] Select image file
  - [ ] Upload progresses
  - [ ] Image displays
  - [ ] Image persists after reload

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 21: Preferences & Onboarding Review ✓
- [ ] Navigate to settings
- [ ] Click "Preferences" tab
- [ ] Verify saved preferences:
  - [ ] Writing style (tone, formality, detail)
  - [ ] Note structure components
  - [ ] Default recording mode
- [ ] Edit tone: Professional → Casual
- [ ] Edit formality: Formal → Medium
- [ ] Check/uncheck structure components
- [ ] Click "Save"
- [ ] Create new recording
- [ ] Generate notes
- [ ] Verify new preferences applied
- [ ] Style changes reflected in output

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 22: Change Password ✓
- [ ] Navigate to settings
- [ ] Click "Security" tab
- [ ] Click "Change Password"
- [ ] Enter current password
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Click "Update Password"
- [ ] Success message appears
- [ ] Logout
- [ ] **Login with old password** - fails
- [ ] **Login with new password** - succeeds

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 23: Delete Account ✓
- [ ] Navigate to settings
- [ ] Click "Danger Zone" / "Advanced" tab
- [ ] Click "Delete Account"
- [ ] Warning dialog:
  - [ ] "Are you sure? This action cannot be undone."
  - [ ] "All your data will be permanently deleted."
  - [ ] Require password confirmation
- [ ] Enter password
- [ ] Click "Delete Account"
- [ ] Account deleted
- [ ] Attempt to login with deleted account
- [ ] Login fails with "Account not found"
- [ ] Data deleted from database
- [ ] No traces of account in system

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

## PHASE 6: Public Pages & Edge Cases (Flows 24-30)

### Flow 24: Landing Page Navigation ✓
- [ ] Navigate to landing page
- [ ] Page loads completely (< 3 sec)
- [ ] Hero section visible with Idea Studio messaging
- [ ] CTA buttons visible:
  - [ ] "Try Idea Studio Free"
  - [ ] "View Plans & Pro+"
- [ ] Click "View Plans & Pro+" - redirects to pricing
- [ ] Click logo - redirects to home
- [ ] Click "Sign In" in header - redirects to login
- [ ] Click "Try Idea Studio Free" - redirects to signup
- [ ] **Mobile Responsiveness** (375px width):
  - [ ] Layout adjusts correctly
  - [ ] Text readable
  - [ ] Touch targets adequate
  - [ ] No horizontal scrolling
- [ ] **Tablet** (768px width):
  - [ ] Layout adjusts correctly
  - [ ] Two-column to single column transition works
- [ ] **Desktop** (1920px width):
  - [ ] All three-column sections display properly
- [ ] No console errors

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 25: Pricing Page Browsing ✓
- [ ] Navigate to pricing page
- [ ] All three tiers display:
  - [ ] Free
  - [ ] Pro (marked "Most Popular")
  - [ ] Pro+ (marked "Coming Soon - Join Waitlist")
- [ ] Feature comparison table accurate:
  - [ ] Idea Studio availability correct
  - [ ] Free: Not available (grayed out)
  - [ ] Pro: Available (checked)
  - [ ] Pro+: Available (checked)
- [ ] RAAS features highlighted:
  - [ ] Browser recording (all tiers)
  - [ ] System audio (Pro+ only)
  - [ ] File uploads (Pro only)
- [ ] CTAs functional:
  - [ ] "Get Started" on Free tier
  - [ ] "Upgrade to Pro" buttons work
  - [ ] "Join Waitlist" on Pro+ tier
- [ ] No pricing surprises
- [ ] Mobile responsive

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 26: Help/FAQ Page Searching ✓
- [ ] Navigate to help page
- [ ] FAQ organized by categories:
  - [ ] Getting Started
  - [ ] Idea Studio (prominent)
  - [ ] Meeting Notes
  - [ ] RAAS & Recording
  - [ ] Tier Features
  - [ ] Privacy & Security
  - [ ] Technical Issues
- [ ] Search for "Idea Studio" - relevant results show
- [ ] Search for "RAAS" - relevant results show
- [ ] Search for "Pro+" - relevant results show
- [ ] Click on FAQ question - expands/displays
- [ ] Click on linked sections - correct navigation
- [ ] Mobile search functional
- [ ] Good UX for finding answers

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 27: Sample Pages ✓
- [ ] **Idea Studio Sample** (`/samples/idea-studio/`):
  - [ ] Sample output displays with all components
  - [ ] Professional and impressive output
  - [ ] Interactive elements functional (if any)
  - [ ] Click mind map nodes - interaction works
  - [ ] "Create Your Own" button works
  - [ ] Mobile responsive
- [ ] **Meeting Notes Sample** (`/samples/meeting-notes/`):
  - [ ] Sample output displays
  - [ ] Professional formatting
  - [ ] Export buttons work
  - [ ] PDF/MD export functions
  - [ ] Mobile responsive

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 28: Network Error Handling ✓
- [ ] Start recording
- [ ] Simulate network disconnection
- [ ] Verify recording continues locally
- [ ] Reconnect network
- [ ] Verify recording syncs to backend
- [ ] Simulate network error during upload
- [ ] Verify retry mechanism
- [ ] User-friendly error message shown
- [ ] No data loss

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 29: Browser/Device Compatibility ✓
- [ ] **Chrome (latest)**:
  - [ ] Full signup/login flow works
  - [ ] Recording functionality works
  - [ ] File upload works
  - [ ] Export works
  - [ ] No console errors
- [ ] **Firefox (latest)**:
  - [ ] Same tests as Chrome
- [ ] **Safari (latest)**:
  - [ ] Same tests as Chrome
- [ ] **Edge (latest)**:
  - [ ] Same tests as Chrome
- [ ] **Mobile Chrome**:
  - [ ] Mobile responsive
  - [ ] Touch interactions work
- [ ] **Mobile Safari**:
  - [ ] Mobile responsive
  - [ ] Touch interactions work

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

### Flow 30: Performance Testing ✓
- [ ] **Landing page load time**: < 2 sec
  - [ ] Actual: _______ sec
- [ ] **Dashboard load time**: < 2 sec
  - [ ] Actual: _______ sec
- [ ] **Recording page load time**: < 1 sec
  - [ ] Actual: _______ sec
- [ ] **Export generation**: < 30 sec for reasonable file size
  - [ ] Actual: _______ sec
- [ ] **Idea Studio generation**: < 2 min for typical 30-min recording
  - [ ] Actual: _______ sec
- [ ] **Lighthouse Score**: > 90
  - [ ] Actual: _______ (Performance), _______ (Accessibility), _______ (Best Practices)
- [ ] **Memory usage**: No memory leaks detected
- [ ] **Network requests**: Reasonable number, no excessive requests
- [ ] **Slow 3G Network**: Responsive UI, clear loading states
- [ ] **4G Network**: Smooth animations/transitions

**Result**: [ ] Pass [ ] Fail [ ] Partial
**Issues Found**: _________________________________

---

## SUMMARY

### Total Tests: 30 Flows
**Tests Passed**: _____ / 30
**Tests Failed**: _____ / 30
**Tests Partial**: _____ / 30

### Critical Issues: _____ (Must fix before launch)
### High Issues: _____ (Should fix before launch)
### Medium Issues: _____ (Can fix in next release)
### Low Issues: _____ (Nice to have)

---

## Critical Issues to Address

1. Issue: _________________________________
   Fix: ________________________________
   Status: [ ] Not Started [ ] In Progress [ ] Fixed [ ] Verified

2. Issue: _________________________________
   Fix: ________________________________
   Status: [ ] Not Started [ ] In Progress [ ] Fixed [ ] Verified

3. Issue: _________________________________
   Fix: ________________________________
   Status: [ ] Not Started [ ] In Progress [ ] Fixed [ ] Verified

---

## Sign-Off

**QA Lead Signature**: _______________________ **Date**: _______

**Product Manager Signature**: _______________________ **Date**: _______

**Development Lead Signature**: _______________________ **Date**: _______

---

## Notes & Comments

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________


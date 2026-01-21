# FifthDraft - Complete User Flows Documentation

**Date:** January 18, 2026
**Purpose:** Comprehensive mapping of all user journeys through the application

---

## 📋 Table of Contents

1. [New User Onboarding Flow](#new-user-onboarding-flow)
2. [Recording to Note Flow](#recording-to-note-flow)
3. [Meeting Notes Workflow](#meeting-notes-workflow)
4. [Idea Studio Workflow](#idea-studio-workflow)
5. [Export & Share Flow](#export--share-flow)
6. [Upgrade to Pro Flow](#upgrade-to-pro-flow)
7. [Billing Management Flow](#billing-management-flow)
8. [Notes Organization Flow](#notes-organization-flow)
9. [Authentication Flows](#authentication-flows)
10. [Edge Cases & Error Flows](#edge-cases--error-flows)

---

## 1. New User Onboarding Flow

### Journey: First-Time Visitor → Active User

```
┌─────────────────────────────────────────────────────────────┐
│                    DISCOVERY PHASE                          │
└─────────────────────────────────────────────────────────────┘

1. Landing Page (/)
   ├─ User arrives from: Google search, Product Hunt, referral
   ├─ Views: Hero section, feature cards, testimonials
   ├─ Sees: "Join 500+ professionals" social proof
   └─ Actions available:
      ├─ "Get Started Free" button (primary CTA)
      ├─ "View Samples" links
      ├─ "View Pricing" link
      └─ "Login" link

2. Sample Pages (Optional exploration)
   ├─ /samples/meeting-notes
   │  └─ See: Professional meeting transcript with action items
   └─ /samples/idea-studio
      └─ See: Full brainstorming analysis with all Idea Studio features

┌─────────────────────────────────────────────────────────────┐
│                   SIGNUP PHASE                              │
└─────────────────────────────────────────────────────────────┘

3. Signup Page (/signup)
   ├─ User enters:
   │  ├─ Email address
   │  └─ Password (minimum requirements shown)
   ├─ Form validation:
   │  ├─ Email format check
   │  ├─ Password strength check
   │  └─ Real-time error messages
   ├─ Click: "Create Account" button
   └─ Backend processing:
      ├─ Create Supabase auth user
      ├─ Create profile record
      │  ├─ subscription_tier: 'free'
      │  ├─ minutes_quota: 30
      │  ├─ minutes_used: 0
      │  └─ onboarding_completed: false
      └─ Send verification email (optional based on config)

4. Auto-redirect to Onboarding (/onboarding)

┌─────────────────────────────────────────────────────────────┐
│                  ONBOARDING WIZARD                          │
└─────────────────────────────────────────────────────────────┘

5. Onboarding Step 1/4: Name Collection
   ├─ Welcome message: "Welcome to FifthDraft! 👋"
   ├─ Input: "What should we call you?" (optional)
   ├─ User enters name or skips
   └─ Click: "Continue"

6. Onboarding Step 2/4: Writing Style
   ├─ Select Tone: Professional | Casual | Academic | Creative
   ├─ Select Formality: Formal | Balanced | Informal
   ├─ Select Verbosity: Concise | Balanced | Detailed
   ├─ Live preview shown: Example text in selected style
   └─ Click: "Next Step"

7. Onboarding Step 3/4: Note Structure
   ├─ Checkboxes for note sections:
   │  ├─ ✓ Summary
   │  ├─ ✓ Key Points
   │  ├─ ✓ Full Transcript
   │  ├─ ✓ Action Items
   │  ├─ ✓ Decisions
   │  └─ ✓ Questions & Follow-ups
   ├─ Each with description of what it includes
   └─ Click: "Next Step"

8. Onboarding Step 4/4: Confirmation
   ├─ Summary of all preferences shown
   ├─ "What's Next?" guide displayed:
   │  ├─ Record your first voice memo
   │  ├─ Watch AI transform audio into notes
   │  └─ Export, share, or chat with notes
   ├─ Preferences saved to database:
   │  └─ profiles.settings = {
   │       writing_style: {...},
   │       note_structure: {...},
   │       output_preferences: {...}
   │     }
   └─ Click: "Go to Dashboard"

┌─────────────────────────────────────────────────────────────┐
│                  FIRST DASHBOARD VIEW                       │
└─────────────────────────────────────────────────────────────┘

9. Dashboard (/dashboard)
   ├─ User sees:
   │  ├─ Welcome message with their name
   │  ├─ "0 / 30 minutes used" counter
   │  ├─ Empty state: "No recordings yet"
   │  ├─ Large "New Recording" button
   │  └─ Pro upgrade card (free tier benefits + upgrade CTA)
   ├─ Sidebar navigation:
   │  ├─ Dashboard (current)
   │  ├─ All Notes
   │  ├─ Settings
   │  └─ User profile dropdown
   └─ Next action: Click "New Recording" or "Record" button

```

**Key Metrics to Track:**
- Signup completion rate
- Onboarding completion rate (% who finish all 4 steps)
- Time to first recording
- Day 1 retention

---

## 2. Recording to Note Flow

### Journey: Dashboard → Completed Note

```
┌─────────────────────────────────────────────────────────────┐
│                   RECORDING INITIATION                      │
└─────────────────────────────────────────────────────────────┘

1. Start Recording
   ├─ From: Dashboard "New Recording" button or sidebar "Record" button
   ├─ Navigate to: /dashboard/record
   └─ URL params: ?mode=meeting (default) or ?mode=brainstorming

2. Recording Setup Page (/dashboard/record)
   ├─ Mode Selector (top):
   │  ├─ [ Meeting Notes ] button (purple)
   │  └─ [ Idea Studio ] button (pink) - shows "Pro" badge if free user
   │
   ├─ Recording Method Tabs:
   │  ├─ Tab 1: Browser Microphone (default)
   │  │  ├─ Icon: Microphone
   │  │  ├─ Description: "Record using your microphone"
   │  │  └─ Best for: In-person meetings, personal notes
   │  │
   │  ├─ Tab 2: System Audio Capture (Chrome/Edge only)
   │  │  ├─ Icon: Desktop
   │  │  ├─ Description: "Capture Zoom/Teams calls"
   │  │  ├─ Experimental badge shown
   │  │  └─ Best for: Virtual meetings
   │  │
   │  └─ Tab 3: File Upload (Pro only)
   │     ├─ Icon: Upload
   │     ├─ Description: "Upload MP3, WAV, M4A, etc."
   │     ├─ Shows lock icon if free user
   │     └─ Formats: MP3, WAV, M4A, OGG, FLAC, AAC
   │
   └─ Additional Options:
      ├─ Whisper mode toggle (quiet recording)
      └─ Dual audio option (mic + system audio simultaneously)

┌─────────────────────────────────────────────────────────────┐
│              BROWSER MICROPHONE RECORDING                   │
└─────────────────────────────────────────────────────────────┘

3. Browser Microphone Flow
   ├─ Click: "Start Recording" button
   ├─ Browser prompts: "Allow microphone access?"
   ├─ User clicks: "Allow"
   ├─ Recording starts:
   │  ├─ Red recording indicator shown
   │  ├─ Timer: 00:00 (counts up)
   │  ├─ Waveform visualization
   │  └─ "Stop Recording" button appears
   │
   ├─ User speaks into microphone
   │  └─ Audio captured: Opus codec, 16kHz mono, ~0.18 MB/min
   │
   └─ Click: "Stop Recording" button

┌─────────────────────────────────────────────────────────────┐
│              FILE UPLOAD RECORDING (Pro)                    │
└─────────────────────────────────────────────────────────────┘

3b. File Upload Flow (Alternative)
   ├─ Click: "Choose File" button
   ├─ File picker opens
   ├─ User selects audio file (MP3, WAV, etc.)
   ├─ Validation:
   │  ├─ Check file size against tier limit:
   │  │  ├─ Free: BLOCKED (shows upgrade prompt)
   │  │  ├─ Pro: 120MB max
   │  │  ├─ Team: 240MB max
   │  │  └─ Enterprise: 480MB max
   │  └─ Check file type (audio MIME types only)
   │
   ├─ If valid:
   │  ├─ Upload progress bar shown
   │  └─ File uploaded to Supabase Storage
   │
   └─ Click: "Process Recording" button

┌─────────────────────────────────────────────────────────────┐
│                UPLOAD & PROCESSING                          │
└─────────────────────────────────────────────────────────────┘

4. Upload to Supabase Storage
   ├─ Create recording record in database:
   │  ├─ status: 'queued'
   │  ├─ mode: 'meeting' or 'brainstorming'
   │  ├─ duration: [seconds]
   │  ├─ file_size: [bytes]
   │  └─ storage_path: 'recordings/[user_id]/[filename]'
   │
   ├─ Upload audio blob to Supabase Storage
   │  └─ Bucket: 'recordings' (RLS protected)
   │
   └─ Trigger: POST /api/transcribe with recordingId

5. Processing Status Page
   ├─ Auto-navigate to: /dashboard/notes/processing?id=[recordingId]
   ├─ Show progress bar: 0% → 100%
   ├─ Processing stages displayed:
   │  ├─ 10%: Uploading audio...
   │  ├─ 30%: Transcribing with Whisper...
   │  ├─ 50%: Cleaning transcript...
   │  ├─ 70%: Extracting insights...
   │  ├─ 85%: Generating smart title...
   │  └─ 100%: Complete!
   │
   └─ Real-time updates via polling or WebSocket

┌─────────────────────────────────────────────────────────────┐
│              AI PROCESSING PIPELINE                         │
└─────────────────────────────────────────────────────────────┘

6. Backend Processing (POST /api/transcribe)
   ├─ Step 1: Validation
   │  ├─ Check user tier and quotas
   │  ├─ Validate file size vs tier limit
   │  ├─ Check minutes_used < minutes_quota
   │  └─ Block free users from file uploads
   │
   ├─ Step 2: Download Audio
   │  └─ Fetch from Supabase Storage
   │
   ├─ Step 3: Whisper Transcription
   │  ├─ Send to: OpenAI Whisper API
   │  ├─ Model: whisper-1
   │  ├─ Response format: verbose_json
   │  └─ Output: raw_text, segments[], language
   │
   ├─ Step 4: Transcript Cleaning
   │  ├─ Send to: Claude (Haiku for free, Sonnet for paid)
   │  ├─ Prompt: Remove filler words, fix grammar, organize paragraphs
   │  ├─ Apply user writing style preferences
   │  └─ Output: cleaned_text
   │
   ├─ Step 5: Structured Extraction
   │  ├─ IF mode = 'meeting':
   │  │  └─ Extract: summary, keyPoints, actionItems, decisions, questions
   │  │
   │  └─ IF mode = 'brainstorming':
   │     └─ Extract: coreIdeas, expansionOpportunities, researchQuestions,
   │               nextSteps, obstacles, creativePrompts
   │
   ├─ Step 6: Smart Title Generation
   │  ├─ Claude generates: Concise, descriptive title (max 60 chars)
   │  └─ Fallback: "[Mode] - [Date]"
   │
   ├─ Step 7: Create Note Record
   │  ├─ Insert into notes table:
   │  │  ├─ title: [generated title]
   │  │  ├─ content: [cleaned_text]
   │  │  ├─ summary: [AI summary]
   │  │  ├─ structure: {JSON with all extracted data}
   │  │  ├─ mode: 'meeting' or 'brainstorming'
   │  │  └─ recording_id: [link to recording]
   │  │
   │  └─ Insert action_items (if meeting mode) or next_steps (if brainstorming)
   │
   ├─ Step 8: Generate Embedding (brainstorming only)
   │  ├─ Create embedding for semantic search
   │  └─ Save to: notes.embedding
   │
   ├─ Step 9: Usage Tracking
   │  ├─ Calculate: duration_in_minutes = Math.ceil(duration / 60)
   │  ├─ Increment: profiles.minutes_used += duration_in_minutes
   │  └─ Log to: usage_logs table
   │
   └─ Step 10: Mark Complete
      ├─ Update: recordings.status = 'completed'
      └─ Return: noteId

┌─────────────────────────────────────────────────────────────┐
│                  VIEW COMPLETED NOTE                        │
└─────────────────────────────────────────────────────────────┘

7. Note View Page (/dashboard/notes/[id])
   ├─ Auto-redirect from processing page when complete
   ├─ Page sections displayed based on mode
   └─ User can now: view, edit, export, or share

```

**Key Metrics to Track:**
- Recording success rate
- Average processing time
- Transcription accuracy (user feedback)
- Error rate by recording method

---

## 3. Meeting Notes Workflow

### Journey: Record Meeting → Organized Action Items

```
┌─────────────────────────────────────────────────────────────┐
│                  NOTE VIEW (Meeting Mode)                   │
└─────────────────────────────────────────────────────────────┘

1. Note Header
   ├─ Editable Title (click to edit)
   ├─ Metadata row:
   │  ├─ Date: January 18, 2026
   │  ├─ Duration: 23 minutes
   │  ├─ Mode: Meeting Notes
   │  └─ Recording type: Browser microphone
   │
   └─ Action buttons:
      ├─ Export (dropdown menu)
      ├─ Share (copy link)
      └─ Delete

2. Summary Section
   ├─ Icon: Document icon
   ├─ Title: "Summary"
   ├─ Content: AI-generated overview (2-3 sentences)
   └─ Editable: Click to edit inline

3. Key Points Section
   ├─ Icon: Bullet list
   ├─ Title: "Key Points"
   ├─ Content: Bullet-point highlights
   │  ├─ • Q1 budget approved at $500K
   │  ├─ • New feature launch delayed to March
   │  └─ • Team expansion to 5 new hires
   └─ Editable: Add/remove/edit points

4. Action Items Section (Key Feature)
   ├─ Icon: Checkbox
   ├─ Title: "Action Items" with count badge
   ├─ Table view:
   │  ┌─────────────┬──────────┬──────────┬─────────┬────────┐
   │  │ Task        │ Assignee │ Due Date │ Priority│ Status │
   │  ├─────────────┼──────────┼──────────┼─────────┼────────┤
   │  │ Finalize... │ Sarah    │ Jan 25   │ High    │ Pending│
   │  │ Schedule... │ Mike     │ Jan 22   │ Medium  │ Pending│
   │  │ Draft...    │ Team     │ Jan 30   │ Low     │ Pending│
   │  └─────────────┴──────────┴──────────┴─────────┴────────┘
   │
   ├─ Each row clickable to:
   │  ├─ Edit assignee
   │  ├─ Set/change due date
   │  ├─ Update priority
   │  ├─ Mark as complete
   │  └─ Add to external system (Jira, Trello - future)
   │
   └─ Add new action item button

5. Decisions Section
   ├─ Icon: Lightbulb
   ├─ Title: "Key Decisions"
   ├─ Content: Important decisions made
   │  ├─ ✓ Approved Q1 marketing budget
   │  ├─ ✓ Chose vendor B for CRM integration
   │  └─ ✓ Postponed hiring until Feb 1
   └─ Editable

6. Questions & Follow-ups Section
   ├─ Icon: Question mark
   ├─ Title: "Questions & Follow-ups"
   ├─ Content: Open questions identified
   │  ├─ ? What's the exact timeline for vendor integration?
   │  ├─ ? Who will lead the Q2 planning?
   │  └─ ? Should we schedule a follow-up in 2 weeks?
   └─ Can convert to action items

7. Full Transcript Section
   ├─ Icon: Document
   ├─ Title: "Full Transcript"
   ├─ Content: Cleaned, formatted transcript
   │  ├─ Organized in paragraphs
   │  ├─ No filler words (um, uh, like)
   │  ├─ Grammar corrected
   │  └─ Speaker labels (if detected)
   │
   └─ Fully editable: Click to edit text

8. Tags & Organization
   ├─ Tags input: Add tags for searchability
   │  └─ Example: #q1-planning, #budget, #marketing
   │
   └─ Folder selector: Move to folder
      └─ Example: "Q1 2026 Planning"

```

**User Actions Available:**
- ✓ Edit any section inline
- ✓ Add/remove action items
- ✓ Change priority/status/assignee
- ✓ Add tags for organization
- ✓ Move to folder
- ✓ Export in multiple formats
- ✓ Share via link
- ✓ Delete note

---

## 4. Idea Studio Workflow

### Journey: Brainstorm → Actionable Project Plan

```
┌─────────────────────────────────────────────────────────────┐
│              NOTE VIEW (Idea Studio Mode)                   │
└─────────────────────────────────────────────────────────────┘

1. Note Header (Pro Feature Badge)
   ├─ Editable Title
   ├─ Metadata:
   │  ├─ Date
   │  ├─ Duration
   │  ├─ Mode: Idea Studio (with sparkle icon)
   │  └─ Pro badge
   │
   └─ Action buttons:
      ├─ Export
      ├─ Share
      └─ Delete

2. Core Ideas Section
   ├─ Icon: Lightbulb
   ├─ Title: "Core Ideas" with count
   ├─ Grid layout (2 columns):
   │
   │  ┌─────────────────────────────────────┐
   │  │ Zero-Waste Operations               │
   │  ├─────────────────────────────────────┤
   │  │ Implementing comprehensive          │
   │  │ composting, reusable cups, and      │
   │  │ eliminating single-use plastics     │
   │  │                                     │
   │  │ Connected to:                       │
   │  │ → Local Partnerships                │
   │  │ → Customer Education                │
   │  └─────────────────────────────────────┘
   │
   │  ┌─────────────────────────────────────┐
   │  │ Direct Trade Coffee Sourcing        │
   │  ├─────────────────────────────────────┤
   │  │ Building relationships with farmers │
   │  │ to ensure fair pricing and quality  │
   │  │                                     │
   │  │ Connected to:                       │
   │  │ → Brand Story                       │
   │  │ → Premium Positioning               │
   │  └─────────────────────────────────────┘
   │
   └─ Each idea card shows:
      ├─ Title
      ├─ Description
      └─ Connections to other ideas

3. Expansion Opportunities Section
   ├─ Icon: Trending up
   ├─ Title: "Expansion Opportunities"
   ├─ Grouped by core idea:
   │
   │  Zero-Waste Operations:
   │  → Partner with local urban farms for composting
   │  → Develop branded reusable cup subscription
   │  → Create educational content about waste reduction
   │
   │  Direct Trade:
   │  → Organize customer trips to coffee farms
   │  → Create video series of farmer stories
   │  → Sell premium beans with provenance info
   │
   └─ Actionable suggestions for each idea

4. Research Questions Section
   ├─ Icon: Question mark in circle
   ├─ Title: "Research Questions"
   ├─ List of questions AI identified:
   │
   │  ? What are startup costs for zero-waste operations?
   │  ? How to establish direct trade relationships?
   │  ? What certifications needed (B-Corp, Fair Trade)?
   │  ? Customer willingness to pay premium prices?
   │  ? How other sustainable cafes structure events?
   │
   └─ Each question can trigger AI research (Pro feature)

5. Idea Studio Actions Panel (Pro Features)
   ├─ Button: "AI Research" 🔍
   │  ├─ Triggers: GET /api/notes/[id]/research
   │  ├─ Uses: Tavily API for web search
   │  ├─ Returns: Answers with cited sources
   │  └─ Saves to: notes.research_data
   │
   ├─ Button: "Generate Project Brief" 📋
   │  ├─ Triggers: POST /api/notes/[id]/project-brief
   │  ├─ Uses: Claude Opus 4.5
   │  ├─ Returns: Structured project plan
   │  └─ Saves to: notes.project_brief
   │
   ├─ Button: "View Mind Map" 🗺️
   │  ├─ Triggers: GET /api/notes/[id]/mindmap
   │  ├─ Returns: D3.js-compatible node graph
   │  └─ Displays: Visual diagram of idea connections
   │
   └─ Button: "Find Related Notes" 🔗
      ├─ Triggers: GET /api/notes/[id]/related
      ├─ Uses: Semantic search via embeddings
      └─ Returns: Similar brainstorming sessions

6. AI Research Results Section (After clicking "AI Research")
   ├─ Icon: Globe
   ├─ Title: "AI Research Findings"
   ├─ Content for each question:
   │
   │  ┌────────────────────────────────────────────┐
   │  │ Q: Startup costs for zero-waste ops?       │
   │  ├────────────────────────────────────────────┤
   │  │ Initial investment: $15K-$30K including:   │
   │  │ • Composting systems: $3K-$5K              │
   │  │ • Reusable cup inventory: $2K-$4K          │
   │  │ • ROI: 18-24 months                        │
   │  │                                            │
   │  │ Sources:                                   │
   │  │ • Sustainable Restaurant Assoc (2025)      │
   │  │ • National Coffee Assoc Sustainability     │
   │  └────────────────────────────────────────────┘
   │
   └─ All results saved and persist across sessions

7. Project Brief Display (After clicking "Generate Project Brief")
   ├─ Full page modal or new section
   ├─ Structured sections:
   │
   │  📋 PROJECT BRIEF
   │  Sustainable Coffee Hub: Zero-Waste Community Cafe
   │
   │  Executive Overview
   │  [AI-generated 2-3 paragraph summary]
   │
   │  Goals & Objectives
   │  1. Achieve 90% waste diversion in year 1
   │  2. Establish 3-5 direct trade relationships
   │  3. Host 20+ community events per month
   │
   │  Timeline Highlights
   │  Phase 1: Planning & Setup (8-12 weeks)
   │  Phase 2: Build-out & Soft Launch (6-8 weeks)
   │  Phase 3: Grand Opening (1 week)
   │
   │  Key Deliverables
   │  [List of milestones and deliverables]
   │
   │  Success Metrics
   │  [How to measure success]
   │
   └─ Downloadable as PDF or DOCX

8. Mind Map Visualization (After clicking "View Mind Map")
   ├─ Interactive diagram:
   │
   │       [Zero-Waste Ops]───────[Composting]
   │            │                      │
   │            │                 [Urban Farms]
   │            │
   │    [Sustainable Coffee]
   │            │
   │            │──[Direct Trade]───[Farmers]
   │            │                       │
   │            │                  [Fair Pricing]
   │            │
   │       [Community Hub]───[Workshops]
   │                             │
   │                        [Local Artists]
   │
   └─ Interactive: Click nodes to expand/collapse

9. Next Steps Section
   ├─ Icon: Target
   ├─ Title: "Next Steps"
   ├─ Prioritized action items:
   │
   │  1. Research sustainable costs [HIGH]
   │  2. Visit existing sustainable cafes [HIGH]
   │  3. Connect with coffee consultants [MEDIUM]
   │  4. Scout potential locations [MEDIUM]
   │  5. Develop brand identity [LOW]
   │
   └─ Each can be converted to dashboard action item

10. Obstacles Section
    ├─ Icon: Warning triangle
    ├─ Title: "Potential Obstacles"
    ├─ Challenges identified:
    │
    │  ⚠ Higher costs may reduce profit margins
    │  ⚠ Complex international logistics for direct trade
    │  ⚠ Customer education needed for premium pricing
    │  ⚠ Balancing commercial space with events
    │
    └─ Helps with risk planning

11. Creative Prompts Section
    ├─ Icon: Sparkles
    ├─ Title: "Creative Prompts"
    ├─ Thought-provoking questions:
    │
    │  💭 What if customers could "adopt" a farmer?
    │  💭 How might we gamify sustainability?
    │  💭 Could we create an app showing environmental impact?
    │  💭 What if the shop doubled as zero-waste retail?
    │
    └─ Inspires further brainstorming

12. Full Transcript
    └─ Same as meeting notes mode

```

**Idea Studio Unique Benefits:**
- ✓ Transform vague ideas into structured concepts
- ✓ Identify expansion opportunities automatically
- ✓ Get AI-powered web research with sources
- ✓ Generate professional project briefs
- ✓ Visualize idea connections
- ✓ Track idea evolution over time
- ✓ Find related brainstorming sessions

---

## 5. Export & Share Flow

### Journey: Note → External Format

```
┌─────────────────────────────────────────────────────────────┐
│                    EXPORT WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

1. Export Menu
   ├─ Location: Note view page, top right
   ├─ Click: "Export" button
   └─ Dropdown menu appears:
      ├─ Download as Markdown (.md)
      ├─ Download as PDF (.pdf)
      ├─ Download as Word (.docx)
      ├─ Download as Text (.txt)
      ├─ Download as JSON (.json)
      └─ Copy to Clipboard

2. Markdown Export Flow
   ├─ Click: "Download as Markdown"
   ├─ Processing:
   │  ├─ Generate: YAML frontmatter with metadata
   │  ├─ Format: All sections as markdown
   │  ├─ Action items: Formatted as checkboxes
   │  └─ Footer: "Generated by FifthDraft on [date]"
   │
   ├─ File generated: sustainable_coffee_shop_concept.md
   └─ Browser downloads file instantly

   Example Output:
   ```markdown
   # Sustainable Coffee Shop Concept

   ---
   date: January 18, 2026
   mode: brainstorming
   tags: [sustainability, coffee, business]
   ---

   ## Summary
   [Content]

   ## Core Ideas
   - **Zero-Waste Operations**: ...

   ## Action Items
   - [ ] **Research costs** [HIGH]
     - Assignee: User
     - Due: January 25, 2026
   ```

3. PDF Export Flow
   ├─ Click: "Download as PDF"
   ├─ Processing:
   │  ├─ Library: jsPDF
   │  ├─ Formatting: Professional layout
   │  ├─ Branding: FifthDraft logo and colors
   │  ├─ Page breaks: Proper section breaks
   │  └─ Tables: Action items formatted as table
   │
   ├─ File generated: sustainable_coffee_shop_concept.pdf
   └─ Browser downloads file

   Features:
   - Header with logo on each page
   - Table of contents (for long notes)
   - Styled headings (purple gradient)
   - Professional typography
   - Footer with page numbers

4. DOCX Export Flow
   ├─ Click: "Download as Word"
   ├─ Processing:
   │  ├─ Library: docx
   │  ├─ Formatting: Word-compatible styles
   │  ├─ Headings: Heading 1, 2, 3 styles
   │  ├─ Lists: Bullet and numbered lists
   │  └─ Tables: Action items as Word table
   │
   ├─ File generated: sustainable_coffee_shop_concept.docx
   └─ Opens in Microsoft Word or Google Docs

5. Copy to Clipboard Flow
   ├─ Click: "Copy to Clipboard"
   ├─ Processing:
   │  ├─ Extract all text content
   │  ├─ Format as plain text
   │  └─ Copy to system clipboard
   │
   ├─ Notification: "Copied to clipboard!"
   └─ User can paste into: Email, Slack, Notion, etc.

┌─────────────────────────────────────────────────────────────┐
│                    SHARE WORKFLOW                           │
└─────────────────────────────────────────────────────────────┘

6. Share Link Flow (Future Feature)
   ├─ Click: "Share" button
   ├─ Modal appears:
   │  ├─ Toggle: Public / Private link
   │  ├─ Permissions: View only / Can comment
   │  ├─ Expiration: Never / 7 days / 30 days
   │  └─ Generate Link button
   │
   ├─ Link generated: https://fifthdraft.com/shared/[uuid]
   ├─ Copy link button
   └─ Share via:
      ├─ Email
      ├─ Slack
      └─ Social media

7. Email Export Flow (Future Feature)
   ├─ Click: "Email this note"
   ├─ Modal with fields:
   │  ├─ To: [email address]
   │  ├─ Subject: [auto-filled with note title]
   │  ├─ Message: [optional note]
   │  └─ Format: Markdown / PDF / DOCX
   │
   └─ Send email with attachment

```

**Export Options Available:**
- ✓ Markdown - For developers, GitHub, Notion
- ✓ PDF - For printing, sharing professionally
- ✓ DOCX - For Microsoft Word, Google Docs
- ✓ TXT - Plain text, universal compatibility
- ✓ JSON - For developers, data analysis
- ✓ Clipboard - Quick paste anywhere

---

## 6. Upgrade to Pro Flow

### Journey: Free User → Paying Customer

```
┌─────────────────────────────────────────────────────────────┐
│                 UPGRADE TRIGGER POINTS                      │
└─────────────────────────────────────────────────────────────┘

Trigger Points (where user sees upgrade prompts):

1. Dashboard Pro Card
   ├─ Location: Dashboard main page
   ├─ Message: "Unlock Idea Studio & unlimited recordings"
   ├─ CTA: "Upgrade to Pro"
   └─ Click → Navigate to /pricing

2. Monthly Quota Reached
   ├─ Location: Recording page
   ├─ Blocking modal: "You've used 30/30 minutes this month"
   ├─ Message: "Upgrade to Pro for 2000 min/month"
   ├─ CTA: "View Plans"
   └─ Click → Navigate to /pricing

3. File Upload Attempt (Free Tier)
   ├─ Location: Recording page, File Upload tab
   ├─ Lock icon shown
   ├─ Message: "File uploads require Pro"
   ├─ CTA: "Upgrade Now"
   └─ Click → Navigate to /pricing

4. Idea Studio Mode Selection (Free Tier)
   ├─ Location: Recording page
   ├─ Pro badge shown on Idea Studio button
   ├─ Click → Modal: "Idea Studio is a Pro feature"
   ├─ CTA: "Upgrade to Pro"
   └─ Click → Navigate to /pricing

5. Idea Studio Actions (Pro Features)
   ├─ Location: Note view (brainstorming mode)
   ├─ Buttons shown but locked:
   │  ├─ AI Research (lock icon)
   │  ├─ Project Brief (lock icon)
   │  └─ Mind Map (lock icon)
   ├─ Click → Modal: "This feature requires Pro"
   └─ CTA: "Upgrade Now"

┌─────────────────────────────────────────────────────────────┐
│                  PRICING PAGE JOURNEY                       │
└─────────────────────────────────────────────────────────────┘

6. Pricing Page (/pricing)
   ├─ Hero section:
   │  └─ "Choose the plan that's right for you"
   │
   ├─ Three pricing cards:
   │
   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
   │  │     FREE       │  │   PRO ⭐       │  │  ENTERPRISE    │
   │  ├────────────────┤  ├────────────────┤  ├────────────────┤
   │  │ $0/month       │  │ $12.42/month   │  │  Contact Us    │
   │  │                │  │ ($149/year)    │  │                │
   │  ├────────────────┤  ├────────────────┤  ├────────────────┤
   │  │ • 30 min/month │  │ • 2000 min/mo  │  │ • Unlimited    │
   │  │ • Browser rec  │  │ • All features │  │ • Priority     │
   │  │ • Meeting mode │  │ • File upload  │  │ • Dedicated    │
   │  │ • Basic export │  │ • Idea Studio  │  │ • Custom       │
   │  │                │  │ • All exports  │  │ • SSO          │
   │  ├────────────────┤  ├────────────────┤  ├────────────────┤
   │  │ Current Plan   │  │ [Upgrade Now]  │  │ [Join Waitlist]│
   │  └────────────────┘  └────────────────┘  └────────────────┘
   │
   ├─ Feature comparison table below
   └─ FAQ section

7. Click "Upgrade Now" (Free → Pro)
   ├─ Navigate to: Stripe Checkout
   └─ Pre-filled with user email

┌─────────────────────────────────────────────────────────────┐
│                  STRIPE CHECKOUT FLOW                       │
└─────────────────────────────────────────────────────────────┘

8. Stripe Checkout Session
   ├─ Create session:
   │  ├─ API: POST /api/checkout
   │  ├─ Body: { priceId: 'price_xxx', userId: 'user-id' }
   │  └─ Return: Checkout URL
   │
   ├─ Redirect to: Stripe hosted checkout
   │  └─ URL: checkout.stripe.com/pay/...
   │
   └─ Stripe checkout page shows:
      ├─ Product: FifthDraft Pro (Annual)
      ├─ Price: $149.00 USD
      ├─ Billing: Yearly
      ├─ Card input fields
      ├─ Email: [pre-filled]
      └─ "Subscribe" button

9. Payment Processing
   ├─ User enters card details:
   │  └─ Test card: 4242 4242 4242 4242
   │
   ├─ Click: "Subscribe"
   │
   ├─ Stripe processes payment:
   │  ├─ Card validation
   │  ├─ 3D Secure (if required)
   │  └─ Charge customer
   │
   └─ Success or failure

┌─────────────────────────────────────────────────────────────┐
│                  POST-PAYMENT PROCESSING                    │
└─────────────────────────────────────────────────────────────┘

10. Stripe Webhook (POST /api/webhooks/stripe)
    ├─ Event: checkout.session.completed
    │
    ├─ Extract data:
    │  ├─ customer_id
    │  ├─ subscription_id
    │  └─ user_id (from metadata)
    │
    ├─ Update database:
    │  └─ UPDATE profiles SET
    │     subscription_tier = 'pro',
    │     minutes_quota = 2000,
    │     stripe_customer_id = [id],
    │     stripe_subscription_id = [id]
    │     WHERE id = [user_id]
    │
    └─ Return: 200 OK to Stripe

11. Success Redirect
    ├─ Stripe redirects to: /dashboard?upgraded=true
    │
    ├─ Dashboard shows:
    │  ├─ Success banner: "Welcome to Pro! 🎉"
    │  ├─ Updated quota: "0 / 2000 minutes"
    │  ├─ Pro badge in sidebar
    │  └─ Confetti animation (optional)
    │
    └─ User now has access to:
       ├─ Idea Studio mode
       ├─ File uploads
       ├─ AI Research
       ├─ Project Brief Generator
       ├─ Mind Map visualization
       └─ 2000 minutes/month

```

**Conversion Optimization:**
- Clear value proposition on each trigger
- Friction-free checkout (pre-filled email)
- Immediate access after payment
- Success celebration on dashboard

---

## 7. Billing Management Flow

### Journey: Manage Subscription

```
┌─────────────────────────────────────────────────────────────┐
│                BILLING PORTAL ACCESS                        │
└─────────────────────────────────────────────────────────────┘

1. Access Points
   ├─ From pricing page:
   │  └─ Pro users see "Manage Subscription" button
   │
   ├─ From dashboard:
   │  └─ Settings → Billing → "Manage Billing"
   │
   └─ From account menu:
      └─ User dropdown → "Billing"

2. Create Billing Portal Session
   ├─ API: POST /api/billing-portal
   ├─ Body: { userId: 'user-id' }
   │
   ├─ Backend:
   │  ├─ Fetch user's stripe_customer_id
   │  ├─ Create Stripe portal session
   │  └─ Return portal URL
   │
   └─ Redirect to: billing.stripe.com/p/session/...

3. Stripe Customer Portal
   ├─ Sections available:
   │
   │  1. Subscription Overview
   │     ├─ Current plan: FifthDraft Pro (Annual)
   │     ├─ Amount: $149.00/year
   │     ├─ Status: Active
   │     └─ Next billing: January 18, 2027
   │
   │  2. Update Payment Method
   │     ├─ Current card: •••• 4242
   │     └─ Add new card button
   │
   │  3. Update Billing Info
   │     ├─ Email for receipts
   │     ├─ Billing address
   │     └─ Tax ID (if applicable)
   │
   │  4. Invoices & Receipts
   │     ├─ Download past invoices
   │     └─ View payment history
   │
   │  5. Cancel Subscription
   │     └─ "Cancel plan" link
   │
   └─ Return to app button → Redirects to /dashboard

4. Update Payment Method
   ├─ Click: "Update payment method"
   ├─ Enter new card details
   ├─ Click: "Save"
   ├─ Stripe updates default payment method
   └─ Success message shown

5. Cancel Subscription Flow
   ├─ Click: "Cancel plan"
   │
   ├─ Stripe shows retention screen:
   │  ├─ "Are you sure?"
   │  ├─ Benefits you'll lose
   │  └─ Offer to pause instead
   │
   ├─ User confirms cancellation
   │
   ├─ Webhook event: customer.subscription.deleted
   │
   ├─ Backend processing:
   │  └─ UPDATE profiles SET
   │     subscription_tier = 'free',
   │     minutes_quota = 30
   │     WHERE stripe_subscription_id = [id]
   │
   └─ User retains Pro access until end of billing period

6. Subscription Renewal
   ├─ Stripe automatically charges on renewal date
   │
   ├─ Webhook: invoice.payment_succeeded
   │
   ├─ Backend: Update last_payment_date
   │
   └─ Email receipt sent by Stripe

7. Failed Payment Flow
   ├─ Webhook: invoice.payment_failed
   │
   ├─ Stripe retries payment (3 attempts over 2 weeks)
   │
   ├─ Email notifications sent to user
   │
   ├─ If all retries fail:
   │  ├─ Webhook: customer.subscription.deleted
   │  └─ Downgrade to free tier
   │
   └─ User notified in dashboard

```

---

## 8. Notes Organization Flow

### Journey: Organize & Find Notes

```
┌─────────────────────────────────────────────────────────────┐
│                  NOTES LIST VIEW                            │
└─────────────────────────────────────────────────────────────┘

1. All Notes Page (/dashboard/notes)
   ├─ Header:
   │  ├─ Page title: "All Notes"
   │  ├─ Search bar: "Search notes..."
   │  └─ "New Recording" button
   │
   ├─ Filters sidebar (left):
   │  ├─ All Notes (default)
   │  ├─ Meeting Notes
   │  ├─ Idea Studio
   │  ├─ Recent (last 7 days)
   │  ├─ This Month
   │  └─ Folders:
   │     ├─ Q1 2026 Planning
   │     ├─ Product Ideas
   │     └─ + New Folder
   │
   ├─ Tags filter:
   │  ├─ #work (12)
   │  ├─ #personal (5)
   │  ├─ #ideas (8)
   │  └─ Show all tags
   │
   └─ Notes grid (main area):
      ├─ Sort by: Date | Title | Duration
      └─ View: Grid | List

2. Note Cards (Grid View)
   Each card shows:
   ├─ Title
   ├─ Summary (first 2 lines)
   ├─ Mode badge (Meeting / Idea Studio)
   ├─ Duration: 23 min
   ├─ Date: 2 days ago
   ├─ Tags: #planning #q1
   └─ Action menu (•••):
      ├─ Open note
      ├─ Add to folder
      ├─ Add tags
      ├─ Export
      ├─ Duplicate
      └─ Delete

3. Search Functionality
   ├─ Type in search bar: "coffee shop"
   │
   ├─ Search executes:
   │  ├─ Full-text search across:
   │  │  ├─ Title
   │  │  ├─ Summary
   │  │  ├─ Transcript content
   │  │  └─ Tags
   │  │
   │  └─ Results ranked by relevance
   │
   └─ Results displayed:
      ├─ Highlight matching terms
      ├─ Show match context
      └─ Filter by mode/date/folder

4. Add to Folder Flow
   ├─ Click: •••menu → "Add to folder"
   │
   ├─ Modal appears:
   │  ├─ Select folder dropdown
   │  ├─ Existing folders listed
   │  └─ "+ Create new folder" option
   │
   ├─ Select or create folder
   │
   ├─ Click: "Save"
   │
   └─ Note moved to folder

5. Tag Management Flow
   ├─ Click: •••menu → "Add tags"
   │
   ├─ Modal with tag input:
   │  ├─ Existing tags shown as chips
   │  ├─ Type to add new tag
   │  └─ Autocomplete from existing tags
   │
   ├─ Add tags: #project, #2026, #brainstorm
   │
   └─ Click: "Save"

6. Bulk Operations (Future Feature)
   ├─ Checkbox on each note card
   ├─ Select multiple notes
   └─ Bulk actions:
      ├─ Move to folder
      ├─ Add tags
      ├─ Export all
      ├─ Delete selected
      └─ Merge notes

```

---

## 9. Authentication Flows

### All Auth-Related Journeys

```
┌─────────────────────────────────────────────────────────────┐
│                      SIGNUP FLOW                            │
└─────────────────────────────────────────────────────────────┘

Already documented in Section 1 (New User Onboarding)

┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────┘

1. Login Page (/login)
   ├─ Form fields:
   │  ├─ Email
   │  └─ Password
   │
   ├─ Options:
   │  ├─ "Remember me" checkbox
   │  └─ "Forgot password?" link
   │
   ├─ Submit: "Sign In" button
   │
   └─ Links:
      └─ "Don't have an account? Sign up"

2. Login Submission
   ├─ Validate: Email and password format
   │
   ├─ Call: Supabase auth.signInWithPassword()
   │
   ├─ Success:
   │  ├─ Set session cookie
   │  ├─ Fetch user profile
   │  └─ Redirect to:
   │     ├─ /onboarding (if not completed)
   │     └─ /dashboard (if completed)
   │
   └─ Error:
      ├─ "Invalid credentials" message
      └─ Retry option

┌─────────────────────────────────────────────────────────────┐
│                 FORGOT PASSWORD FLOW                        │
└─────────────────────────────────────────────────────────────┘

3. Forgot Password Page (/forgot-password)
   ├─ Instruction: "Enter your email to reset password"
   │
   ├─ Form:
   │  └─ Email input field
   │
   ├─ Submit: "Send Reset Link" button
   │
   └─ Link: "Back to login"

4. Password Reset Request
   ├─ User enters email
   │
   ├─ Click: "Send Reset Link"
   │
   ├─ Call: Supabase auth.resetPasswordForEmail()
   │
   ├─ Success:
   │  ├─ Email sent with reset link
   │  ├─ Message: "Check your email for reset link"
   │  └─ Auto-redirect to /login after 5 seconds
   │
   └─ Error:
      └─ "Email not found" or "Try again later"

5. Password Reset Email
   ├─ User receives email from Supabase
   │
   ├─ Email contains:
   │  ├─ Reset link: /reset-password?token=xxx
   │  └─ Link expiration: 1 hour
   │
   └─ User clicks link

6. Reset Password Page (/reset-password?token=xxx)
   ├─ Form fields:
   │  ├─ New password
   │  └─ Confirm password
   │
   ├─ Password requirements shown:
   │  ├─ Minimum 8 characters
   │  ├─ At least one number
   │  └─ At least one special character
   │
   └─ Submit: "Reset Password" button

7. Password Reset Submission
   ├─ Validate: Passwords match and meet requirements
   │
   ├─ Call: Supabase auth.updateUser()
   │
   ├─ Success:
   │  ├─ Password updated
   │  ├─ Message: "Password reset successful!"
   │  └─ Auto-redirect to /login
   │
   └─ Error:
      ├─ "Token expired" → Redirect to /forgot-password
      └─ "Invalid token" → Show error message

┌─────────────────────────────────────────────────────────────┐
│                     LOGOUT FLOW                             │
└─────────────────────────────────────────────────────────────┘

8. Logout
   ├─ Click: User menu → "Logout"
   │
   ├─ Call: Supabase auth.signOut()
   │
   ├─ Clear: Session cookies
   │
   └─ Redirect: Homepage (/)

┌─────────────────────────────────────────────────────────────┐
│              EMAIL VERIFICATION FLOW (Optional)             │
└─────────────────────────────────────────────────────────────┘

9. Email Verification (if enabled in Supabase)
   ├─ After signup, user receives verification email
   │
   ├─ Email contains verification link
   │
   ├─ User clicks link
   │
   ├─ Supabase verifies email
   │
   └─ Redirect to /login with "Email verified!" message

```

---

## 10. Edge Cases & Error Flows

### Handling Errors and Edge Cases

```
┌─────────────────────────────────────────────────────────────┐
│                  QUOTA EXCEEDED FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. Monthly Minutes Quota Reached
   ├─ User tries to record
   │
   ├─ Backend check: minutes_used >= minutes_quota
   │
   ├─ API returns: 429 Too Many Requests
   │  └─ Error: "Monthly quota exceeded"
   │
   ├─ Frontend shows modal:
   │  ├─ "You've used 30/30 minutes this month"
   │  ├─ "Upgrade to Pro for 2000 min/month"
   │  ├─ "Or wait until [next billing date]"
   │  └─ CTA: "Upgrade Now"
   │
   └─ Blocks recording until:
      ├─ User upgrades, OR
      └─ Next month (quota resets)

┌─────────────────────────────────────────────────────────────┐
│                FILE SIZE LIMIT ERROR                        │
└─────────────────────────────────────────────────────────────┘

2. File Too Large for Tier
   ├─ User uploads 150MB file (Pro tier: 120MB limit)
   │
   ├─ Validation catches oversized file
   │
   ├─ Error modal:
   │  ├─ "File size (150MB) exceeds Pro limit (120MB)"
   │  ├─ "Please upload a smaller file"
   │  └─ "Or upgrade to Team tier (240MB limit)"
   │
   └─ Options:
      ├─ Choose smaller file
      ├─ Compress audio
      └─ Upgrade tier

┌─────────────────────────────────────────────────────────────┐
│               TRANSCRIPTION FAILURE FLOW                    │
└─────────────────────────────────────────────────────────────┘

3. Processing Fails
   ├─ Possible causes:
   │  ├─ OpenAI Whisper API down
   │  ├─ Claude API down
   │  ├─ Audio file corrupted
   │  └─ Network timeout
   │
   ├─ Recording status: 'failed'
   │
   ├─ User sees:
   │  ├─ Error message: "Processing failed"
   │  ├─ Reason shown (if available)
   │  └─ Options:
   │     ├─ "Retry Processing"
   │     ├─ "Download Audio"
   │     └─ "Contact Support"
   │
   └─ Minutes NOT deducted from quota

┌─────────────────────────────────────────────────────────────┐
│                MICROPHONE PERMISSION DENIED                 │
└─────────────────────────────────────────────────────────────┘

4. Mic Access Denied
   ├─ User clicks "Start Recording"
   │
   ├─ Browser prompts for mic access
   │
   ├─ User clicks "Block"
   │
   ├─ Error shown:
   │  ├─ "Microphone access denied"
   │  ├─ Instructions to enable:
   │  │  ├─ Chrome: Settings → Privacy → Microphone
   │  │  ├─ Firefox: Permissions → Microphone
   │  │  └─ Safari: Preferences → Websites → Microphone
   │  │
   │  └─ Alternative: "Try file upload instead"
   │
   └─ Recording cannot proceed

┌─────────────────────────────────────────────────────────────┐
│                 STRIPE PAYMENT FAILURE                      │
└─────────────────────────────────────────────────────────────┘

5. Payment Declined
   ├─ During Stripe checkout
   │
   ├─ Card declined reasons:
   │  ├─ Insufficient funds
   │  ├─ Card expired
   │  ├─ Incorrect CVV
   │  └─ Bank decline
   │
   ├─ Stripe shows error in checkout
   │
   ├─ User options:
   │  ├─ Try different card
   │  └─ Contact bank
   │
   └─ User remains on free tier

┌─────────────────────────────────────────────────────────────┐
│              SESSION EXPIRED / LOGGED OUT                   │
└─────────────────────────────────────────────────────────────┘

6. Session Expiration
   ├─ User inactive for extended period
   │
   ├─ Session cookie expires
   │
   ├─ User tries to access /dashboard
   │
   ├─ Middleware detects: No valid session
   │
   ├─ Redirect to: /login
   │
   ├─ Message: "Session expired. Please log in again."
   │
   └─ After login: Redirect back to intended page

┌─────────────────────────────────────────────────────────────┐
│                   NETWORK ERROR HANDLING                    │
└─────────────────────────────────────────────────────────────┘

7. Offline / Network Error
   ├─ User loses internet connection
   │
   ├─ API calls fail
   │
   ├─ Error boundary catches:
   │  └─ "Network error. Please check your connection."
   │
   ├─ Retry logic:
   │  ├─ Auto-retry after 3 seconds
   │  ├─ Exponential backoff
   │  └─ Max 3 retries
   │
   └─ If all fail:
      ├─ Show offline message
      └─ "Retry" button

┌─────────────────────────────────────────────────────────────┐
│                BROWSER COMPATIBILITY ISSUES                 │
└─────────────────────────────────────────────────────────────┘

8. Unsupported Browser
   ├─ User on Internet Explorer 11
   │
   ├─ Detect: User agent
   │
   ├─ Show warning banner:
   │  ├─ "Your browser is not supported"
   │  ├─ "Please use Chrome, Firefox, Safari, or Edge"
   │  └─ Link to download modern browser
   │
   └─ Limit functionality:
      └─ File upload only (no browser recording)

9. System Audio Capture Unavailable
   ├─ User on Firefox (doesn't support system audio API)
   │
   ├─ "System Audio Capture" tab hidden
   │
   └─ Tooltip: "Only available in Chrome/Edge"

┌─────────────────────────────────────────────────────────────┐
│                   RATE LIMITING                             │
└─────────────────────────────────────────────────────────────┘

10. Too Many Requests
    ├─ User creates 10 recordings in 1 minute
    │
    ├─ Supabase rate limit hit
    │
    ├─ Error: 429 Too Many Requests
    │
    ├─ Message: "Slow down! Please wait 60 seconds."
    │
    └─ Countdown timer shown

┌─────────────────────────────────────────────────────────────┐
│                  DATA NOT FOUND ERRORS                      │
└─────────────────────────────────────────────────────────────┘

11. Note Deleted or Not Found
    ├─ User clicks old link: /dashboard/notes/[deleted-id]
    │
    ├─ API returns: 404 Not Found
    │
    ├─ Show 404 page:
    │  ├─ "Note not found"
    │  ├─ "It may have been deleted"
    │  └─ Link: "Back to All Notes"
    │
    └─ Redirect after 5 seconds

12. Recording Still Processing
    ├─ User navigates away during processing
    │
    ├─ Returns later to note URL
    │
    ├─ If still processing:
    │  └─ Show processing page with progress
    │
    └─ If failed:
       └─ Show error with retry option

```

---

## 📊 Flow Metrics & KPIs

### Key Performance Indicators for Each Flow

**Onboarding Flow:**
- Signup → Onboarding completion: Target 80%+
- Onboarding → First recording: Target < 5 minutes
- Day 1 retention: Target 40%+

**Recording Flow:**
- Recording success rate: Target 98%+
- Average processing time: Target < 90 seconds
- Transcription accuracy: Target 95%+ (by user feedback)

**Upgrade Flow:**
- Free → Pro conversion: Target 10%+
- Upgrade trigger → Checkout: Target 60%+
- Checkout → Payment success: Target 85%+

**Retention:**
- Day 7 retention: Target 25%+
- Day 30 retention: Target 15%+
- Monthly active users: Track growth

**Engagement:**
- Average recordings per user/month: Target 8+
- Notes exported per user: Target 30%+
- Return visit rate: Target 3x/week

---

**Document Version:** 1.0
**Last Updated:** January 18, 2026
**Maintained By:** Product Team

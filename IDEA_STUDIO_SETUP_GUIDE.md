# Idea Studio - Complete Setup Guide

## ✅ What's Already Done

### 1. **UI Updates** ✅
- ✅ Enhanced Idea Studio recording page with beautiful "What You'll Get" showcase
- ✅ Updated note detail page with color-coded sections for all brainstorming outputs
- ✅ Added IdeaStudioActions component with AI Research, Project Brief, and Mind Map buttons
- ✅ Gradient backgrounds and premium styling throughout

### 2. **Backend Services** ✅
All AI services are fully implemented:
- ✅ `src/lib/api/tavily.ts` - Tavily web search client
- ✅ `src/lib/services/research-assistant.ts` - AI research orchestration
- ✅ `src/lib/services/project-brief-generator.ts` - Project brief generation
- ✅ `src/lib/services/mindmap-generator.ts` - Mermaid.js mind map generation
- ✅ `src/lib/services/idea-evolution.ts` - Embeddings-based similar notes

### 3. **API Routes** ✅
- ✅ `/api/notes/[id]/research` - Trigger AI research
- ✅ `/api/notes/[id]/project-brief` - Generate project brief
- ✅ `/api/notes/[id]/mindmap` - Generate mind map
- ✅ `/api/notes/[id]/related` - Find related notes

---

## 🚀 Next Steps to Make It Work

### Step 1: Environment Variables Setup

Add these API keys to your `.env.local` file:

```bash
# Existing (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# NEW - Required for Idea Studio
TAVILY_API_KEY=your_tavily_api_key        # For AI web research
OPENAI_API_KEY=your_openai_api_key        # For embeddings & Whisper
```

#### How to Get API Keys:

**1. Tavily API Key (Required for AI Research)**
- Visit: https://app.tavily.com/sign-up
- Sign up for free account
- Get API key from dashboard
- Free tier: 1,000 requests/month (sufficient for testing)
- Cost after free tier: ~$0.50 per 100 searches

**2. OpenAI API Key (Required for Embeddings & Whisper)**
- Visit: https://platform.openai.com/api-keys
- Sign up and add payment method
- Create API key
- Cost:
  - Embeddings: $0.00002 per 1K tokens (~$0.01 per 100 notes)
  - Whisper: $0.006 per minute of audio

---

### Step 2: Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add new columns for Idea Studio features
ALTER TABLE notes ADD COLUMN IF NOT EXISTS research_data JSONB;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index for similarity search (idea evolution)
CREATE INDEX IF NOT EXISTS notes_embedding_idx
ON notes USING ivfflat (embedding vector_cosine_ops);
```

**How to Run:**
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in left sidebar
3. Paste the SQL above
4. Click "Run" button
5. Verify success message

---

### Step 3: Update Processing Pipeline

The current transcription processing needs to be updated to generate brainstorming-specific outputs.

#### File to Modify: `src/app/api/transcribe/route.ts`

Find the section where notes are created and add logic to differentiate brainstorming mode:

```typescript
// After Whisper transcription completes...
const mode = recording.mode || 'meeting'

if (mode === 'brainstorming') {
  // Use brainstorming-specific Claude prompt
  const brainstormingStructure = await generateBrainstormingStructure(cleanedText)

  // Create note with brainstorming structure
  const { data: note } = await supabase.from('notes').insert({
    user_id: userId,
    recording_id: recordingId,
    title: generateTitle(cleanedText),
    content: cleanedText,
    mode: 'brainstorming',
    structure: brainstormingStructure, // Contains coreIdeas, expansionOpportunities, etc.
  }).select().single()

  // Generate embedding for idea evolution tracking
  const embedding = await generateEmbedding(cleanedText)
  await supabase.from('notes').update({ embedding }).eq('id', note.id)

} else {
  // Existing meeting notes logic
  // ... (keep current implementation)
}
```

#### Brainstorming Structure Generator

Create new file: `src/lib/services/brainstorming-processor.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateBrainstormingStructure(transcript: string) {
  const prompt = `You are a creative thinking partner helping expand and organize brainstorming ideas.

TRANSCRIPT:
${transcript}

YOUR TASK:
Analyze this brainstorming session and extract:

1. **Core Ideas** (3-7 main concepts):
   - Title: Clear name for the idea
   - Description: 1-2 sentence explanation
   - Connections: How it relates to other ideas

2. **Expansion Opportunities** (2-3 per core idea):
   - Directions to explore further
   - New angles to consider

3. **Research Questions** (5-10 questions):
   - What needs investigation?
   - What information is missing?

4. **Next Steps** (5-10 actionable items):
   - Concrete actions to move ideas forward
   - Mark priority as high/medium/low

5. **Potential Obstacles** (3-7 challenges):
   - What could go wrong?
   - What needs to be addressed?

6. **Creative Prompts** (5-10 questions):
   - Questions to spark deeper thinking
   - Alternative perspectives to consider

Format as JSON with this exact structure:
{
  "coreIdeas": [
    {
      "title": "string",
      "description": "string",
      "connections": ["string"]
    }
  ],
  "expansionOpportunities": [
    {
      "ideaTitle": "string",
      "directions": ["string"]
    }
  ],
  "researchQuestions": ["string"],
  "nextSteps": [
    {
      "step": "string",
      "priority": "high" | "medium" | "low"
    }
  ],
  "obstacles": ["string"],
  "creativePrompts": ["string"]
}`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  const content = response.content[0]
  if (content.type === 'text') {
    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  }

  throw new Error('Failed to generate brainstorming structure')
}
```

---

### Step 4: Install Missing NPM Packages

Check if these are installed (should be from previous setup):

```bash
npm list openai mermaid
```

If not installed, run:

```bash
npm install openai@^4.0.0 mermaid@^10.0.0
```

---

### Step 5: Test the Complete Flow

#### Test 1: Basic Brainstorming Recording

1. **Navigate to Idea Studio:**
   - Go to dashboard
   - Click "Idea Studio" in left sidebar
   - You should see the beautiful "What You'll Get" section

2. **Record a Test Session:**
   - Click "Start Recording"
   - Speak for 1-2 minutes about any project idea:
     ```
     "I'm thinking about building a mobile app for meal planning.
     Users could input their dietary preferences and get weekly meal plans.
     The app could integrate with grocery stores for delivery.
     Main challenges would be keeping the recipe database updated
     and handling different dietary restrictions like vegan, keto, etc.
     Maybe we could use AI to suggest recipes based on what ingredients
     users already have. Need to research what competitors are doing."
     ```

3. **Wait for Processing:**
   - Upload completes
   - Whisper transcribes audio (~30 seconds)
   - Claude generates brainstorming structure (~1 minute)

4. **View Results:**
   - Navigate to the note
   - You should see beautifully formatted sections:
     - ✨ Core Ideas (2-3 cards showing main concepts)
     - 📈 Expansion Opportunities (directions to explore)
     - ❓ Research Questions (what needs investigation)
     - ⚠️ Potential Obstacles (challenges identified)
     - 💭 Creative Prompts (questions to spark thinking)
     - 🎯 Next Steps (actionable items with priority)

#### Test 2: AI Research Assistant

1. **On the note page, click "AI Research" button**
2. **What happens:**
   - Identifies research questions from your brainstorming
   - Searches web using Tavily API (3-5 searches)
   - Uses Claude to synthesize findings
   - Adds "AI Research Findings" section to note with:
     - Summary
     - Key insights
     - Detailed findings with sources

3. **Expected time:** 30-60 seconds

#### Test 3: Project Brief Generator

1. **Click "Project Brief" button**
2. **What happens:**
   - Generates structured project plan
   - Opens in new window with formatted document
   - Includes:
     - Executive Overview
     - Goals & Objectives
     - Key Requirements
     - Timeline (phases with deliverables)
     - Resources Needed (people, tools, budget)
     - Success Metrics
     - Risks & Mitigation
     - Next Steps

3. **Can download as:**
   - Markdown
   - PDF (if implemented)
   - JSON (structured data)

#### Test 4: Mind Map

1. **Click "Mind Map" button**
2. **What happens:**
   - Generates Mermaid.js syntax from note structure
   - Renders as image via Mermaid.ink
   - Opens in new window showing visual mind map
   - Center: Main topic
   - Branches: Core ideas
   - Sub-branches: Expansion opportunities

---

## 🎨 What the UI Looks Like

### Recording Page (Idea Studio Mode)
```
┌─────────────────────────────────────────────────────┐
│  ✨ Idea Studio - Premium Feature - Testing Phase   │
│                                                      │
│  ✨ What You'll Get After Recording                 │
│                                                      │
│  [Core Brainstorming Insights]                      │
│   • Core Ideas: Main concepts extracted              │
│   • Idea Connections: How thoughts relate            │
│   • Expansion Opportunities: Directions to explore   │
│   • Research Questions: What needs investigation     │
│   • Obstacles & Solutions: Challenges identified     │
│   • Creative Prompts: Questions to spark thinking    │
│                                                      │
│  [AI-Powered Tools]                                  │
│   [💡 AI Research]  [⚡ Project Brief]  [✨ Mind Map] │
│                                                      │
│  Plus: Clean transcript with filler words removed ✨ │
│                                                      │
│  [🎙️ Microphone Only] [🖥️ System Audio Capture]    │
│                                                      │
│  [Start Recording Button]                           │
└─────────────────────────────────────────────────────┘
```

### Note Display (After Processing)
```
┌─────────────────────────────────────────────────────┐
│  FifthDraft • ✨ Idea Studio                        │
│  ← Back to Dashboard                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  [Meal Planning App Idea]                           │
│  brainstorming mode • Jan 11, 2026 • 2 minutes     │
│  [Export ▼]                                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ✨ Idea Studio Tools                    [Pro]      │
│  [💡 AI Research] [📄 Project Brief] [🗺️ Mind Map]  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  💡 Core Ideas                                       │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ Meal Planning  │  │ AI Recipe      │            │
│  │ App Platform   │  │ Suggestions    │            │
│  │ Description... │  │ Description... │            │
│  │ → Grocery      │  │ → Ingredient   │            │
│  └────────────────┘  └────────────────┘            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📈 Expansion Opportunities                          │
│  Meal Planning App Platform                          │
│   → Integration with grocery delivery services       │
│   → Social features for recipe sharing               │
│   → Meal prep video tutorials                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ❓ Research Questions                               │
│  ? What are the top meal planning competitors?       │
│  ? How do users currently plan meals?                │
│  ? What dietary restrictions are most common?        │
└─────────────────────────────────────────────────────┘

[More sections: AI Research Findings, Obstacles,
 Creative Prompts, Next Steps, Full Transcript...]
```

---

## 📊 Expected Costs

For testing with **10-20 brainstorming sessions**:

| Service | Usage | Cost |
|---------|-------|------|
| OpenAI Whisper | 20 mins audio | $0.12 |
| OpenAI Embeddings | 20 notes | $0.20 |
| Anthropic Claude | ~500K tokens | $7.50 |
| Tavily Search | 50 searches | $0.25 |
| **Total** | **Testing** | **~$8** |

**Per session ongoing:**
- Transcription: $0.006/min
- Brainstorming structure: ~$0.30
- AI Research (optional): ~$0.15
- Project Brief (optional): ~$0.05
- Mind Map: ~$0.00 (free service)
- **Total per session: ~$0.50-0.60**

---

## ⚠️ Common Issues & Solutions

### Issue 1: "TAVILY_API_KEY is not defined"
**Solution:**
- Check `.env.local` file has the key
- Restart dev server: `npm run dev`
- Verify key is correct at https://app.tavily.com

### Issue 2: "Failed to generate embedding"
**Solution:**
- Check `OPENAI_API_KEY` is set
- Verify you have credits in OpenAI account
- Check API key has correct permissions

### Issue 3: Note structure not showing
**Solution:**
- Check database migration ran successfully
- Verify `notes.structure` column is JSONB type
- Check browser console for errors

### Issue 4: AI Research button does nothing
**Solution:**
- Open browser DevTools (F12)
- Check Network tab for API errors
- Verify Tavily API key is valid
- Check rate limits not exceeded

### Issue 5: Mind map not rendering
**Solution:**
- Check network request to Mermaid.ink
- Verify Mermaid syntax is valid
- Try opening the syntax in https://mermaid.live

---

## 🧪 Testing Checklist

- [ ] Environment variables set (`TAVILY_API_KEY`, `OPENAI_API_KEY`)
- [ ] Database migration completed
- [ ] NPM packages installed (`openai`, `mermaid`)
- [ ] Brainstorming processing logic added
- [ ] Dev server restarted
- [ ] Test recording in Idea Studio mode
- [ ] Verify brainstorming structure displays
- [ ] Test AI Research button
- [ ] Test Project Brief generation
- [ ] Test Mind Map generation
- [ ] Check all sections have proper styling
- [ ] Verify gradient backgrounds appear
- [ ] Test on mobile (responsive design)

---

## 🎉 Success Criteria

When everything works, you should be able to:

1. ✅ Navigate to Idea Studio and see beautiful "What You'll Get" section
2. ✅ Record a brainstorming session (2-3 minutes)
3. ✅ Wait ~90 seconds for processing
4. ✅ See note with all sections displayed:
   - Core Ideas (color-coded cards)
   - Expansion Opportunities (with arrows)
   - Research Questions (with ? icons)
   - Obstacles (with warning icons)
   - Creative Prompts (in italic with emojis)
   - Next Steps (numbered with priority badges)
5. ✅ Click "AI Research" and see web research results added
6. ✅ Click "Project Brief" and download structured plan
7. ✅ Click "Mind Map" and see visual representation
8. ✅ All sections have beautiful gradient styling
9. ✅ Mobile responsive (test on phone)
10. ✅ No console errors

---

## 📝 File Checklist

### Files Modified ✅
- ✅ `src/app/dashboard/record/page.tsx` - Enhanced "What You'll Get" section
- ✅ `src/app/dashboard/notes/[id]/page.tsx` - Added all Idea Studio sections

### Files Already Created ✅
- ✅ `src/lib/api/tavily.ts`
- ✅ `src/lib/services/research-assistant.ts`
- ✅ `src/lib/services/project-brief-generator.ts`
- ✅ `src/lib/services/mindmap-generator.ts`
- ✅ `src/lib/services/idea-evolution.ts`
- ✅ `src/components/notes/IdeaStudioActions.tsx`
- ✅ `src/app/api/notes/[id]/research/route.ts`
- ✅ `src/app/api/notes/[id]/project-brief/route.ts`
- ✅ `src/app/api/notes/[id]/mindmap/route.ts`
- ✅ `src/app/api/notes/[id]/related/route.ts`

### Files to Create 🔨
- 🔨 `src/lib/services/brainstorming-processor.ts` - Main brainstorming logic
- 🔨 Update `src/app/api/transcribe/route.ts` - Add brainstorming mode handling

---

## 🚀 Quick Start Commands

```bash
# 1. Set environment variables
# Edit .env.local and add TAVILY_API_KEY and OPENAI_API_KEY

# 2. Install dependencies (if needed)
npm install openai@^4.0.0 mermaid@^10.0.0

# 3. Run database migration
# (Use Supabase SQL Editor with SQL provided above)

# 4. Restart dev server
npm run dev

# 5. Open browser
# Navigate to: http://localhost:3000/dashboard/record?mode=brainstorming

# 6. Test recording
# Speak for 2-3 minutes about any project idea

# 7. Check results
# View the note and verify all sections appear with beautiful styling
```

---

## 📞 Support

If you encounter any issues:

1. **Check browser console** (F12) for errors
2. **Check server logs** in terminal
3. **Verify API keys** are correct
4. **Check API quotas** (Tavily, OpenAI)
5. **Review network requests** in DevTools

---

**Everything is ready to go! Just follow Steps 1-5 above and you'll have a fully functional Idea Studio.** 🎉

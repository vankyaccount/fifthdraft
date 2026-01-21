# 🔧 Idea Studio Troubleshooting Guide

## Issues Fixed ✅

I've just fixed the following critical bugs:

### 1. ✅ Fixed Async Params Error
**Error:** `Route used params.id. params is a Promise and must be unwrapped`

**Files Updated:**
- `src/app/api/notes/[id]/project-brief/route.ts`
- `src/app/api/notes/[id]/mindmap/route.ts`
- `src/app/api/notes/[id]/research/route.ts`
- `src/app/api/notes/[id]/related/route.ts`

**What I Did:** Changed all route handlers to await the params promise (Next.js 15 requirement)

### 2. ✅ Fixed Action Items Insert Error
**Error:** `null value in column "title" violates not-null constraint`

**File Updated:** `src/app/api/transcribe/route.ts` (line 484)

**What I Did:** Fixed mapping for brainstorming mode to use `item.step` instead of `item.title`

### 3. ✅ Enhanced Error Logging
**File Updated:** `src/lib/services/brainstorming-processor.ts`

**What I Did:** Added detailed error logging to help identify why the processor is failing

---

## Current Issue: Brainstorming Processor Falling Back

Your brainstorming notes are hitting the fallback error handler, which is why you're seeing minimal data.

### How to Debug This

**Step 1: Restart Your Dev Server**
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

**Step 2: Record a New Brainstorming Session**
1. Go to Idea Studio
2. Record 2-3 minutes about "Amazon Dropshipping Business Startup Plan" (or any idea)
3. Watch the terminal output carefully

**Step 3: Check the Logs**

Look for these specific error messages in your terminal:

#### ✅ Success Pattern (What You Should See):
```
Processing brainstorming note...
Generated brainstorming structure with X core ideas
Embedding saved successfully for note: [note-id]
Creating next steps. Count: X
Next steps created successfully
```

#### ❌ Error Pattern (What's Currently Happening):
```
Error generating brainstorming structure: [ERROR MESSAGE HERE]
Error details: {
  message: "...",
  stack: "...",
  type: "..."
}
```

**Step 4: Share the Error Details**

Copy the **exact error message** from the logs and share it with me. This will tell us:
- Is it a Claude API key issue?
- Is it a JSON parsing error?
- Is it a timeout?
- Is it something else?

---

## Common Issues & Solutions

### Issue 1: Missing TAVILY_API_KEY

**Symptom:** AI Research button returns 500 error
```
Error: Tavily API key not found
```

**Solution:**
1. Add to `.env.local`:
   ```bash
   TAVILY_API_KEY=your_tavily_key
   ```
2. Get free key: https://app.tavily.com/sign-up (1000 searches/month free)
3. Restart dev server

### Issue 2: Missing ANTHROPIC_API_KEY

**Symptom:** Brainstorming processor immediately fails
```
Error: Missing API key
```

**Solution:**
1. Verify `.env.local` has:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   ```
2. Restart dev server

### Issue 3: Missing OPENAI_API_KEY

**Symptom:** Embeddings fail, idea evolution doesn't work
```
Error: OpenAI API key not configured
```

**Solution:**
1. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

2. Restart dev server

### Issue 4: Claude API Timeout

**Symptom:** Error message mentions "timeout" or "timed out"

**Solution:**
- Shorter recordings (under 5 minutes)
- Try again (Claude API can be slow sometimes)
- Check your internet connection

### Issue 5: Claude Returns Invalid JSON

**Symptom:** Error message: "Failed to extract JSON from Claude response"

**Solution:**
- This is a prompt issue
- The enhanced logging will show what Claude actually returned
- Share the logs with me and I'll fix the prompt

---

## Expected Behavior (When Working)

### Recording Guidelines for Idea Studio

**Recommended Recording Length: 2-5 minutes**
- Provides enough context for comprehensive AI analysis
- Allows Claude to identify core ideas, connections, and opportunities
- Better quality insights vs. very short recordings (<1 min)

**Processing Time: 1-2 minutes**
- We prioritize **accuracy over speed**
- This ensures high-quality insights and minimizes API costs
- Multiple AI models are used (Claude for analysis, OpenAI for embeddings)

**Shorter recordings (<1 min) may result in:**
- Fewer core ideas identified
- Limited expansion opportunities
- Generic research questions

**Longer recordings (>10 min) may:**
- Take longer to process (2-3 minutes)
- Work better if broken into 2-3 separate focused sessions

### Recording Page (Idea Studio Mode)
You should see a beautiful showcase section with:
- 💡 Recording guidelines (2-5 min recommended, processing time notice)
- ✨ Core Brainstorming Insights (6 bullet points)
- 💡 AI Research card
- ⚡ Project Brief card
- ✨ Mind Map card

### After Recording (Note Detail Page)
You should see **9 beautiful color-coded sections**:

1. **Core Ideas** (purple gradient cards)
2. **Expansion Opportunities** (indigo gradient)
3. **Research Questions** (blue gradient numbered list)
4. **AI Research Findings** (green gradient with sources)
5. **Potential Obstacles** (amber gradient)
6. **Creative Prompts** (pink gradient)
7. **Next Steps** (purple gradient with priority badges)
8. **Full Transcript** (collapsible)
9. **3 Action Buttons** (AI Research, Project Brief, Mind Map)

### What Each Feature Does

**AI Research (requires TAVILY_API_KEY):**
- Automatically identifies research questions
- Uses Tavily AI to search the web
- Adds findings with sources to your note

**Project Brief:**
- Transforms rambling ideas into structured project plan
- 8 sections: Overview, Goals, Requirements, Timeline, Resources, Success Metrics, Risks, Next Steps
- Export as Markdown or PDF

**Mind Map:**
- Visual diagram of your ideas
- Mermaid.js syntax
- Shows connections between concepts

---

## Next Steps for You

1. **Restart dev server** to apply all fixes
2. **Record new brainstorming session** (2-3 minutes)
3. **Watch terminal logs carefully**
4. **Copy exact error message** if processor fails
5. **Share error with me** so I can fix the root cause

The async params and action items issues are now fixed, but we need to see the actual error from the brainstorming processor to fix that final piece.

---

## Files Changed Summary

| File | Change | Purpose |
|------|--------|---------|
| `src/lib/services/brainstorming-processor.ts` | Enhanced error logging | See exact error details |
| `src/app/api/transcribe/route.ts` | Fixed action items mapping | Use `item.step` for brainstorming |
| `src/app/api/notes/[id]/project-brief/route.ts` | Async params | Next.js 15 compatibility |
| `src/app/api/notes/[id]/mindmap/route.ts` | Async params | Next.js 15 compatibility |
| `src/app/api/notes/[id]/research/route.ts` | Async params | Next.js 15 compatibility |
| `src/app/api/notes/[id]/related/route.ts` | Async params | Next.js 15 compatibility |

---

## Environment Variables Checklist

Make sure your `.env.local` file has all these keys:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic Claude (REQUIRED for Idea Studio)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (REQUIRED for transcription and embeddings)
OPENAI_API_KEY=sk-...

# Tavily (REQUIRED for AI Research feature)
TAVILY_API_KEY=tvly-...

# Stripe (optional for now)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

After adding any keys, **ALWAYS restart the dev server**!

---

## Still Having Issues?

Share with me:
1. ✅ Full error message from terminal
2. ✅ Which environment variables you have set
3. ✅ Recording duration and topic
4. ✅ Any other error messages you see

I'll help you debug and fix it! 🚀

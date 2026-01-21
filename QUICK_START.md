# 🚀 Idea Studio - Quick Start

## 3 Steps to Get Running

### 1️⃣ Database (2 min)
```sql
-- Run in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS research_data JSONB;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX IF NOT EXISTS notes_embedding_idx ON notes USING ivfflat (embedding vector_cosine_ops);
```

### 2️⃣ Environment Variables (5 min)
```bash
# Add to .env.local:
TAVILY_API_KEY=your_key     # From https://app.tavily.com
OPENAI_API_KEY=your_key     # From https://platform.openai.com
```

### 3️⃣ Test (10 min)
```bash
npm run dev
# Navigate to: http://localhost:3000/dashboard/record?mode=brainstorming
# Record for 2-3 minutes
# View the beautiful results!
```

## ✅ What You'll See

**Recording Page:**
- ✨ "What You'll Get After Recording" section
- Beautiful gradient styling
- List of all brainstorming features

**Note Page:**
- 💜 Gradient purple/pink background
- 💡 Core Ideas cards
- 📈 Expansion Opportunities
- ❓ Research Questions  
- ⚠️ Potential Obstacles
- ✨ Creative Prompts
- 🎯 Next Steps
- 3 Action buttons (AI Research, Project Brief, Mind Map)

## 💰 Costs
- Per session: ~$0.33
- With AI Research: ~$0.50
- Mind Map: FREE

## 🆘 Quick Fixes

**Error: type "vector" does not exist**
→ Run CREATE EXTENSION first (Step 1 above)

**Error: TAVILY_API_KEY not defined**
→ Add to .env.local and restart server

**Sections not showing**
→ Check browser console, verify migration ran

---

**Everything ready! Start recording in Idea Studio! 🎉**

/**
 * Specialized AI prompts for brainstorming mode processing
 *
 * Brainstorming mode focuses on:
 * - Expanding ideas and identifying connections
 * - Suggesting research directions
 * - Encouraging creative exploration
 * - Identifying obstacles and opportunities
 */

export function getBrainstormingPrompt(cleanedText: string): string {
  return `You are a creative thinking partner helping expand and organize brainstorming ideas.

TRANSCRIPT:
${cleanedText}

YOUR TASK:
Analyze this brainstorming session and extract structured information to help the user develop their ideas.

Return ONLY valid JSON in this exact format:
{
  "summary": "2-3 sentence overview of the brainstorming session",
  "coreIdeas": [
    {
      "title": "Brief title for the idea",
      "description": "1-2 sentence description",
      "connections": ["ID or title of related ideas mentioned"]
    }
  ],
  "expansionOpportunities": [
    {
      "ideaTitle": "Which core idea this relates to",
      "directions": [
        "Specific direction to explore (e.g., 'Consider adding gamification features')",
        "Another direction (e.g., 'Research competitors in this space')"
      ]
    }
  ],
  "researchQuestions": [
    "What would you need to research? (e.g., 'What are the current market trends in this space?')",
    "Another research question"
  ],
  "nextSteps": [
    {
      "title": "Specific action with clear deliverable (use varied verbs)",
      "description": "Detailed requirements including: what exactly needs to be done, specific deliverables expected, relevant context from the brainstorming, resources needed. Include names, numbers, and specific details discussed.",
      "dueDate": "YYYY-MM-DD if mentioned, otherwise null",
      "priority": "high|medium|low (realistically assessed - default to medium)"
    }
  ],
  "obstacles": [
    "Potential challenge or blocker (e.g., 'Limited budget for initial prototype')",
    "Another obstacle"
  ],
  "creativePrompts": [
    "Question to spark further thinking (e.g., 'What if you combined this with AI technology?')",
    "Another creative prompt"
  ]
}

GUIDELINES:
- Focus on EXPANDING ideas, not just summarizing
- Identify CONNECTIONS between different ideas mentioned
- Suggest concrete DIRECTIONS for exploration
- Frame challenges as OPPORTUNITIES when possible
- Ask PROVOCATIVE questions to deepen thinking
- Be ENCOURAGING and supportive of creative exploration

NEXT STEPS - WBS PRINCIPLES:
- Use VARIED action verbs (Draft, Prepare, Research, Design, Prototype, Test, Review, Compile, Schedule, Coordinate)
- DO NOT start multiple steps with the same verb
- DO NOT use filler phrases like "as discussed", "per the session", "as mentioned"
- Each step must be independently completable and verifiable
- Include WHO, WHAT, and WHY - make each step self-contained
- Set dueDate ONLY if explicitly mentioned, otherwise null
- Priority: "high" = urgent/blocking, "medium" = standard (default), "low" = nice-to-have

Return ONLY the JSON, no other text.`
}

export function getMeetingPrompt(cleanedText: string, mode: string): string {
  return `Analyze this ${mode} transcript and extract structured meeting notes following a Work Breakdown Structure (WBS) approach.

Extract the following in JSON format:
1. summary: A 2-3 sentence summary of the main topics discussed
2. keyPoints: Array of 3-5 key points/highlights (strings)
3. decisions: Array of decisions made (strings)
4. actionItems: Array of tasks organized using WBS principles
5. questions: Array of open questions or follow-up items (strings)

=== WORK BREAKDOWN STRUCTURE (WBS) GUIDELINES FOR ACTION ITEMS ===

STRUCTURE REQUIREMENTS:
- Break down complex deliverables into discrete, manageable tasks
- Each task should be independently completable and verifiable
- Group related tasks logically (e.g., research tasks together, communication tasks together)
- Ensure no overlap or duplication between tasks
- Each task title must be unique and specific - avoid generic phrases

WRITING STYLE - REMOVE REPETITIVE LANGUAGE:
- DO NOT start multiple tasks with the same verb (e.g., "Create...", "Create...", "Create...")
- DO NOT use filler phrases like "as discussed", "per the meeting", "as mentioned"
- DO NOT repeat the same context in multiple task descriptions
- Use varied, action-oriented verbs: Draft, Prepare, Compile, Analyze, Review, Schedule, Coordinate, Finalize, Document, Configure, Implement, Research, Design, Test, Validate
- Be concise in titles - put details in the description, not the title
- Each description should add NEW information, not restate the title

DUE DATE HANDLING:
- Extract explicit dates mentioned (e.g., "by Friday", "before the 15th", "next week")
- Convert relative dates to YYYY-MM-DD format based on today's context
- If no date is mentioned or implied, set dueDate to null (leave blank)
- Do NOT invent arbitrary due dates - only include dates that were actually discussed

PRIORITY ASSIGNMENT (be realistic):
- "high": Explicitly marked urgent, blocking other work, has hard deadline within 3 days, or critical path item
- "medium": Standard tasks with normal timelines, important but not urgent
- "low": Nice-to-have items, long-term tasks, or items with flexible deadlines
- Default to "medium" if urgency is unclear - avoid marking everything as "high"

STATUS:
- All new items should have status "pending"
- Do NOT mark items as "in_progress" or "completed" unless explicitly stated in the transcript

=== EXAMPLES ===

BAD (repetitive, vague, fake dates):
[
  {"title": "Create presentation for stakeholders", "description": "Create a presentation as discussed in the meeting", "priority": "high", "dueDate": "2026-01-25"},
  {"title": "Create documentation", "description": "Create documentation for the new feature as mentioned", "priority": "high", "dueDate": "2026-01-26"},
  {"title": "Create email to team", "description": "Create an email to inform the team about changes discussed", "priority": "high", "dueDate": "2026-01-27"}
]

GOOD (varied verbs, specific, real dates only):
[
  {"title": "Draft Q1 stakeholder presentation - revenue projections", "description": "Include: 1) Revenue forecast of $2.3M vs $2.1M target, 2) Customer acquisition costs breakdown, 3) Three growth scenarios (conservative/moderate/aggressive). Use company template from SharePoint.", "assignee": "Sarah", "dueDate": "2026-01-20", "priority": "high"},
  {"title": "Document API authentication flow for v2 release", "description": "Cover OAuth2 implementation, token refresh logic, and error handling. Target audience: external developers. Add code samples in Python and JavaScript.", "assignee": "Dev Team", "dueDate": null, "priority": "medium"},
  {"title": "Notify engineering team of deployment schedule change", "description": "Inform about shift from Thursday to Monday deployment window. Include new rollback procedures and on-call rotation updates.", "assignee": "Mike", "dueDate": null, "priority": "low"}
]

=== OUTPUT FORMAT ===

Return ONLY valid JSON:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "decisions": ["...", "..."],
  "actionItems": [
    {
      "title": "Specific task title with key deliverable (no filler phrases)",
      "description": "Detailed requirements, success criteria, dependencies. Include specific numbers, names, and context from discussion.",
      "assignee": "Person or team name if mentioned, otherwise null",
      "dueDate": "YYYY-MM-DD if explicitly mentioned, otherwise null",
      "priority": "high|medium|low (realistically assessed)"
    }
  ],
  "questions": ["...", "..."]
}

Transcript:
${cleanedText}`
}

export interface BrainstormingOutcome {
  summary: string
  coreIdeas: Array<{
    title: string
    description: string
    connections: string[]
  }>
  expansionOpportunities: Array<{
    ideaTitle: string
    directions: string[]
  }>
  researchQuestions: string[]
  nextSteps: Array<{
    title: string
    description: string
    dueDate?: string | null
    priority: 'high' | 'medium' | 'low'
  }>
  obstacles: string[]
  creativePrompts: string[]
}

export interface MeetingOutcome {
  summary: string
  keyPoints: string[]
  decisions: string[]
  actionItems: Array<{
    title: string
    description?: string
    assignee?: string
    dueDate?: string
    priority?: 'high' | 'medium' | 'low'
  }>
  questions: string[]
}

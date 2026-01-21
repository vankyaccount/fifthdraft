/**
 * Project Brief Generator Service
 * Transforms brainstorming notes into structured project briefs
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ProjectBrief {
  title: string
  overview: string
  goals: string[]
  requirements: string[]
  timeline: {
    phase: string
    duration: string
    deliverables: string[]
  }[]
  resources: {
    people: string[]
    tools: string[]
    budget: string
  }
  successMetrics: string[]
  risks: {
    risk: string
    mitigation: string
  }[]
  nextSteps: {
    step: string
    priority: 'high' | 'medium' | 'low'
    owner?: string
  }[]
}

/**
 * Generate a structured project brief from brainstorming content
 */
export async function generateProjectBrief(
  noteTitle: string,
  noteContent: string,
  coreIdeas: any[],
  nextSteps: any[]
): Promise<ProjectBrief> {
  const prompt = `You are a project planning expert. Transform this brainstorming session into a comprehensive, professional project brief.

BRAINSTORMING SESSION:
Title: ${noteTitle}

Content: ${noteContent}

Core Ideas Identified:
${coreIdeas.map(idea => `- ${idea.title}: ${idea.description}`).join('\n')}

Next Steps Identified:
${nextSteps.map(step => `- ${step.title} (${step.priority}): ${step.description}`).join('\n')}

Create a structured project brief. Return ONLY valid JSON in this exact format:
{
  "title": "Professional project title (concise, clear)",
  "overview": "2-3 paragraph executive summary covering what, why, and expected impact",
  "goals": ["Primary goal 1", "Primary goal 2", "Primary goal 3"],
  "requirements": [
    "Specific requirement 1",
    "Specific requirement 2",
    "Specific requirement 3"
  ],
  "timeline": [
    {
      "phase": "Phase 1: Discovery & Planning",
      "duration": "2-3 weeks",
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    },
    {
      "phase": "Phase 2: Development",
      "duration": "4-6 weeks",
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    },
    {
      "phase": "Phase 3: Launch & Iteration",
      "duration": "2 weeks",
      "deliverables": ["Deliverable 1"]
    }
  ],
  "resources": {
    "people": ["Role/skill needed 1", "Role/skill needed 2"],
    "tools": ["Tool/platform 1", "Tool/platform 2"],
    "budget": "Estimated budget range or 'TBD pending detailed scoping'"
  },
  "successMetrics": [
    "Measurable metric 1",
    "Measurable metric 2",
    "Measurable metric 3"
  ],
  "risks": [
    {
      "risk": "Potential risk 1",
      "mitigation": "How to address this risk"
    },
    {
      "risk": "Potential risk 2",
      "mitigation": "How to address this risk"
    }
  ],
  "nextSteps": [
    {
      "step": "Immediate action 1",
      "priority": "high",
      "owner": "Who should do this (if identifiable)"
    },
    {
      "step": "Immediate action 2",
      "priority": "high"
    },
    {
      "step": "Follow-up action",
      "priority": "medium"
    }
  ]
}

IMPORTANT:
- Be specific and actionable
- Base estimates on the content (realistic for the scope)
- Identify real risks mentioned or implied
- Use professional business language
- Return ONLY the JSON, no other text`

  console.log('[Project Brief] Calling Claude API...')
  console.log('[Project Brief] Input:', {
    noteTitle,
    contentLength: noteContent.length,
    coreIdeasCount: coreIdeas.length,
    nextStepsCount: nextSteps.length
  })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  console.log('[Project Brief] Claude API response received')

  const content = message.content[0]
  if (content.type !== 'text') {
    console.error('[Project Brief] Unexpected content type:', content.type)
    throw new Error('Unexpected response type from Claude')
  }

  try {
    // Claude sometimes wraps JSON in markdown code blocks, so let's clean it
    let jsonText = content.text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/```\s*$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }

    console.log('[Project Brief] Claude response length:', jsonText.length)

    const brief = JSON.parse(jsonText.trim())
    console.log('[Project Brief] Successfully parsed:', {
      title: brief.title,
      goalCount: brief.goals?.length,
      timelinePhases: brief.timeline?.length
    })
    return brief
  } catch (error: any) {
    console.error('[Project Brief] Failed to parse Claude response:', {
      error: error.message,
      rawResponse: content.text.substring(0, 500) + '...',
      responseType: typeof content.text
    })
    throw new Error('Failed to generate project brief: ' + error.message)
  }
}

/**
 * Export project brief as formatted markdown
 */
export function exportBriefAsMarkdown(brief: ProjectBrief): string {
  return `# ${brief.title}

## Executive Overview
${brief.overview}

## Goals & Objectives
${brief.goals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

## Key Requirements
${brief.requirements.map(r => `- ${r}`).join('\n')}

## Timeline
${brief.timeline.map(phase => `
### ${phase.phase}
**Duration:** ${phase.duration}

**Deliverables:**
${phase.deliverables.map(d => `- ${d}`).join('\n')}
`).join('\n')}

## Resources Needed

### People & Skills
${brief.resources.people.map(p => `- ${p}`).join('\n')}

### Tools & Platforms
${brief.resources.tools.map(t => `- ${t}`).join('\n')}

### Budget
${brief.resources.budget}

## Success Metrics
${brief.successMetrics.map((m, i) => `${i + 1}. ${m}`).join('\n')}

## Risks & Mitigation

${brief.risks.map(r => `**Risk:** ${r.risk}
**Mitigation:** ${r.mitigation}`).join('\n\n')}

## Immediate Next Steps

${brief.nextSteps.map((s, i) => {
  const priorityEmoji = s.priority === 'high' ? '🔴' : s.priority === 'medium' ? '🟡' : '🟢'
  const owner = s.owner ? ` (Owner: ${s.owner})` : ''
  return `${i + 1}. ${priorityEmoji} ${s.step}${owner}`
}).join('\n')}

---
*Generated by FifthDraft Idea Studio*
`
}

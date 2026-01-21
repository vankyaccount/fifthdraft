import Anthropic from '@anthropic-ai/sdk'
import { generateEmbedding } from './idea-evolution'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface BrainstormingStructure {
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
    step: string
    priority: 'high' | 'medium' | 'low'
  }>
  obstacles: string[]
  creativePrompts: string[]
}

/**
 * Generate brainstorming structure from transcript using Claude
 */
export async function generateBrainstormingStructure(transcript: string): Promise<BrainstormingStructure> {
  const prompt = `You are a creative thinking partner helping expand and organize brainstorming ideas.

TRANSCRIPT:
${transcript}

YOUR TASK:
Analyze this brainstorming session and extract:

1. **Core Ideas** (3-7 main concepts):
   - Title: Clear, concise name for the idea (max 8 words)
   - Description: 1-2 sentence explanation
   - Connections: How it relates to other ideas (list other idea titles)

2. **Expansion Opportunities** (2-3 per core idea):
   - For each core idea, suggest directions to explore further
   - New angles to consider
   - Related concepts to investigate

3. **Research Questions** (5-10 questions):
   - What needs investigation?
   - What information is missing?
   - What should be researched to move forward?

4. **Next Steps** (5-10 actionable items):
   - Concrete actions to move ideas forward
   - Mark priority as "high", "medium", or "low"
   - Be specific and actionable

5. **Potential Obstacles** (3-7 challenges):
   - What could go wrong?
   - What needs to be addressed?
   - What are the main challenges?

6. **Creative Prompts** (5-10 questions):
   - Questions to spark deeper thinking
   - Alternative perspectives to consider
   - "What if..." scenarios

IMPORTANT: Format your response as VALID JSON with this EXACT structure:
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
      "ideaTitle": "string (must match a core idea title)",
      "directions": ["string", "string", "string"]
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
}

Return ONLY the JSON, no additional text.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      temperature: 0.7, // Slightly creative
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Extract JSON from response (Claude sometimes wraps it in markdown)
    const text = content.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error('No JSON found in Claude response:', text)
      throw new Error('Failed to extract JSON from Claude response')
    }

    const structure = JSON.parse(jsonMatch[0]) as BrainstormingStructure

    // Validate structure
    if (!structure.coreIdeas || !Array.isArray(structure.coreIdeas)) {
      throw new Error('Invalid brainstorming structure: missing coreIdeas')
    }

    return structure
  } catch (error) {
    console.error('Error generating brainstorming structure:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      error: error
    })

    // Return a minimal valid structure as fallback
    return {
      coreIdeas: [{
        title: 'Main Concept',
        description: 'Unable to fully process brainstorming session. Please review the transcript.',
        connections: []
      }],
      expansionOpportunities: [],
      researchQuestions: ['What are the next steps?', 'What research is needed?'],
      nextSteps: [{
        step: 'Review transcript and identify key ideas',
        priority: 'high'
      }],
      obstacles: ['Processing error occurred'],
      creativePrompts: ['What could make this idea better?']
    }
  }
}

/**
 * Process a brainstorming transcript: generate structure + embedding
 */
export async function processBrainstormingNote(
  transcript: string
): Promise<{
  structure: BrainstormingStructure
  embedding: number[]
}> {
  // Generate brainstorming structure
  const structure = await generateBrainstormingStructure(transcript)

  // Generate embedding for idea evolution tracking
  const embedding = await generateEmbedding(transcript)

  return {
    structure,
    embedding
  }
}

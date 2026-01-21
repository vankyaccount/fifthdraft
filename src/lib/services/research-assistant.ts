/**
 * AI Research Assistant Service
 * Automatically researches ideas and adds findings to brainstorming notes
 */

import { tavilyClient } from '@/lib/api/tavily'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ResearchFinding {
  query: string
  answer: string
  sources: Array<{
    title: string
    url: string
    snippet: string
  }>
  researched_at: Date
}

export interface ResearchOutput {
  findings: ResearchFinding[]
  summary: string
  keyInsights: string[]
}

/**
 * Analyze brainstorming content and identify what needs research
 */
export async function identifyResearchNeeds(noteContent: string, researchQuestions: string[]): Promise<string[]> {
  const prompt = `Analyze this brainstorming session and the identified research questions. Generate 3-5 specific, searchable queries that would help develop these ideas.

BRAINSTORMING CONTENT:
${noteContent}

RESEARCH QUESTIONS IDENTIFIED:
${researchQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Generate specific search queries that would:
1. Validate assumptions
2. Find market data or competitor information
3. Discover best practices or case studies
4. Identify potential challenges or solutions

Return ONLY a JSON array of strings (search queries), no other text:
["query 1", "query 2", "query 3"]`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    const queries = JSON.parse(content.text)
    return queries.slice(0, 5) // Limit to 5 queries
  } catch (error) {
    console.error('Failed to parse research queries:', error)
    // Fallback: use research questions directly
    return researchQuestions.slice(0, 5)
  }
}

/**
 * Perform research using Tavily API
 */
export async function performResearch(queries: string[]): Promise<ResearchFinding[]> {
  const findings: ResearchFinding[] = []

  for (const query of queries) {
    try {
      const result = await tavilyClient.search(query, {
        searchDepth: 'basic',
        maxResults: 3
      })

      findings.push({
        query,
        answer: result.answer || 'No direct answer available',
        sources: result.results.map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.content.substring(0, 200) + '...'
        })),
        researched_at: new Date()
      })
    } catch (error) {
      console.error(`Research failed for query "${query}":`, error)
      // Continue with other queries
    }
  }

  return findings
}

/**
 * Synthesize research findings with AI
 */
export async function synthesizeFindings(
  noteContent: string,
  findings: ResearchFinding[]
): Promise<{ summary: string; keyInsights: string[] }> {
  const findingsText = findings.map(f => `
Query: ${f.query}
Answer: ${f.answer}
Sources: ${f.sources.map(s => `- ${s.title} (${s.url})`).join('\n')}
`).join('\n---\n')

  const prompt = `You are helping synthesize research findings for a brainstorming session.

ORIGINAL BRAINSTORMING:
${noteContent}

RESEARCH FINDINGS:
${findingsText}

Based on these findings:
1. Write a 2-3 sentence summary of what the research revealed
2. Extract 3-5 key insights that are actionable

Return ONLY valid JSON:
{
  "summary": "...",
  "keyInsights": ["insight 1", "insight 2", "insight 3"]
}`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    return JSON.parse(content.text)
  } catch (error) {
    console.error('Failed to parse synthesis:', error)
    return {
      summary: 'Research findings have been gathered successfully.',
      keyInsights: findings.map(f => f.answer).slice(0, 5)
    }
  }
}

/**
 * Main function: Run complete research assistant flow
 */
export async function runResearchAssistant(
  noteContent: string,
  researchQuestions: string[]
): Promise<ResearchOutput> {
  // Step 1: Identify what to research
  const queries = await identifyResearchNeeds(noteContent, researchQuestions)

  // Step 2: Perform research
  const findings = await performResearch(queries)

  // Step 3: Synthesize findings
  const { summary, keyInsights } = await synthesizeFindings(noteContent, findings)

  return {
    findings,
    summary,
    keyInsights
  }
}

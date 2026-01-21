/**
 * Idea Evolution Tracking Service
 * Uses embeddings to find related brainstorming sessions over time
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface RelatedNote {
  id: string
  title: string
  created_at: string
  similarity_score: number
  core_ideas: string[]
}

/**
 * Generate embedding for note content
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.substring(0, 8000), // Limit to 8k tokens
  })

  return response.data[0].embedding
}

/**
 * Create searchable text from brainstorming structure
 */
export function createSearchableText(note: {
  title: string
  content: string
  summary: string
  coreIdeas?: Array<{ title: string; description: string }>
}): string {
  const parts = [
    note.title,
    note.summary,
    note.content.substring(0, 2000), // First 2000 chars
  ]

  if (note.coreIdeas && note.coreIdeas.length > 0) {
    parts.push(note.coreIdeas.map(idea => `${idea.title}: ${idea.description}`).join(' '))
  }

  return parts.join(' ')
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    magnitudeA += a[i] * a[i]
    magnitudeB += b[i] * b[i]
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)
  if (magnitude === 0) return 0

  return dotProduct / magnitude
}

/**
 * Find related notes using pgvector similarity search
 * This would typically be done in the database, but here's the client-side version
 */
export async function findRelatedNotes(
  currentNoteId: string,
  currentEmbedding: number[],
  allNotes: Array<{
    id: string
    title: string
    created_at: string
    embedding: number[] | null
    structure: any
  }>,
  minSimilarity: number = 0.7,
  limit: number = 5
): Promise<RelatedNote[]> {
  const related: Array<{
    note: typeof allNotes[0]
    similarity: number
  }> = []

  for (const note of allNotes) {
    // Skip current note and notes without embeddings
    if (note.id === currentNoteId || !note.embedding) continue

    const similarity = cosineSimilarity(currentEmbedding, note.embedding)

    if (similarity >= minSimilarity) {
      related.push({ note, similarity })
    }
  }

  // Sort by similarity (highest first)
  related.sort((a, b) => b.similarity - a.similarity)

  // Return top N related notes
  return related.slice(0, limit).map(({ note, similarity }) => ({
    id: note.id,
    title: note.title,
    created_at: note.created_at,
    similarity_score: similarity,
    core_ideas: note.structure?.coreIdeas?.map((idea: any) => idea.title) || [],
  }))
}

/**
 * Generate evolution timeline
 */
export function generateEvolutionTimeline(notes: RelatedNote[]): Array<{
  date: string
  title: string
  ideas: string[]
  connection: string
}> {
  // Sort by date (oldest first)
  const sorted = [...notes].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return sorted.map((note, index) => ({
    date: new Date(note.created_at).toLocaleDateString(),
    title: note.title,
    ideas: note.core_ideas,
    connection: index === 0
      ? 'Initial exploration'
      : `${Math.round(note.similarity_score * 100)}% related to previous sessions`,
  }))
}

/**
 * Suggest merge opportunities
 */
export function suggestMergeOpportunities(
  currentNote: { id: string; title: string },
  relatedNotes: RelatedNote[]
): Array<{
  noteIds: string[]
  reason: string
  confidence: 'high' | 'medium'
}> {
  const suggestions: Array<{
    noteIds: string[]
    reason: string
    confidence: 'high' | 'medium'
  }> = []

  // High similarity = strong merge candidate
  const highSimilarity = relatedNotes.filter(n => n.similarity_score >= 0.85)
  if (highSimilarity.length > 0) {
    highSimilarity.forEach(note => {
      suggestions.push({
        noteIds: [currentNote.id, note.id],
        reason: `Very similar themes and ideas (${Math.round(note.similarity_score * 100)}% match)`,
        confidence: 'high',
      })
    })
  }

  // Same core ideas = merge candidate
  const sharedIdeas = relatedNotes.filter(n => {
    const overlap = n.core_ideas.length > 0 &&
      n.core_ideas.some(idea =>
        currentNote.title.toLowerCase().includes(idea.toLowerCase())
      )
    return overlap && n.similarity_score >= 0.75
  })

  if (sharedIdeas.length > 0) {
    sharedIdeas.forEach(note => {
      if (!suggestions.some(s => s.noteIds.includes(note.id))) {
        suggestions.push({
          noteIds: [currentNote.id, note.id],
          reason: `Shared core concepts: ${note.core_ideas.slice(0, 2).join(', ')}`,
          confidence: 'medium',
        })
      }
    })
  }

  return suggestions
}

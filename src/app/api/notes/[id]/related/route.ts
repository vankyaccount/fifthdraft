import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/queries'
import { findRelatedNotes, generateEvolutionTimeline, suggestMergeOpportunities } from '@/lib/services/idea-evolution'

/**
 * GET /api/notes/[id]/related
 * Find related brainstorming notes using embeddings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const noteId = id
    const { searchParams } = new URL(request.url)
    const includeTimeline = searchParams.get('timeline') === 'true'
    const includeMerge = searchParams.get('merge') === 'true'

    // Get current user
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user's subscription tier (idea evolution is Pro only)
    const profile = await db.profiles.findById(user.id)

    if (profile?.subscription_tier !== 'pro') {
      return NextResponse.json(
        { error: 'Idea Evolution Tracking is a Pro feature. Upgrade to access.' },
        { status: 403 }
      )
    }

    // Get the current note with embedding
    const currentNote = await db.notes.findByIdAndUserId(noteId, user.id)

    if (!currentNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    if (!currentNote.embedding) {
      return NextResponse.json(
        { error: 'Note embedding not yet generated. Please try again in a moment.' },
        { status: 400 }
      )
    }

    // Get all other brainstorming notes by this user
    const allNotes = await db.notes.findByUserId(user.id, 100)

    // Filter to brainstorming notes and exclude current note
    const brainstormingNotes = allNotes.filter(
      (n) => n.mode === 'brainstorming' && n.id !== noteId
    )

    // Find related notes
    const relatedNotes = await findRelatedNotes(
      noteId,
      currentNote.embedding!,
      brainstormingNotes as any || [],
      0.7, // minimum similarity
      5 // max results
    )

    // Generate timeline if requested
    let timeline = null
    if (includeTimeline && relatedNotes.length > 0) {
      timeline = generateEvolutionTimeline([
        {
          id: currentNote.id,
          title: currentNote.title,
          created_at: currentNote.created_at,
          similarity_score: 1.0,
          core_ideas: (currentNote.structure as any)?.coreIdeas?.map((i: any) => i.title) || [],
        },
        ...relatedNotes,
      ])
    }

    // Suggest merge opportunities if requested
    let mergeOpportunities = null
    if (includeMerge && relatedNotes.length > 0) {
      mergeOpportunities = suggestMergeOpportunities(
        { id: currentNote.id, title: currentNote.title },
        relatedNotes
      )
    }

    return NextResponse.json({
      success: true,
      relatedNotes,
      timeline,
      mergeOpportunities,
    })
  } catch (error: any) {
    console.error('Related notes error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

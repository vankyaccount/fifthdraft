import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user's subscription tier (idea evolution is Pro only)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'pro') {
      return NextResponse.json(
        { error: 'Idea Evolution Tracking is a Pro feature. Upgrade to access.' },
        { status: 403 }
      )
    }

    // Get the current note with embedding
    const { data: currentNote, error: currentNoteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (currentNoteError || !currentNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    if (!currentNote.embedding) {
      return NextResponse.json(
        { error: 'Note embedding not yet generated. Please try again in a moment.' },
        { status: 400 }
      )
    }

    // Get all other brainstorming notes by this user
    const { data: allNotes, error: notesError } = await supabase
      .from('notes')
      .select('id, title, created_at, embedding, structure, mode')
      .eq('user_id', user.id)
      .eq('mode', 'brainstorming')
      .neq('id', noteId)

    if (notesError) {
      throw new Error(`Failed to fetch notes: ${notesError.message}`)
    }

    // Find related notes
    const relatedNotes = await findRelatedNotes(
      noteId,
      currentNote.embedding,
      allNotes || [],
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
          core_ideas: currentNote.structure?.coreIdeas?.map((i: any) => i.title) || [],
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

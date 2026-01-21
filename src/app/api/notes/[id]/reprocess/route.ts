import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processBrainstormingNote } from '@/lib/services/brainstorming-processor'

/**
 * POST /api/notes/[id]/reprocess
 * Reprocess a brainstorming note with the AI to regenerate structure
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const noteId = id
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Check if it's a brainstorming note
    if (note.mode !== 'brainstorming') {
      return NextResponse.json(
        { error: 'Reprocessing is only available for Idea Studio notes' },
        { status: 400 }
      )
    }

    // Reprocess using the transcript content
    const transcript = note.content
    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note has no transcript content to process' },
        { status: 400 }
      )
    }

    console.log('Reprocessing note:', noteId, 'Content length:', transcript.length)

    // Process with the fixed brainstorming processor
    const { structure, embedding } = await processBrainstormingNote(transcript)

    console.log('Reprocessing complete:', {
      coreIdeasCount: structure.coreIdeas?.length || 0,
      expansionOpportunitiesCount: structure.expansionOpportunities?.length || 0,
      researchQuestionsCount: structure.researchQuestions?.length || 0,
      nextStepsCount: structure.nextSteps?.length || 0,
      obstaclesCount: structure.obstacles?.length || 0,
      creativePromptsCount: structure.creativePrompts?.length || 0,
    })

    // Update note with new structure
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        structure: {
          summary: structure.coreIdeas[0]?.description || transcript.substring(0, 300),
          coreIdeas: structure.coreIdeas,
          expansionOpportunities: structure.expansionOpportunities,
          researchQuestions: structure.researchQuestions,
          nextSteps: structure.nextSteps,
          obstacles: structure.obstacles,
          creativePrompts: structure.creativePrompts,
        },
        embedding: embedding,
      })
      .eq('id', noteId)

    if (updateError) {
      console.error('Failed to update note:', updateError)
      return NextResponse.json(
        { error: 'Failed to save reprocessed data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      structure: structure,
    })
  } catch (error: any) {
    console.error('Reprocess error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

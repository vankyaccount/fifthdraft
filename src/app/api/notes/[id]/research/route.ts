import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runResearchAssistant } from '@/lib/services/research-assistant'

/**
 * POST /api/notes/[id]/research
 * Trigger AI Research Assistant for a brainstorming note
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

    // Check user's subscription tier (research assistant is Pro only)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'pro') {
      return NextResponse.json(
        { error: 'Research Assistant is a Pro feature. Upgrade to access.' },
        { status: 403 }
      )
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
        { error: 'Research Assistant is only available for Idea Studio notes' },
        { status: 400 }
      )
    }

    // Extract research questions from note structure
    const structure = note.structure || {}
    const researchQuestions = structure.researchQuestions || []

    if (researchQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No research questions identified in this note' },
        { status: 400 }
      )
    }

    // Run research assistant
    const researchOutput = await runResearchAssistant(
      note.content,
      researchQuestions
    )

    // Update note with research data
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        research_data: {
          findings: researchOutput.findings,
          summary: researchOutput.summary,
          keyInsights: researchOutput.keyInsights,
          researched_at: new Date().toISOString(),
        },
      })
      .eq('id', noteId)

    if (updateError) {
      console.error('Failed to update note with research data:', updateError)
      return NextResponse.json(
        { error: 'Failed to save research data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      research: researchOutput,
    })
  } catch (error: any) {
    console.error('Research assistant error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

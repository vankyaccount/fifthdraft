import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/queries'
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

    // Get current user
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user's subscription tier (research assistant is Pro only)
    const profile = await db.profiles.findById(user.id)

    if (profile?.subscription_tier !== 'pro') {
      return NextResponse.json(
        { error: 'Research Assistant is a Pro feature. Upgrade to access.' },
        { status: 403 }
      )
    }

    // Get the note
    const note = await db.notes.findByIdAndUserId(noteId, user.id)

    if (!note) {
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
    const structure = (note.structure as any) || {}
    const researchQuestions = Array.isArray(structure.researchQuestions) ? structure.researchQuestions : []

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
    const updatedNote = await db.notes.update(noteId, {
      research_data: {
        findings: researchOutput.findings,
        summary: researchOutput.summary,
        keyInsights: researchOutput.keyInsights,
        researched_at: new Date().toISOString(),
      },
    })

    if (!updatedNote) {
      console.error('Failed to update note with research data')
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

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateProjectBrief, exportBriefAsMarkdown } from '@/lib/services/project-brief-generator'

/**
 * POST /api/notes/[id]/project-brief
 * Generate a structured project brief from a brainstorming note
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

    // Check user's subscription tier (project brief is Pro only)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'pro') {
      return NextResponse.json(
        { error: 'Project Brief Generator is a Pro feature. Upgrade to access.' },
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
        { error: 'Project Brief Generator is only available for Idea Studio notes' },
        { status: 400 }
      )
    }

    // Extract data from note structure
    const structure = note.structure || {}
    const coreIdeas = structure.coreIdeas || []
    const nextSteps = structure.nextSteps || []

    // Parse request body
    const body = await request.json().catch(() => null)
    const regenerate = body?.regenerate === true

    // Check if project brief already exists (unless regenerate is requested)
    let brief = note.project_brief

    if (!brief || regenerate) {
      console.log('[Project Brief] Generating new project brief...')

      // Generate project brief using Claude
      brief = await generateProjectBrief(
        note.title,
        note.content,
        coreIdeas,
        nextSteps
      )

      // Save to database for future use
      const { error: updateError } = await supabase
        .from('notes')
        .update({ project_brief: brief })
        .eq('id', noteId)

      if (updateError) {
        console.error('Failed to cache project brief:', updateError)
        // Continue anyway - caching failure shouldn't break the feature
      } else {
        console.log('[Project Brief] Cached successfully')
      }
    } else {
      console.log('[Project Brief] Using cached project brief')
    }

    // Generate markdown export
    const markdown = exportBriefAsMarkdown(brief)

    // Determine export format
    const format = body?.format || 'txt'

    if (format === 'markdown' || format === 'txt') {
      // Generate safe filename from note title
      const safeFilename = note.title.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '-').toLowerCase()
      const extension = format === 'markdown' ? 'md' : 'txt'

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${safeFilename}-project-brief.${extension}"`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      brief,
      markdown,
      cached: !regenerate && note.project_brief != null,
    })
  } catch (error: any) {
    const { id } = await params
    console.error('Project brief generation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      noteId: id
    })
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

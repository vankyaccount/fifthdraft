import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMindMap, generateHierarchicalMindMap, getMermaidImageUrl } from '@/lib/services/mindmap-generator'

/**
 * GET /api/notes/[id]/mindmap
 * Generate mind map visualization for a brainstorming note
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const noteId = id
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'mermaid' // 'mermaid' or 'hierarchical'
    const output = searchParams.get('output') || 'syntax' // 'syntax' or 'image'

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user's subscription tier (mindmap is Pro only)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'pro') {
      return NextResponse.json(
        { error: 'Mind Map Generator is a Pro feature. Upgrade to access.' },
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
        { error: 'Mind Map Generator is only available for Idea Studio notes' },
        { status: 400 }
      )
    }

    // Extract data from note structure
    const structure = note.structure || {}
    const coreIdeas = structure.coreIdeas || []
    const expansionOpportunities = structure.expansionOpportunities || []
    const nextSteps = structure.nextSteps || []
    const obstacles = structure.obstacles || []

    // Generate mind map
    let mermaidSyntax: string

    if (format === 'hierarchical') {
      mermaidSyntax = generateHierarchicalMindMap(
        note.title,
        coreIdeas,
        nextSteps,
        obstacles
      )
    } else {
      mermaidSyntax = generateMindMap(
        note.title,
        coreIdeas,
        expansionOpportunities
      )
    }

    // Return image URL or syntax
    if (output === 'image') {
      const imageUrl = getMermaidImageUrl(mermaidSyntax)
      return NextResponse.json({
        success: true,
        imageUrl,
        syntax: mermaidSyntax,
      })
    }

    // Return Mermaid syntax
    return NextResponse.json({
      success: true,
      syntax: mermaidSyntax,
      format,
    })
  } catch (error: any) {
    console.error('Mind map generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

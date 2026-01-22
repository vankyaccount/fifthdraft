import { withAuth, type AuthenticatedRequest } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { getBrainstormingPrompt, getMeetingPrompt, type BrainstormingOutcome, type MeetingOutcome } from '@/lib/ai/brainstorming-prompts'
import { processBrainstormingNote } from '@/lib/services/brainstorming-processor'
import { db } from '@/lib/db/queries'
import { LocalStorage } from '@/lib/storage/local'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  return withAuth(req, async (authReq: AuthenticatedRequest) => {
    try {
      const { recordingId } = await authReq.json()

      // Get recording
      const recording = await db.recordings.findById(recordingId)

      if (!recording) {
        return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
      }

      // Verify user owns this recording
      if (recording.user_id !== authReq.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      // CRITICAL: Server-side validation - fetch user profile and check tier/quota
      const profile = await db.profiles.findById(authReq.user.id)

      if (!profile) {
        console.error('Failed to fetch user profile')
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
      }

    const tier = profile.subscription_tier as 'free' | 'pro' | 'team' | 'enterprise'

    // Detect if this is a file upload (vs browser recording)
    const isFileUpload = recording.storage_path.match(/\.(mp3|wav|m4a|ogg|flac|aac)$/i)

    // CRITICAL: Block file uploads for free tier
    if (tier === 'free' && isFileUpload) {
      console.error('Free tier attempted file upload:', {
        recordingId: recording.id,
        userId: recording.user_id,
        storagePath: recording.storage_path
      })

      // Mark recording as failed
      await db.recordings.updateStatus(recordingId, 'failed', 0)

      return NextResponse.json(
        { error: 'File uploads require Pro tier or higher. Please upgrade your subscription.' },
        { status: 403 }
      )
    }

    // Tier-based file size limits
    const tierLimits: Record<string, number> = {
      free: 30 * 1024 * 1024,      // 30MB (recording only)
      pro: 120 * 1024 * 1024,      // 120MB
      team: 240 * 1024 * 1024,     // 240MB
      enterprise: 480 * 1024 * 1024 // 480MB
    }

    // Validate file size against tier limit
    if (recording.file_size && recording.file_size > tierLimits[tier]) {
      const maxMB = Math.round(tierLimits[tier] / (1024 * 1024))
      const actualMB = Math.round(recording.file_size / (1024 * 1024))

      console.error('File size exceeds tier limit:', {
        tier,
        maxMB,
        actualMB,
        recordingId: recording.id,
        userId: recording.user_id
      })

      // Mark recording as failed
      await db.recordings.updateStatus(recordingId, 'failed', 0)

      return NextResponse.json(
        {
          error: `File size (${actualMB}MB) exceeds ${tier} tier limit of ${maxMB}MB. Please upgrade or use a smaller file.`,
          maxSize: maxMB,
          actualSize: actualMB
        },
        { status: 413 } // 413 Payload Too Large
      )
    }

    // CRITICAL: Validate monthly quota BEFORE processing
    if (profile.minutes_used >= profile.minutes_quota) {
      console.error('User exceeded monthly quota:', {
        userId: recording.user_id,
        tier,
        minutesUsed: profile.minutes_used,
        minutesQuota: profile.minutes_quota
      })

      // Mark recording as failed
      await db.recordings.updateStatus(recordingId, 'failed', 0)

      return NextResponse.json(
        {
          error: 'Monthly quota exceeded. Please upgrade your plan or wait for your next billing cycle.',
          minutesUsed: profile.minutes_used,
          minutesQuota: profile.minutes_quota
        },
        { status: 429 } // 429 Too Many Requests
      )
    }

    // Update status to processing
    await db.recordings.updateStatus(recordingId, 'processing', 10)

    // Download audio from local storage
    const { data: audioData, error: downloadError } = await LocalStorage.download(recording.storage_path)

    if (downloadError || !audioData) {
      throw new Error('Failed to download audio')
    }

    // Update progress
    await db.recordings.updateProgress(recordingId, 30)

    // Transcribe with Whisper
    const audioFile = new File([new Uint8Array(audioData)], 'recording.webm', { type: 'audio/webm' })
    console.log('Starting Whisper transcription for recording:', recordingId)
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
    })

    console.log('Whisper transcription completed. Text length:', transcription.text.length)
    console.log('Whisper raw text preview:', transcription.text.substring(0, 200))

    // Update progress
    await db.recordings.updateProgress(recordingId, 50)

    // User preferences already fetched during validation
    const userSettings = profile?.settings as any || {}

    console.log('User tier:', tier)
    console.log('User settings:', JSON.stringify(userSettings, null, 2))

    // Use Claude Haiku 4.5 for all tiers (cheapest option: $1/MTok input, $5/MTok output)
    // This significantly reduces costs while maintaining good quality for transcription cleanup
    const model = 'claude-haiku-4-5-20251001'

    // Clean transcript with Claude
    let cleanedText = transcription.text
    console.log('Initial cleanedText (from Whisper):', cleanedText.substring(0, 200))

    // Always clean transcript, but use cheaper model for free tier
    try {
      const writingStyle = userSettings.writing_style || { tone: 'professional', formality: 'balanced', verbosity: 'balanced' }
      const prompt = `Clean this transcript by removing filler words (um, uh, like), fixing grammar, and organizing into clear paragraphs.

Writing style preferences:
- Tone: ${writingStyle.tone || 'professional'}
- Formality: ${writingStyle.formality || 'balanced'}
- Verbosity: ${writingStyle.verbosity || 'balanced'}

Return ONLY the cleaned transcript text, nothing else.

Transcript:
${transcription.text}`

      const message = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      })

      if (message.content[0].type === 'text') {
        cleanedText = message.content[0].text
      }
    } catch (error) {
      console.error('Claude cleanup error:', error)
      // Fall back to raw transcript if cleanup fails
      cleanedText = transcription.text
    }

    console.log('Cleaned text length:', cleanedText.length)
    console.log('Cleaned text preview:', cleanedText.substring(0, 200))

    // Update progress
    await db.recordings.updateProgress(recordingId, 70)

    // Save transcription
    await db.transcriptions.create({
      recording_id: recordingId,
      raw_text: transcription.text,
      raw_segments: (transcription.segments || []) as unknown as Record<string, unknown>[],
      cleaned_text: cleanedText,
      language: transcription.language,
      word_count: cleanedText.split(' ').length,
    })

    // Extract structured information based on mode
    let outcomes: any
    let noteEmbedding: number[] | null = null
    const isBrainstorming = recording.mode === 'brainstorming'

    console.log('Starting structured extraction. Tier:', tier, 'Mode:', recording.mode)

    if (isBrainstorming) {
      // Use new brainstorming processor for Idea Studio mode
      console.log('Using new brainstorming processor for Idea Studio...')

      try {
        const { structure, embedding } = await processBrainstormingNote(cleanedText)

        // Convert brainstorming structure to outcomes format
        outcomes = {
          summary: structure.coreIdeas[0]?.description || cleanedText.substring(0, 300),
          coreIdeas: structure.coreIdeas,
          expansionOpportunities: structure.expansionOpportunities,
          researchQuestions: structure.researchQuestions,
          nextSteps: structure.nextSteps,
          obstacles: structure.obstacles,
          creativePrompts: structure.creativePrompts
        }

        noteEmbedding = embedding

        console.log('Successfully processed brainstorming with new processor:', {
          coreIdeasCount: outcomes.coreIdeas?.length || 0,
          expansionOpportunitiesCount: outcomes.expansionOpportunities?.length || 0,
          researchQuestionsCount: outcomes.researchQuestions?.length || 0,
          nextStepsCount: outcomes.nextSteps?.length || 0,
          obstaclesCount: outcomes.obstacles?.length || 0,
          creativePromptsCount: outcomes.creativePrompts?.length || 0,
          hasEmbedding: !!noteEmbedding
        })
      } catch (error) {
        console.error('New brainstorming processor failed, falling back to old method:', error)

        // Fallback to old method if new processor fails
        outcomes = {
          summary: cleanedText.substring(0, 300),
          coreIdeas: [],
          expansionOpportunities: [],
          researchQuestions: [],
          nextSteps: [],
          obstacles: [],
          creativePrompts: []
        }
      }
    } else {
      // Meeting mode - use existing logic
      console.log('Running structured extraction for meeting mode...')

      const structurePrompt = getMeetingPrompt(cleanedText, recording.mode)

      outcomes = {
        summary: cleanedText.substring(0, 300),
        keyPoints: [],
        decisions: [],
        actionItems: [],
        questions: []
      }

      try {
        console.log('Calling Claude API for meeting structured extraction with model:', model)
        const outcomeMessage = await anthropic.messages.create({
          model,
          max_tokens: 3000,
          messages: [{ role: 'user', content: structurePrompt }],
        })

        console.log('Claude API response received. Content type:', outcomeMessage.content[0].type)

        const outcomeText = outcomeMessage.content[0].type === 'text' ? outcomeMessage.content[0].text : '{}'
        console.log('Raw Claude response:', outcomeText.substring(0, 500))

        // Remove markdown code blocks if present
        const cleanJson = outcomeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        console.log('Cleaned JSON for parsing:', cleanJson.substring(0, 500))

        outcomes = JSON.parse(cleanJson)

        console.log('Successfully parsed meeting outcomes:', {
          summaryLength: outcomes.summary?.length || 0,
          keyPointsCount: outcomes.keyPoints?.length || 0,
          decisionsCount: outcomes.decisions?.length || 0,
          actionItemsCount: outcomes.actionItems?.length || 0,
          questionsCount: outcomes.questions?.length || 0
        })
      } catch (e) {
        console.error('Failed to parse meeting outcomes:', e)
        console.error('Error details:', (e as Error).message)
      }
    }

    console.log('Final outcomes object:', JSON.stringify(outcomes, null, 2))

    // Update progress
    await db.recordings.updateProgress(recordingId, 85)

    // Generate smart title using Claude
    let smartTitle = `${recording.mode === 'meeting' ? 'Meeting' : 'Brainstorm'} - ${new Date().toLocaleDateString()}`

    try {
      console.log('Generating smart title with Claude...')
      const titlePrompt = `Based on this ${recording.mode} transcript, generate a concise, descriptive title (max 60 characters).
The title should capture the main topic or purpose of the ${recording.mode}.

Examples:
- "Q1 Budget Review Meeting"
- "Product Launch Strategy Discussion"
- "Customer Feedback Analysis"
- "Team Standup - Sprint 23"

Return ONLY the title text, nothing else.

Transcript:
${cleanedText.substring(0, 500)}`

      const titleMessage = await anthropic.messages.create({
        model,
        max_tokens: 100,
        messages: [{ role: 'user', content: titlePrompt }],
      })

      if (titleMessage.content[0].type === 'text') {
        const generatedTitle = titleMessage.content[0].text.trim().replace(/^["']|["']$/g, '')
        if (generatedTitle && generatedTitle.length > 0 && generatedTitle.length <= 80) {
          smartTitle = generatedTitle
          console.log('Generated smart title:', smartTitle)
        }
      }
    } catch (e) {
      console.error('Failed to generate smart title:', (e as Error).message)
      // Continue with default title
    }

    // Create note with structured data
    console.log('Creating note with the following data:')
    console.log('- title:', smartTitle)
    console.log('- content length:', cleanedText.length)
    console.log('- summary:', outcomes.summary?.substring(0, 100) || 'NONE')

    // Build structure based on mode
    let noteStructure: any
    if (isBrainstorming) {
      console.log('- coreIdeas count:', outcomes.coreIdeas?.length || 0)
      console.log('- expansionOpportunities count:', outcomes.expansionOpportunities?.length || 0)
      console.log('- researchQuestions count:', outcomes.researchQuestions?.length || 0)
      console.log('- nextSteps count:', outcomes.nextSteps?.length || 0)

      noteStructure = {
        summary: outcomes.summary || cleanedText.substring(0, 300),
        fullTranscript: cleanedText,
        coreIdeas: outcomes.coreIdeas || [],
        expansionOpportunities: outcomes.expansionOpportunities || [],
        researchQuestions: outcomes.researchQuestions || [],
        obstacles: outcomes.obstacles || [],
        creativePrompts: outcomes.creativePrompts || []
        // nextSteps removed from structure to avoid duplication - they're stored in the action_items table
      }
    } else {
      console.log('- keyPoints count:', outcomes.keyPoints?.length || 0)
      console.log('- actionItems count:', outcomes.actionItems?.length || 0)
      console.log('- decisions count:', outcomes.decisions?.length || 0)

      noteStructure = {
        summary: outcomes.summary || cleanedText.substring(0, 300),
        keyPoints: outcomes.keyPoints || [],
        fullTranscript: cleanedText,
        decisions: outcomes.decisions || [],
        questions: outcomes.questions || []
        // actionItems removed from structure to avoid duplication - they're stored in the action_items table
      }
    }

    const noteData = {
      recording_id: recordingId,
      user_id: recording.user_id,
      title: smartTitle,
      content: cleanedText,
      summary: outcomes.summary || cleanedText.substring(0, 300),
      mode: recording.mode,
      structure: noteStructure,
    }

    console.log('Note data to insert:', JSON.stringify({
      ...noteData,
      content: noteData.content.substring(0, 100) + '...',
      structure: {
        ...noteData.structure,
        fullTranscript: noteData.structure.fullTranscript.substring(0, 100) + '...'
      }
    }, null, 2))

    const note = await db.notes.create(noteData)

    if (!note) {
      console.error('Error creating note')
      throw new Error('Failed to create note')
    }

    console.log('Note created successfully with ID:', note.id)

    // Save embedding for brainstorming notes (for idea evolution tracking)
    if (isBrainstorming && noteEmbedding) {
      try {
        console.log('Saving embedding for idea evolution tracking...')
        await db.notes.update(note.id, { embedding: noteEmbedding })
        console.log('Embedding saved successfully for note:', note.id)
      } catch (error) {
        console.error('Error saving embedding:', error)
        // Don't fail the entire process if embedding save fails
      }
    }

    // Create action items (different handling for brainstorming vs meeting mode)
    // IMPORTANT: Action items should contain detailed, actionable information with full context
    // The AI prompts have been enhanced to capture specific details, requirements, and snippets
    // from the conversation to make each action item comprehensive and self-contained
    const itemsToCreate = isBrainstorming ? outcomes.nextSteps : outcomes.actionItems

    if (itemsToCreate && itemsToCreate.length > 0) {
      console.log(`Creating ${isBrainstorming ? 'next steps' : 'action items'}. Count:`, itemsToCreate.length)
      console.log('Items data:', JSON.stringify(itemsToCreate, null, 2))

      const actionItemsToInsert = itemsToCreate.map((item: any) => ({
        note_id: note.id,
        recording_id: recordingId,
        user_id: recording.user_id,
        title: isBrainstorming ? (item.title || item.step) : (item.title || item.task),
        description: item.description || '', // Description contains detailed context from the conversation
        type: 'task',
        assignee_name: item.assignee || null,
        due_date: item.dueDate || null,
        priority: item.priority || 'medium',
        status: 'pending',
      }))

      console.log('Inserting action items:', JSON.stringify(actionItemsToInsert, null, 2))

      try {
        await db.actionItems.createMany(actionItemsToInsert)
        console.log(`${isBrainstorming ? 'Next steps' : 'Action items'} created successfully`)
      } catch (error) {
        console.error('Error creating action items:', error)
      }
    } else {
      console.log(`No ${isBrainstorming ? 'next steps' : 'action items'} to create`)
    }

    // Log usage
    await db.usageLogs.create({
      user_id: recording.user_id,
      resource_type: 'transcription',
      units_consumed: recording.duration || 1,
      recording_id: recordingId,
    })

    // Update user's minutes_used
    const minutesToAdd = Math.ceil((recording.duration || 0) / 60) // Convert seconds to minutes

    await db.profiles.incrementMinutesUsed(recording.user_id, minutesToAdd)

    console.log(`Updated minutes_used for user ${recording.user_id}: +${minutesToAdd} minutes`)

    // Mark as completed
    await db.recordings.updateStatus(recordingId, 'completed', 100)

    return NextResponse.json({ success: true, noteId: note.id })
    } catch (error: any) {
      console.error('Transcription error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  })
}

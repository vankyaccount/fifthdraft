import { getCurrentUser } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EditableTitle from '@/components/notes/EditableTitle'
import ActionItemsTable from '@/components/notes/ActionItemsTable'
import ExportMenu from '@/components/notes/ExportMenu'
import IdeaStudioActions from '@/components/notes/IdeaStudioActions'
import ProjectBriefDisplay from '@/components/notes/ProjectBriefDisplay'
import TagInput from '@/components/notes/TagInput'
import FolderSelector from '@/components/notes/FolderSelector'
import { Sparkles, Lightbulb, ArrowRight, AlertCircle, HelpCircle, TrendingUp } from 'lucide-react'
import { db } from '@/lib/db/queries'

// Updated homepage description to emphasize AI-powered brainstorming and professional tools.

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch note
  const note = await db.notes.findByIdAndUserId(id, user.id)

  if (!note) {
    notFound()
  }

  // Fetch recording if exists
  const recording = note.recording_id ? await db.recordings.findById(note.recording_id) : null

  // Fetch action items
  const allActionItems = await db.actionItems.findByNoteId(id)

  const structure = note.structure as any || {}
  const actionItems = allActionItems || []
  const isIdeaStudio = note.mode === 'brainstorming'

  // Create note object with relations for compatibility
  const noteDisplay: any = {
    ...note,
    recording,
    action_items: actionItems
  }

  return (
    <div className={`min-h-screen ${isIdeaStudio ? 'bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50' : 'bg-gray-50'}`}>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
                FifthDraft
              </Link>
              {isIdeaStudio && (
                <>
                  <span className="text-neutral-400">•</span>
                  <span className="flex items-center space-x-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Idea Studio</span>
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Note Header */}
        <div className={`rounded-lg shadow-sm p-6 mb-6 ${
          isIdeaStudio ? 'bg-white/80 backdrop-blur-sm border-2 border-purple-200' : 'bg-white'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2">
                <EditableTitle noteId={note.id} initialTitle={note.title} />
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className="capitalize">{note.mode} mode</span>
                <span>•</span>
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
                {recording && (
                  <>
                    <span>•</span>
                    <span>{recording.duration || 0} minutes</span>
                  </>
                )}
              </div>
              <TagInput noteId={note.id} initialTags={note.tags || []} />
            </div>
            <div className="flex space-x-2">
              <FolderSelector noteId={note.id} currentFolderId={note.folder_id} />
              <ExportMenu note={noteDisplay} />
            </div>
          </div>
        </div>

        {/* Idea Studio Actions - Pro Features */}
        {isIdeaStudio && (
          <IdeaStudioActions
            noteId={note.id}
            hasResearch={!!note.research_data}
            hasProjectBrief={!!note.project_brief}
          />
        )}

        {/* Idea Studio Core Ideas */}
        {isIdeaStudio && structure.coreIdeas && structure.coreIdeas.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 border-2 border-purple-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-purple-900">
              <Lightbulb className="w-6 h-6 mr-2 text-purple-600" />
              Core Ideas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {structure.coreIdeas.map((idea: any, idx: number) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                  <h3 className="font-semibold text-purple-900 mb-2">{idea.title}</h3>
                  <p className="text-sm text-gray-700 mb-3">{idea.description}</p>
                  {idea.connections && idea.connections.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {idea.connections.map((conn: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          → {conn}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expansion Opportunities */}
        {isIdeaStudio && structure.expansionOpportunities && structure.expansionOpportunities.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 border-2 border-indigo-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-900">
              <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
              Expansion Opportunities
            </h2>
            <div className="space-y-4">
              {structure.expansionOpportunities.map((opp: any, idx: number) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <h3 className="font-semibold text-indigo-900 mb-2">{opp.ideaTitle}</h3>
                  <ul className="space-y-2">
                    {opp.directions.map((dir: string, i: number) => (
                      <li key={i} className="flex items-start text-sm text-gray-700">
                        <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-indigo-600 flex-shrink-0" />
                        <span>{dir}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Questions */}
        {isIdeaStudio && structure.researchQuestions && structure.researchQuestions.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-900">
              <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
              Research Questions
            </h2>
            <ul className="space-y-3">
              {structure.researchQuestions.map((question: string, idx: number) => (
                <li key={idx} className="flex items-start p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold mr-3 mt-0.5">?</span>
                  <span className="text-gray-700">{question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Research Results */}
        {isIdeaStudio && note.research_data && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 border-2 border-green-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-green-900">
              <Lightbulb className="w-6 h-6 mr-2 text-green-600" />
              AI Research Findings
            </h2>

            {(note.research_data as any).summary && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-gray-700">{(note.research_data as any).summary}</p>
              </div>
            )}

            {(note.research_data as any).keyInsights && (note.research_data as any).keyInsights.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-green-900 mb-2">Key Insights:</h3>
                <ul className="space-y-2">
                  {(note.research_data as any).keyInsights.map((insight: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">•</span>
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(note.research_data as any).findings && (note.research_data as any).findings.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-900 mb-3">Research Details:</h3>
                {(note.research_data as any).findings.map((finding: any, i: number) => (
                  <div key={i} className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                    <h4 className="font-medium text-gray-900 mb-2">{finding.query}</h4>
                    <p className="text-gray-700 mb-2 text-sm">{finding.answer}</p>
                    {finding.sources && finding.sources.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Sources:</p>
                        <ul className="space-y-1">
                          {finding.sources.map((source: any, j: number) => (
                            <li key={j}>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:text-green-800 hover:underline"
                              >
                                {source.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Project Brief */}
        {isIdeaStudio && note.project_brief && (
          <ProjectBriefDisplay brief={note.project_brief as any} noteTitle={note.title} />
        )}

        {/* Obstacles */}
        {isIdeaStudio && structure.obstacles && structure.obstacles.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 border-2 border-amber-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-900">
              <AlertCircle className="w-6 h-6 mr-2 text-amber-600" />
              Potential Obstacles
            </h2>
            <ul className="space-y-2">
              {structure.obstacles.map((obstacle: string, idx: number) => (
                <li key={idx} className="flex items-start p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <span className="text-amber-600 font-bold mr-3">⚠</span>
                  <span className="text-gray-700">{obstacle}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Creative Prompts */}
        {isIdeaStudio && structure.creativePrompts && structure.creativePrompts.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 border-2 border-pink-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-pink-900">
              <Sparkles className="w-6 h-6 mr-2 text-pink-600" />
              Creative Prompts
            </h2>
            <ul className="space-y-3">
              {structure.creativePrompts.map((prompt: string, idx: number) => (
                <li key={idx} className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <span className="text-gray-700 italic">💭 {prompt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items Table - for both meeting and brainstorming modes */}
        {actionItems && actionItems.length > 0 && (
          <ActionItemsTable
            noteId={note.id}
            initialItems={actionItems as any}
            variant={isIdeaStudio ? 'brainstorming' : 'meeting'}
          />
        )}

        {/* Decisions */}
        {structure.decisions && structure.decisions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Decisions Made</h2>
            <ul className="space-y-2">
              {structure.decisions.map((decision: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-indigo-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions / Follow-ups */}
        {structure.questions && structure.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Open Questions & Follow-ups</h2>
            <ul className="space-y-2">
              {structure.questions.map((question: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-600 font-bold mt-1">?</span>
                  <span className="text-gray-700">{question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Transcript */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Transcript</h2>
          <div className="prose max-w-none">
            {note.content && note.content.trim() ? (
              note.content.split('\n').map((paragraph: string, idx: number) => (
                paragraph.trim() && (
                  <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                )
              ))
            ) : (
              <p className="text-gray-500 italic">No transcript available</p>
            )}
          </div>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {note.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

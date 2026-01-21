'use client'

import { useState } from 'react'
import { Lightbulb, FileText, Network, Sparkles } from 'lucide-react'

interface IdeaStudioActionsProps {
  noteId: string
  hasResearch: boolean
  hasProjectBrief?: boolean
}

export default function IdeaStudioActions({ noteId, hasResearch, hasProjectBrief = false }: IdeaStudioActionsProps) {
  const [isResearching, setIsResearching] = useState(false)
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false)
  const [isGeneratingMindmap, setIsGeneratingMindmap] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [briefExists, setBriefExists] = useState(hasProjectBrief)

  const handleResearch = async () => {
    setIsResearching(true)
    setError(null)

    try {
      const response = await fetch(`/api/notes/${noteId}/research`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Research failed')
      }

      // Reload page to show research results
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
      setIsResearching(false)
    }
  }

  const handleGenerateBrief = async (regenerate: boolean = false) => {
    setIsGeneratingBrief(true)
    setError(null)

    try {
      const response = await fetch(`/api/notes/${noteId}/project-brief`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'json',
          regenerate
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Brief generation failed')
      }

      // Get JSON response instead of blob
      const data = await response.json()

      // Mark that brief now exists and reload to show it
      setBriefExists(true)
      setIsGeneratingBrief(false)

      // Reload page to show the project brief
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
      setIsGeneratingBrief(false)
    }
  }

  const handleGenerateMindmap = async () => {
    setIsGeneratingMindmap(true)
    setError(null)

    try {
      const response = await fetch(`/api/notes/${noteId}/mindmap?output=image`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Mind map generation failed')
      }

      const data = await response.json()

      // Open mindmap in new window
      const mindmapWindow = window.open('', '_blank')
      if (mindmapWindow) {
        mindmapWindow.document.write(`
          <html>
            <head>
              <title>Mind Map</title>
              <style>
                body { margin: 0; padding: 20px; background: #f9fafb; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; height: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              </style>
            </head>
            <body>
              <img src="${data.imageUrl}" alt="Mind Map" />
            </body>
          </html>
        `)
      }

      setIsGeneratingMindmap(false)
    } catch (err: any) {
      setError(err.message)
      setIsGeneratingMindmap(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Idea Studio Tools</h3>
        <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-full">
          Pro
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleResearch}
          disabled={isResearching || hasResearch}
          className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lightbulb className={`w-6 h-6 ${isResearching ? 'animate-pulse' : ''} text-purple-600`} />
          <span className="text-sm font-medium text-gray-900">
            {hasResearch ? 'Research Done' : isResearching ? 'Researching...' : 'AI Research'}
          </span>
          <span className="text-xs text-gray-600 text-center">
            Find relevant info online
          </span>
        </button>

        <button
          onClick={() => handleGenerateBrief(false)}
          disabled={isGeneratingBrief}
          className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className={`w-6 h-6 ${isGeneratingBrief ? 'animate-pulse' : ''} text-indigo-600`} />
          <span className="text-sm font-medium text-gray-900">
            {isGeneratingBrief ? 'Generating...' : briefExists ? 'View Brief' : 'Project Brief'}
          </span>
          <span className="text-xs text-gray-600 text-center">
            {briefExists ? 'Already generated' : 'Structured project plan'}
          </span>
        </button>

        <button
          onClick={handleGenerateMindmap}
          disabled={isGeneratingMindmap}
          className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg border-2 border-pink-200 hover:border-pink-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Network className={`w-6 h-6 ${isGeneratingMindmap ? 'animate-pulse' : ''} text-pink-600`} />
          <span className="text-sm font-medium text-gray-900">
            {isGeneratingMindmap ? 'Generating...' : 'Mind Map'}
          </span>
          <span className="text-xs text-gray-600 text-center">
            Visual idea map
          </span>
        </button>
      </div>
    </div>
  )
}

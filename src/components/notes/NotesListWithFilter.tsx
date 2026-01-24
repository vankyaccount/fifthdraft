'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import TagFilter from './TagFilter'
import FolderSidebar from './FolderSidebar'
import SearchBar from './SearchBar'
import { Loader2 } from 'lucide-react'

interface Note {
  id: string
  title: string
  summary?: string
  mode: string
  created_at: string
  tags?: string[]
  folder_id?: string
  structure?: any
  recording?: {
    duration: number
  }
}

interface NotesListWithFilterProps {
  notes: Note[]
}

export default function NotesListWithFilter({ notes }: NotesListWithFilterProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Note[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Handle search with API
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams({ q: query })
      if (selectedTags.length > 0) {
        params.set('tags', selectedTags.join(','))
      }

      const response = await fetch(`/api/notes/search?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setSearchResults(data.notes)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [selectedTags])

  // Clear search when filters change
  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery)
    }
  }, [selectedTags, searchQuery, handleSearch])

  const filteredNotes = useMemo(() => {
    // Use search results if searching
    if (searchQuery && searchResults !== null) {
      let filtered = searchResults

      // Filter by folder (search results don't include folder filter)
      if (selectedFolderId !== null) {
        filtered = filtered.filter(note => note.folder_id === selectedFolderId)
      }

      return filtered
    }

    // Otherwise use local filtering
    let filtered = notes

    // Filter by folder
    if (selectedFolderId !== null) {
      filtered = filtered.filter(note => note.folder_id === selectedFolderId)
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => {
        if (!note.tags || note.tags.length === 0) return false
        return selectedTags.every(tag => note.tags!.includes(tag))
      })
    }

    return filtered
  }, [notes, selectedTags, selectedFolderId, searchQuery, searchResults])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar with Folders */}
      <div className="lg:col-span-1 space-y-4">
        <FolderSidebar
          selectedFolderId={selectedFolderId}
          onFolderSelect={setSelectedFolderId}
        />
        <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
      </div>

      {/* Main Notes List */}
      <div className="lg:col-span-3 space-y-4">
        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search in title, summary, or content..."
        />

      {isSearching ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin" />
          <p className="mt-4 text-sm text-gray-600">Searching notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery
              ? 'No results found'
              : selectedTags.length > 0
              ? 'No notes match these tags'
              : 'No notes yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? 'Try a different search term or clear your search.'
              : selectedTags.length > 0
              ? 'Try selecting different tags or clearing filters.'
              : 'Get started by recording your first audio note.'}
          </p>
          {selectedTags.length === 0 && (
            <div className="mt-6">
              <Link
                href="/dashboard/record"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Record Audio
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredNotes.map((note) => {
              const structure = note.structure as any || {}
              const actionItemsCount = structure.actionItems?.length || 0
              const keyPointsCount = structure.keyPoints?.length || 0

              return (
                <li key={note.id}>
                  <Link
                    href={`/dashboard/notes/${note.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-6 py-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {note.title}
                          </h3>
                          <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4 flex-wrap">
                            <span className="capitalize inline-flex items-center">
                              <svg className="mr-1.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {note.mode}
                            </span>
                            <span className="inline-flex items-center">
                              <svg className="mr-1.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(note.created_at).toLocaleDateString()}
                            </span>
                            {note.recording && (
                              <span className="inline-flex items-center">
                                <svg className="mr-1.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {note.recording.duration || 0} min
                              </span>
                            )}
                          </div>
                          {note.tags && note.tags.length > 0 && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              {note.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {note.summary && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {note.summary}
                            </p>
                          )}
                          <div className="mt-3 flex items-center space-x-4">
                            {keyPointsCount > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {keyPointsCount} key points
                              </span>
                            )}
                            {actionItemsCount > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {actionItemsCount} action items
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      </div>
    </div>
  )
}

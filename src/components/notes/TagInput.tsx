'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Tag, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface TagInputProps {
  noteId: string
  initialTags: string[]
  onTagsChange?: (tags: string[]) => void
}

export default function TagInput({ noteId, initialTags, onTagsChange }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags || [])
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Load tag suggestions from user's other notes
  useEffect(() => {
    async function loadSuggestions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: notes } = await supabase
        .from('notes')
        .select('tags')
        .eq('user_id', user.id)
        .not('tags', 'is', null)

      if (notes) {
        const allTags = new Set<string>()
        notes.forEach((note: any) => {
          if (note.tags && Array.isArray(note.tags)) {
            note.tags.forEach((tag: string) => allTags.add(tag))
          }
        })
        setSuggestions(Array.from(allTags))
      }
    }
    loadSuggestions()
  }, [])

  const addTag = async (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (!trimmedTag || tags.includes(trimmedTag)) return

    const newTags = [...tags, trimmedTag]
    setTags(newTags)
    setInputValue('')
    setShowSuggestions(false)

    // Update in database
    const { error } = await supabase
      .from('notes')
      .update({ tags: newTags })
      .eq('id', noteId)

    if (error) {
      console.error('Error updating tags:', error)
      // Revert on error
      setTags(tags)
    } else {
      onTagsChange?.(newTags)
    }
  }

  const removeTag = async (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)

    // Update in database
    const { error } = await supabase
      .from('notes')
      .update({ tags: newTags })
      .eq('id', noteId)

    if (error) {
      console.error('Error updating tags:', error)
      // Revert on error
      setTags(tags)
    } else {
      onTagsChange?.(newTags)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      e.preventDefault()
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setShowSuggestions(false)
    }
  }

  const filteredSuggestions = suggestions.filter(
    suggestion =>
      !tags.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 5)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  return (
    <div className="relative">
      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center text-sm text-gray-500">
          <Tag className="w-4 h-4 mr-1" />
          <span>Tags:</span>
        </div>

        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium group hover:bg-indigo-200 transition-colors"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="opacity-60 hover:opacity-100 transition-opacity"
              title="Remove tag"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {isEditing ? (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setShowSuggestions(e.target.value.length > 0)
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setTimeout(() => {
                  setIsEditing(false)
                  setShowSuggestions(false)
                }, 200)
              }}
              placeholder="Type tag name..."
              className="px-3 py-1 border border-indigo-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[150px]"
            />

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <div className="text-xs text-gray-500 px-2 pb-1">Suggestions</div>
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => addTag(suggestion)}
                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-gray-300 text-gray-600 rounded-full text-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add tag
          </button>
        )}
      </div>

      {isEditing && (
        <div className="mt-2 text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Enter</kbd> to add,{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Esc</kbd> to cancel
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Tag, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface TagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export default function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<{ tag: string; count: number }[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadAvailableTags()
  }, [])

  async function loadAvailableTags() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: notes } = await supabase
      .from('notes')
      .select('tags')
      .eq('user_id', user.id)
      .not('tags', 'is', null)

    if (notes) {
      const tagCounts = new Map<string, number>()
      notes.forEach(note => {
        if (note.tags && Array.isArray(note.tags)) {
          note.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
          })
        }
      })

      const sortedTags = Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)

      setAvailableTags(sortedTags)
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const clearAllTags = () => {
    onTagsChange([])
  }

  if (availableTags.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter by Tags</h3>
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTags.slice(0, isOpen ? undefined : 10).map(({ tag, count }) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
              <span className={`text-xs ${isSelected ? 'text-indigo-200' : 'text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {availableTags.length > 10 && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {isOpen ? 'Show less' : `Show ${availableTags.length - 10} more tags`}
        </button>
      )}
    </div>
  )
}

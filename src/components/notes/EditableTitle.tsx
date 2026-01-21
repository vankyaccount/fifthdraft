'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EditableTitleProps {
  noteId: string
  initialTitle: string
}

export default function EditableTitle({ noteId, initialTitle }: EditableTitleProps) {
  const [title, setTitle] = useState(initialTitle)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      setTitle(initialTitle)
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('notes')
      .update({ title: title.trim() })
      .eq('id', noteId)

    setIsSaving(false)
    setIsEditing(false)

    if (error) {
      console.error('Error updating title:', error)
      alert('Failed to update title')
      setTitle(initialTitle)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setTitle(initialTitle)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving}
          className="text-3xl font-bold text-gray-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent flex-1"
          autoFocus
        />
        {isSaving && (
          <span className="text-sm text-gray-500">Saving...</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 group">
      <h1 className="text-3xl font-bold text-gray-900">
        {title}
      </h1>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
        title="Edit title"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  )
}

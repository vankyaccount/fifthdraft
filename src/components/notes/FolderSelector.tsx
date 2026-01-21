'use client'

import { useState, useEffect } from 'react'
import { Folder, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FolderType {
  id: string
  name: string
  color: string
}

interface FolderSelectorProps {
  noteId: string
  currentFolderId?: string | null
}

export default function FolderSelector({ noteId, currentFolderId }: FolderSelectorProps) {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId || null)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadFolders()
  }, [])

  async function loadFolders() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('folders')
      .select('id, name, color')
      .eq('user_id', user.id)
      .order('name')

    if (data) {
      setFolders(data)
    }
  }

  async function moveToFolder(folderId: string | null) {
    const { error } = await supabase
      .from('notes')
      .update({ folder_id: folderId })
      .eq('id', noteId)

    if (error) {
      console.error('Error moving note:', error)
      alert('Failed to move note to folder')
    } else {
      setSelectedFolderId(folderId)
      setIsOpen(false)
    }
  }

  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Folder className="w-4 h-4" style={{ color: selectedFolder?.color || '#6B7280' }} />
        <span className="text-gray-700">
          {selectedFolder?.name || 'No folder'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-2">
              <button
                onClick={() => moveToFolder(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedFolderId === null ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">No folder</span>
                </div>
                {selectedFolderId === null && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>

              <div className="my-2 border-t border-gray-200" />

              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => moveToFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedFolderId === folder.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" style={{ color: folder.color }} />
                    <span className="text-sm text-gray-700">{folder.name}</span>
                  </div>
                  {selectedFolderId === folder.id && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

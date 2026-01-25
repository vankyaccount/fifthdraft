'use client'

import { useState, useEffect } from 'react'
import { Folder, Plus, ChevronRight, ChevronDown, MoreHorizontal, Edit2, Trash2, FolderPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import FolderManager from './FolderManager'

interface FolderType {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  parent_folder_id?: string
  note_count?: number
}

interface FolderSidebarProps {
  selectedFolderId?: string | null
  onFolderSelect: (folderId: string | null) => void
}

export default function FolderSidebar({ selectedFolderId, onFolderSelect }: FolderSidebarProps) {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadFolders()
  }, [])

  async function loadFolders() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get folders with note counts
    const { data: foldersData } = await supabase
      .from('folders')
      .select('*, notes:notes(count)')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (foldersData) {
      const foldersWithCounts = foldersData.map((folder: any) => ({
        ...folder,
        note_count: folder.notes?.[0]?.count || 0
      }))
      setFolders(foldersWithCounts)
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleFolderCreated = () => {
    loadFolders()
    setShowCreateFolder(false)
  }

  const handleFolderUpdated = () => {
    loadFolders()
    setEditingFolder(null)
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder? Notes will be moved to no folder.')) return

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)

    if (error) {
      console.error('Error deleting folder:', error)
      alert('Failed to delete folder')
    } else {
      loadFolders()
      if (selectedFolderId === folderId) {
        onFolderSelect(null)
      }
    }
  }

  // Organize folders into tree structure
  const rootFolders = folders.filter(f => !f.parent_folder_id)
  const getChildFolders = (parentId: string) =>
    folders.filter(f => f.parent_folder_id === parentId)

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const hasChildren = getChildFolders(folder.id).length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id

    return (
      <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={() => onFolderSelect(folder.id)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(folder.id)
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            <Folder className="w-4 h-4 flex-shrink-0" style={{ color: folder.color }} />
            <span className="truncate text-sm">{folder.name}</span>
            {folder.note_count! > 0 && (
              <span className="text-xs text-gray-500 ml-auto">
                {folder.note_count}
              </span>
            )}
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditingFolder(folder)
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Edit folder"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteFolder(folder.id)
              }}
              className="p-1 hover:bg-red-100 text-red-600 rounded"
              title="Delete folder"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {getChildFolders(folder.id).map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Folder className="w-5 h-5 text-gray-600" />
          Folders
        </h3>
        <button
          onClick={() => setShowCreateFolder(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Create folder"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="space-y-1">
        <button
          onClick={() => onFolderSelect(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedFolderId === null
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>All Notes</span>
        </button>

        {rootFolders.map(folder => renderFolder(folder))}
      </div>

      {showCreateFolder && (
        <FolderManager
          onClose={() => setShowCreateFolder(false)}
          onSave={handleFolderCreated}
        />
      )}

      {editingFolder && (
        <FolderManager
          folder={editingFolder}
          onClose={() => setEditingFolder(null)}
          onSave={handleFolderUpdated}
        />
      )}
    </div>
  )
}

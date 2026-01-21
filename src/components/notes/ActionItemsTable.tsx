'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ActionItem {
  id: string
  title: string
  description: string | null
  assignee_name: string | null
  due_date: string | null
  priority: string | null
  status: string
}

interface ActionItemsTableProps {
  noteId: string
  initialItems: ActionItem[]
  variant?: 'meeting' | 'brainstorming'
}

export default function ActionItemsTable({ noteId, initialItems, variant = 'meeting' }: ActionItemsTableProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems)

  const toggleStatus = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'

    // Optimistic update
    setItems(items.map(item =>
      item.id === itemId ? { ...item, status: newStatus } : item
    ))

    const supabase = createClient()
    const { error } = await supabase
      .from('action_items')
      .update({ status: newStatus })
      .eq('id', itemId)

    if (error) {
      console.error('Error updating action item:', error)
      // Revert on error
      setItems(items.map(item =>
        item.id === itemId ? { ...item, status: currentStatus } : item
      ))
      alert('Failed to update action item status')
    }
  }

  const exportToJira = async () => {
    // Prepare data for Jira export
    const jiraData = items.map(item => ({
      summary: item.title,
      description: item.description || '',
      assignee: item.assignee_name || 'Unassigned',
      dueDate: item.due_date || '',
      priority: item.priority || 'Medium',
      status: item.status === 'completed' ? 'Done' : 'To Do'
    }))

    // For now, copy to clipboard as JSON
    await navigator.clipboard.writeText(JSON.stringify(jiraData, null, 2))
    alert('Action items copied to clipboard! You can paste this into your Jira import tool.')
  }

  const exportToTrello = async () => {
    // Prepare data for Trello export
    const trelloData = items.map(item => ({
      name: item.title,
      desc: item.description || '',
      due: item.due_date || '',
      labels: [item.priority || 'medium'],
      members: item.assignee_name ? [item.assignee_name] : []
    }))

    await navigator.clipboard.writeText(JSON.stringify(trelloData, null, 2))
    alert('Action items copied to clipboard! You can paste this into your Trello import tool.')
  }

  const exportToLinear = async () => {
    // Prepare data for Linear export
    const linearData = items.map(item => ({
      title: item.title,
      description: item.description || '',
      assignee: item.assignee_name || null,
      dueDate: item.due_date || null,
      priority: item.priority === 'high' ? 1 : item.priority === 'medium' ? 2 : 3,
      state: item.status === 'completed' ? 'Done' : 'Todo'
    }))

    await navigator.clipboard.writeText(JSON.stringify(linearData, null, 2))
    alert('Action items copied to clipboard! You can paste this into your Linear import tool.')
  }

  if (items.length === 0) {
    return null
  }

  const isBrainstorming = variant === 'brainstorming'
  const containerClass = isBrainstorming
    ? 'bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6 overflow-x-auto border-2 border-purple-200'
    : 'bg-white rounded-lg shadow-sm p-6 mb-6 overflow-x-auto'
  const titleClass = isBrainstorming ? 'text-xl font-semibold text-purple-900' : 'text-xl font-semibold'

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={titleClass}>
          {isBrainstorming ? '🎯 Next Steps' : 'Meeting Notes'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportToJira}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
            title="Export to Jira"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z"/>
            </svg>
            Jira
          </button>
          <button
            onClick={exportToTrello}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
            title="Export to Trello"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm9.44-6.84c0 .795-.645 1.44-1.44 1.44H14c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.646-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v6.78z"/>
            </svg>
            Trello
          </button>
          <button
            onClick={exportToLinear}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
            title="Export to Linear"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/>
            </svg>
            Linear
          </button>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-3 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={item.status === 'completed'}
                  onChange={() => toggleStatus(item.id, item.status)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </td>
              <td className="px-3 py-4">
                <div className={`text-sm font-medium ${item.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                )}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {item.assignee_name || '-'}
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                {item.priority ? (
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.priority === 'high' || item.priority === 'urgent'
                      ? 'bg-red-100 text-red-800'
                      : item.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.priority}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

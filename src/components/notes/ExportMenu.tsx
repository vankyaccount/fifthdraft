'use client'

import { useState } from 'react'
import { Download, FileText, X } from 'lucide-react'
import type { Note } from '@/lib/supabase/types'
import { downloadMarkdown } from '@/lib/export/markdown'
import { downloadPDF } from '@/lib/export/pdf'
import { downloadDOCX } from '@/lib/export/docx'

interface ExportMenuProps {
  note: Note
}

export default function ExportMenu({ note }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'markdown' | 'pdf' | 'docx' | 'txt' | 'json') => {
    setExporting(true)
    try {
      switch (format) {
        case 'markdown':
          downloadMarkdown(note, {
            includeMetadata: true,
            includeActionItems: true
          })
          break
        case 'pdf':
          downloadPDF(note, {
            includeMetadata: true,
            includeActionItems: true,
            includeBranding: true
          })
          break
        case 'docx':
          await downloadDOCX(note, {
            includeMetadata: true,
            includeActionItems: true,
            includeBranding: true
          })
          break
        case 'txt':
          // Plain text export (just the content)
          const textBlob = new Blob([note.content], { type: 'text/plain;charset=utf-8' })
          const textUrl = URL.createObjectURL(textBlob)
          const textLink = document.createElement('a')
          textLink.href = textUrl
          textLink.download = `${sanitizeFilename(note.title)}.txt`
          document.body.appendChild(textLink)
          textLink.click()
          document.body.removeChild(textLink)
          URL.revokeObjectURL(textUrl)
          break
        case 'json':
          // JSON export (structured data)
          const jsonBlob = new Blob([JSON.stringify(note, null, 2)], {
            type: 'application/json;charset=utf-8'
          })
          const jsonUrl = URL.createObjectURL(jsonBlob)
          const jsonLink = document.createElement('a')
          jsonLink.href = jsonUrl
          jsonLink.download = `${sanitizeFilename(note.title)}.json`
          document.body.appendChild(jsonLink)
          jsonLink.click()
          document.body.removeChild(jsonLink)
          URL.revokeObjectURL(jsonUrl)
          break
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        disabled={exporting}
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Export Note</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose your preferred format
              </p>
            </div>

            <div className="p-2">
              <button
                onClick={() => handleExport('markdown')}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              >
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Markdown</div>
                  <div className="text-xs text-gray-500">
                    .md file with formatting
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              >
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">PDF</div>
                  <div className="text-xs text-gray-500">
                    Professional document
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExport('docx')}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              >
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Word Document</div>
                  <div className="text-xs text-gray-500">
                    Editable .docx file
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExport('txt')}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              >
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Plain Text</div>
                  <div className="text-xs text-gray-500">
                    Simple .txt file
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              >
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">JSON</div>
                  <div className="text-xs text-gray-500">
                    Structured data
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}

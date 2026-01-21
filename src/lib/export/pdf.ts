import { jsPDF } from 'jspdf'
import type { Note } from '@/lib/supabase/types'

export interface PDFExportOptions {
  includeMetadata?: boolean
  includeActionItems?: boolean
  includeBranding?: boolean
}

export function exportToPDF(
  note: Note,
  options: PDFExportOptions = {}
): jsPDF {
  const {
    includeMetadata = true,
    includeActionItems = true,
    includeBranding = true,
  } = options

  const structure = note.structure as any
  const doc = new jsPDF()
  let yPosition = 20

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin

  // Helper function to add text with word wrap
  const addText = (text: string, size: number, isBold: boolean = false, color: string = '#000000') => {
    doc.setFontSize(size)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setTextColor(color)

    const lines = doc.splitTextToSize(text, contentWidth)
    lines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        yPosition = 20
      }
      doc.text(line, margin, yPosition)
      yPosition += size * 0.5 // Line height
    })
    yPosition += 5 // Extra spacing after paragraph
  }

  // Header with branding
  if (includeBranding) {
    doc.setFillColor(99, 102, 241) // Indigo color
    doc.rect(0, 0, pageWidth, 15, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('FifthDraft', margin, 10)
    yPosition = 25
  }

  // Title
  addText(note.title, 20, true, '#1e1b4b')

  // Metadata
  if (includeMetadata) {
    const metadataText = `${new Date(note.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} • ${note.mode ? note.mode.charAt(0).toUpperCase() + note.mode.slice(1) : 'Note'} Mode`
    addText(metadataText, 10, false, '#6b7280')
    yPosition += 5
  }

  // Divider line
  doc.setDrawColor(229, 231, 235)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Summary
  if (note.summary) {
    addText('Summary', 14, true, '#4f46e5')
    addText(note.summary, 11)
    yPosition += 5
  }

  // Key Points
  if (structure?.keyPoints && structure.keyPoints.length > 0) {
    addText('Key Points', 14, true, '#4f46e5')
    structure.keyPoints.forEach((point: string) => {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor('#000000')

      const bulletPoint = `• ${point}`
      const lines = doc.splitTextToSize(bulletPoint, contentWidth - 10)
      lines.forEach((line: string, index: number) => {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, margin + (index === 0 ? 0 : 5), yPosition)
        yPosition += 5.5
      })
    })
    yPosition += 5
  }

  // Decisions
  if (structure?.decisions && structure.decisions.length > 0) {
    addText('Decisions Made', 14, true, '#4f46e5')
    structure.decisions.forEach((decision: string) => {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor('#000000')

      const checkmark = `✓ ${decision}`
      const lines = doc.splitTextToSize(checkmark, contentWidth - 10)
      lines.forEach((line: string, index: number) => {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, margin + (index === 0 ? 0 : 5), yPosition)
        yPosition += 5.5
      })
    })
    yPosition += 5
  }

  // Questions
  if (structure?.questions && structure.questions.length > 0) {
    addText('Questions & Follow-ups', 14, true, '#4f46e5')
    structure.questions.forEach((question: string) => {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor('#000000')

      const questionText = `? ${question}`
      const lines = doc.splitTextToSize(questionText, contentWidth - 10)
      lines.forEach((line: string, index: number) => {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, margin + (index === 0 ? 0 : 5), yPosition)
        yPosition += 5.5
      })
    })
    yPosition += 5
  }

  // Action Items
  if (includeActionItems && structure?.actionItems && structure.actionItems.length > 0) {
    addText('Action Items', 14, true, '#4f46e5')

    structure.actionItems.forEach((item: any) => {
      const assignee = item.assignee || item.assignee_name || 'Unassigned'
      const dueDate = item.dueDate || item.due_date
      const priority = item.priority ? ` [${item.priority.toUpperCase()}]` : ''

      // Task title
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor('#000000')
      const taskTitle = `□ ${item.title}${priority}`
      const titleLines = doc.splitTextToSize(taskTitle, contentWidth - 10)
      titleLines.forEach((line: string, index: number) => {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, margin + 5, yPosition)
        yPosition += 5.5
      })

      // Task details
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor('#6b7280')

      if (item.description) {
        const descLines = doc.splitTextToSize(`  ${item.description}`, contentWidth - 15)
        descLines.forEach((line: string) => {
          if (yPosition > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            yPosition = 20
          }
          doc.text(line, margin + 10, yPosition)
          yPosition += 5
        })
      }

      doc.text(`  Assignee: ${assignee}`, margin + 10, yPosition)
      yPosition += 5

      if (dueDate) {
        doc.text(`  Due: ${new Date(dueDate).toLocaleDateString()}`, margin + 10, yPosition)
        yPosition += 5
      }

      yPosition += 3 // Extra space between action items
    })
    yPosition += 5
  }

  // Full Transcript
  if (note.content) {
    addText('Full Transcript', 14, true, '#4f46e5')
    addText(note.content, 10)
  }

  // Footer
  if (includeBranding) {
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor('#9ca3af')
      doc.text(
        `Generated by FifthDraft on ${new Date().toLocaleDateString()} • Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }
  }

  return doc
}

export function downloadPDF(note: Note, options?: PDFExportOptions): void {
  const doc = exportToPDF(note, options)
  doc.save(`${sanitizeFilename(note.title)}.pdf`)
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}

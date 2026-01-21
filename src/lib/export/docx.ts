import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx'
import type { Note } from '@/lib/supabase/types'

export interface DOCXExportOptions {
  includeMetadata?: boolean
  includeActionItems?: boolean
  includeBranding?: boolean
}

export async function exportToDOCX(
  note: Note,
  options: DOCXExportOptions = {}
): Promise<Blob> {
  const {
    includeMetadata = true,
    includeActionItems = true,
    includeBranding = true,
  } = options

  const children: Paragraph[] = []

  // Title
  children.push(
    new Paragraph({
      text: note.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      thematicBreak: false,
    })
  )

  // Metadata
  if (includeMetadata) {
    const metadataText = `${new Date(note.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} • ${note.mode ? note.mode.charAt(0).toUpperCase() + note.mode.slice(1) : 'Note'} Mode`

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: metadataText,
            italics: true,
            size: 20, // 10pt in half-points
            color: '6B7280',
          }),
        ],
        spacing: { after: 300 },
      })
    )
  }

  // Summary
  if (note.summary) {
    children.push(
      new Paragraph({
        text: 'Summary',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    )
    children.push(
      new Paragraph({
        text: note.summary,
        spacing: { after: 200 },
      })
    )
  }

  // Key Points
  const structure = note.structure as any
  if (structure?.keyPoints && Array.isArray(structure.keyPoints) && structure.keyPoints.length > 0) {
    children.push(
      new Paragraph({
        text: 'Key Points',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    )

    structure.keyPoints.forEach((point: string) => {
      children.push(
        new Paragraph({
          text: point,
          bullet: {
            level: 0,
          },
          spacing: { after: 100 },
        })
      )
    })

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 100 },
      })
    )
  }

  // Decisions
  if (structure?.decisions && structure.decisions.length > 0) {
    children.push(
      new Paragraph({
        text: 'Decisions Made',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    )

    structure.decisions.forEach((decision: string) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '✓ ',
              color: '4F46E5',
              bold: true,
            }),
            new TextRun({
              text: decision,
            }),
          ],
          spacing: { after: 100 },
        })
      )
    })

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 100 },
      })
    )
  }

  // Questions
  if (structure?.questions && structure.questions.length > 0) {
    children.push(
      new Paragraph({
        text: 'Questions & Follow-ups',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    )

    structure.questions.forEach((question: string) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '? ',
              color: 'EF4444',
              bold: true,
            }),
            new TextRun({
              text: question,
            }),
          ],
          spacing: { after: 100 },
        })
      )
    })

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 100 },
      })
    )
  }

  // Action Items
  if (includeActionItems && structure?.actionItems && structure.actionItems.length > 0) {
    children.push(
      new Paragraph({
        text: 'Action Items',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    )

    structure.actionItems.forEach((item: any) => {
      const assignee = item.assignee || item.assignee_name || 'Unassigned'
      const dueDate = item.dueDate || item.due_date
      const priority = item.priority ? ` [${item.priority.toUpperCase()}]` : ''

      // Task title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '☐ ',
              size: 24,
            }),
            new TextRun({
              text: `${item.title}${priority}`,
              bold: true,
            }),
          ],
          spacing: { after: 50 },
        })
      )

      // Description
      if (item.description) {
        children.push(
          new Paragraph({
            text: `  ${item.description}`,
            spacing: { after: 50 },
          })
        )
      }

      // Assignee
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '  Assignee: ',
              italics: true,
              size: 20,
            }),
            new TextRun({
              text: assignee,
              size: 20,
            }),
          ],
          spacing: { after: 50 },
        })
      )

      // Due date
      if (dueDate) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '  Due: ',
                italics: true,
                size: 20,
              }),
              new TextRun({
                text: new Date(dueDate).toLocaleDateString(),
                size: 20,
              }),
            ],
            spacing: { after: 150 },
          })
        )
      } else {
        children.push(
          new Paragraph({
            text: '',
            spacing: { after: 100 },
          })
        )
      }
    })
  }

  // Full Transcript
  if (note.content) {
    children.push(
      new Paragraph({
        text: 'Full Transcript',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    )

    // Split content into paragraphs
    const paragraphs = note.content.split('\n').filter(p => p.trim())
    paragraphs.forEach(para => {
      children.push(
        new Paragraph({
          text: para,
          spacing: { after: 100 },
        })
      )
    })
  }

  // Footer
  if (includeBranding) {
    children.push(
      new Paragraph({
        text: '',
        spacing: { before: 300 },
        border: {
          top: {
            color: 'E5E7EB',
            space: 1,
            style: 'single',
            size: 6,
          },
        },
      })
    )
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated by FifthDraft on ${new Date().toLocaleDateString()}`,
            italics: true,
            size: 18,
            color: '9CA3AF',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
      })
    )
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  })

  return await Packer.toBlob(doc)
}

export async function downloadDOCX(note: Note, options?: DOCXExportOptions): Promise<void> {
  const blob = await exportToDOCX(note, options)
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFilename(note.title)}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}

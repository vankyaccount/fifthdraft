/**
 * Mind Map Generator Service
 * Creates Mermaid.js mind maps from brainstorming notes
 */

export interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
}

/**
 * Generate Mermaid.js mindmap syntax from brainstorming structure
 */
export function generateMindMap(
  noteTitle: string,
  coreIdeas: Array<{
    title: string
    description: string
    connections: string[]
  }>,
  expansionOpportunities: Array<{
    ideaTitle: string
    directions: string[]
  }>
): string {
  // Create root node
  const rootLabel = noteTitle.length > 30 ? noteTitle.substring(0, 30) + '...' : noteTitle
  let mermaid = `mindmap
  root((${sanitizeLabel(rootLabel)}))\n`

  // Add core ideas as main branches
  coreIdeas.forEach((idea, index) => {
    const ideaLabel = sanitizeLabel(idea.title)
    mermaid += `    ${ideaLabel}\n`

    // Find expansion opportunities for this idea
    const expansions = expansionOpportunities.find(e =>
      e.ideaTitle.toLowerCase().includes(idea.title.toLowerCase()) ||
      idea.title.toLowerCase().includes(e.ideaTitle.toLowerCase())
    )

    if (expansions && expansions.directions.length > 0) {
      // Add expansion directions as sub-branches
      expansions.directions.forEach(direction => {
        const directionLabel = sanitizeLabel(
          direction.length > 40 ? direction.substring(0, 40) + '...' : direction
        )
        mermaid += `      ${directionLabel}\n`
      })
    }

    // Add connections as sub-branches
    if (idea.connections && idea.connections.length > 0) {
      idea.connections.slice(0, 2).forEach(connection => {
        const connLabel = sanitizeLabel(
          connection.length > 30 ? connection.substring(0, 30) + '...' : connection
        )
        mermaid += `      [Connected: ${connLabel}]\n`
      })
    }
  })

  return mermaid
}

/**
 * Sanitize label for Mermaid.js syntax
 */
function sanitizeLabel(text: string): string {
  return text
    .replace(/[()[\]{}]/g, '') // Remove special characters
    .replace(/"/g, "'") // Replace double quotes with single
    .trim()
}

/**
 * Generate alternative hierarchical mind map format
 */
export function generateHierarchicalMindMap(
  noteTitle: string,
  coreIdeas: Array<{
    title: string
    description: string
    connections: string[]
  }>,
  nextSteps: Array<{
    title: string
    priority: string
  }>,
  obstacles: string[]
): string {
  let mermaid = `graph TB
    ROOT["${sanitizeLabel(noteTitle)}"]
    style ROOT fill:#9333ea,stroke:#7e22ce,stroke-width:3px,color:#fff\n\n`

  // Add core ideas
  mermaid += `    subgraph "Core Ideas"\n`
  coreIdeas.forEach((idea, i) => {
    const id = `IDEA${i}`
    mermaid += `        ${id}["${sanitizeLabel(idea.title)}"]\n`
    mermaid += `        ROOT --> ${id}\n`
    mermaid += `        style ${id} fill:#a855f7,stroke:#9333ea,stroke-width:2px,color:#fff\n`
  })
  mermaid += `    end\n\n`

  // Add next steps
  if (nextSteps.length > 0) {
    mermaid += `    subgraph "Next Steps"\n`
    nextSteps.slice(0, 5).forEach((step, i) => {
      const id = `STEP${i}`
      const color = step.priority === 'high' ? '#ef4444' : step.priority === 'medium' ? '#f59e0b' : '#10b981'
      mermaid += `        ${id}["${sanitizeLabel(step.title)}"]\n`
      mermaid += `        ROOT --> ${id}\n`
      mermaid += `        style ${id} fill:${color},stroke:#fff,stroke-width:2px,color:#fff\n`
    })
    mermaid += `    end\n\n`
  }

  // Add obstacles
  if (obstacles.length > 0) {
    mermaid += `    subgraph "Challenges"\n`
    obstacles.slice(0, 3).forEach((obstacle, i) => {
      const id = `OBS${i}`
      const label = obstacle.length > 40 ? obstacle.substring(0, 40) + '...' : obstacle
      mermaid += `        ${id}["⚠ ${sanitizeLabel(label)}"]\n`
      mermaid += `        ROOT -.-> ${id}\n`
      mermaid += `        style ${id} fill:#fbbf24,stroke:#f59e0b,stroke-width:2px\n`
    })
    mermaid += `    end\n`
  }

  return mermaid
}

/**
 * Get mind map embed URL for rendering
 */
export function getMermaidImageUrl(mermaidSyntax: string): string {
  const encoded = Buffer.from(mermaidSyntax).toString('base64')
  return `https://mermaid.ink/img/${encoded}`
}

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/queries'

// Get a single action item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getCurrentUser()

    if (!result.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const queryResult = await db.query(
      `SELECT * FROM action_items WHERE id = $1 AND user_id = $2`,
      [id, result.user.id]
    )

    if (!queryResult.rows || queryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Action item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(queryResult.rows[0])
  } catch (error) {
    console.error('Error in GET /api/action-items/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update an action item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getCurrentUser()

    if (!result.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      assignee_name,
      assignee_user_id,
      due_date,
      priority,
      type,
      status
    } = body

    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`)
      values.push(title)
      paramCount++
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`)
      values.push(description)
      paramCount++
    }

    if (assignee_name !== undefined) {
      updates.push(`assignee_name = $${paramCount}`)
      values.push(assignee_name)
      paramCount++
    }

    if (assignee_user_id !== undefined) {
      updates.push(`assignee_user_id = $${paramCount}`)
      values.push(assignee_user_id)
      paramCount++
    }

    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCount}`)
      values.push(due_date)
      paramCount++
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`)
      values.push(priority)
      paramCount++
    }

    if (type !== undefined) {
      updates.push(`type = $${paramCount}`)
      values.push(type)
      paramCount++
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`)
      values.push(status)
      paramCount++

      // If marking as completed, set completed_at
      if (status === 'completed') {
        updates.push(`completed_at = NOW()`)
      } else {
        updates.push(`completed_at = NULL`)
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`)

    // Add WHERE clause parameters
    values.push(id)
    values.push(result.user.id)

    const queryText = `
      UPDATE action_items
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `

    const queryResult = await db.query(queryText, values)

    if (!queryResult.rows || queryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Action item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(queryResult.rows[0])
  } catch (error) {
    console.error('Error in PATCH /api/action-items/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete an action item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getCurrentUser()

    if (!result.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const queryResult = await db.query(
      `DELETE FROM action_items WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, result.user.id]
    )

    if (!queryResult.rows || queryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Action item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Error in DELETE /api/action-items/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

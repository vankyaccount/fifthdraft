import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const result = await getCurrentUser()

    if (!result.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const mode = searchParams.get('mode') // 'meeting' | 'brainstorming' | null
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    const sortBy = searchParams.get('sort') || 'date' // 'date' | 'relevance'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query.trim()) {
      // If no query, return recent notes with filters
      let sql = `
        SELECT id, title, summary, mode, created_at, tags, folder_id
        FROM notes
        WHERE user_id = $1
      `
      const params: any[] = [result.user.id]
      let paramCount = 2

      if (mode) {
        sql += ` AND mode = $${paramCount}`
        params.push(mode)
        paramCount++
      }

      if (tags.length > 0) {
        sql += ` AND tags && $${paramCount}::text[]`
        params.push(tags)
        paramCount++
      }

      if (fromDate) {
        sql += ` AND created_at >= $${paramCount}::timestamptz`
        params.push(fromDate)
        paramCount++
      }

      if (toDate) {
        sql += ` AND created_at <= $${paramCount}::timestamptz`
        params.push(toDate)
        paramCount++
      }

      sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
      params.push(limit, offset)

      const queryResult = await db.query(sql, params)

      return NextResponse.json({
        notes: queryResult.rows || [],
        total: queryResult.rows?.length || 0,
        query: ''
      })
    }

    // Full-text search query
    let sql = `
      SELECT
        id, title, summary, mode, created_at, tags, folder_id,
        ts_rank(
          to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')),
          plainto_tsquery('english', $2)
        ) AS rank
      FROM notes
      WHERE user_id = $1
        AND (
          to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, ''))
          @@ plainto_tsquery('english', $2)
        )
    `
    const params: any[] = [result.user.id, query]
    let paramCount = 3

    if (mode) {
      sql += ` AND mode = $${paramCount}`
      params.push(mode)
      paramCount++
    }

    if (tags.length > 0) {
      sql += ` AND tags && $${paramCount}::text[]`
      params.push(tags)
      paramCount++
    }

    if (fromDate) {
      sql += ` AND created_at >= $${paramCount}::timestamptz`
      params.push(fromDate)
      paramCount++
    }

    if (toDate) {
      sql += ` AND created_at <= $${paramCount}::timestamptz`
      params.push(toDate)
      paramCount++
    }

    // Sorting
    if (sortBy === 'relevance') {
      sql += ` ORDER BY rank DESC, created_at DESC`
    } else {
      sql += ` ORDER BY created_at DESC`
    }

    sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(limit, offset)

    const searchResult = await db.query(sql, params)

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total
      FROM notes
      WHERE user_id = $1
        AND (
          to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, ''))
          @@ plainto_tsquery('english', $2)
        )
    `
    const countParams: any[] = [result.user.id, query]
    let countParamCount = 3

    if (mode) {
      countSql += ` AND mode = $${countParamCount}`
      countParams.push(mode)
      countParamCount++
    }

    if (tags.length > 0) {
      countSql += ` AND tags && $${countParamCount}::text[]`
      countParams.push(tags)
      countParamCount++
    }

    if (fromDate) {
      countSql += ` AND created_at >= $${countParamCount}::timestamptz`
      countParams.push(fromDate)
      countParamCount++
    }

    if (toDate) {
      countSql += ` AND created_at <= $${countParamCount}::timestamptz`
      countParams.push(toDate)
    }

    const countResult = await db.query(countSql, countParams)
    const total = countResult.rows && countResult.rows[0] ? parseInt(countResult.rows[0].total) : 0

    return NextResponse.json({
      notes: searchResult.rows || [],
      total,
      query
    })

  } catch (error) {
    console.error('Error in GET /api/notes/search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

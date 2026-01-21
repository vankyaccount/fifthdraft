import { withAuth, type AuthenticatedRequest } from '@/lib/auth'
import { db } from '@/lib/db/queries'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return withAuth(request, async (authReq: AuthenticatedRequest) => {
    try {
      const body = await authReq.json()
      const { user_id, email, feedback, use_case, company } = body

      // Verify the user_id matches the authenticated user
      if (user_id !== authReq.user.id) {
        return NextResponse.json(
          { error: 'Invalid user ID' },
          { status: 403 }
        )
      }

      // Check if user already has a pending or approved waitlist entry
      const existing = await db.proPlusWaitlist.findByUserId(user_id)

      if (existing && (existing.status === 'pending' || existing.status === 'approved')) {
        return NextResponse.json(
          {
            error:
              existing.status === 'pending'
                ? 'You are already on the waitlist!'
                : 'You already have an approved Pro+ invitation!',
          },
          { status: 400 }
        )
      }

      // Get user profile for full_name
      const profile = await db.profiles.findById(user_id)

      // Insert into waitlist
      await db.proPlusWaitlist.create({
        user_id,
        email,
        full_name: profile?.full_name || null,
        status: 'pending',
        feedback: feedback || null,
        use_case: use_case || null,
        company: company || null,
      })

      return NextResponse.json(
        { success: true, message: 'Successfully joined Pro+ waitlist' },
        { status: 200 }
      )
    } catch (error) {
      console.error('Pro+ waitlist error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

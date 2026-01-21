import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { user_id, email, feedback, use_case, company } = body

    // Verify the user_id matches the authenticated user
    if (user_id !== user.id) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 403 }
      )
    }

    // Check if user already has a pending or approved waitlist entry
    const { data: existing } = await supabase
      .from('pro_plus_waitlist')
      .select('id, status')
      .eq('user_id', user_id)
      .in('status', ['pending', 'approved'])
      .single()

    if (existing) {
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

    // Insert into waitlist
    const { error: insertError } = await supabase
      .from('pro_plus_waitlist')
      .insert([
        {
          user_id,
          email,
          full_name: user.user_metadata?.full_name,
          status: 'pending',
          feedback: feedback || null,
          use_case: use_case || null,
          company: company || null,
        },
      ])

    if (insertError) {
      console.error('Waitlist insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

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
}

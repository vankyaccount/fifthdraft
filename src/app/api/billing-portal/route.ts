import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type AuthenticatedRequest } from '@/lib/auth'
import { db } from '@/lib/db/queries'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: NextRequest) {
  return withAuth(req, async (authReq: AuthenticatedRequest) => {
    try {
      // Get user profile with stripe customer ID
      const profile = await db.profiles.findById(authReq.user.id)

      if (!profile?.stripe_customer_id) {
        return NextResponse.json(
          { error: 'No billing account found. Please subscribe first.' },
          { status: 400 }
        )
      }

      // Create billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      })

      return NextResponse.json({ url: session.url })
    } catch (error: any) {
      console.error('Billing portal error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create billing portal session' },
        { status: 500 }
      )
    }
  })
}

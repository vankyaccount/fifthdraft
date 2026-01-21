import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type AuthenticatedRequest } from '@/lib/auth'
import { db } from '@/lib/db/queries'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (authReq: AuthenticatedRequest) => {
    try {
      // Get request body
      const { priceType } = await authReq.json()

      if (!priceType || !['pro_monthly', 'pro_yearly'].includes(priceType)) {
        return NextResponse.json({ error: 'Invalid price type' }, { status: 400 })
      }

      // Get user profile
      const profile = await db.profiles.findById(authReq.user.id)

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      // Check if already subscribed
      if (profile.subscription_tier === 'pro') {
        return NextResponse.json(
          { error: 'You already have an active Pro subscription' },
          { status: 400 }
        )
      }

      // Get or create Stripe customer
      let customerId = profile.stripe_customer_id

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: authReq.user.email,
          metadata: {
            user_id: authReq.user.id,
          },
        })
        customerId = customer.id

        // Save customer ID to profile
        await db.profiles.update(authReq.user.id, { stripe_customer_id: customerId })
      }

    // Create checkout session
    const priceId = PRICE_IDS[priceType as keyof typeof PRICE_IDS]

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
        metadata: {
          user_id: authReq.user.id,
          price_type: priceType,
        },
        subscription_data: {
          metadata: {
            user_id: authReq.user.id,
          },
        },
      })

      return NextResponse.json({ url: session.url })
    } catch (error: any) {
      console.error('Checkout error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create checkout session' },
        { status: 500 }
      )
    }
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/queries'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
])

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  if (!userId) {
    console.error('No user_id in checkout session metadata')
    return
  }

  // Get the subscription
  const subscriptionId = session.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Update user profile
  await db.profiles.update(userId, {
    subscription_tier: 'pro',
    stripe_subscription_id: subscriptionId,
    subscription_status: subscription.status,
    minutes_quota: 2000, // Pro tier gets 2000 minutes
    minutes_used: 0, // Reset usage
  })

  console.log(`User ${userId} upgraded to Pro via checkout`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find user by stripe customer ID
  const profile = await db.profiles.findByStripeCustomerId(customerId)

  if (!profile) {
    console.error('No profile found for customer:', customerId)
    return
  }

  // Determine tier based on subscription status
  const isActive = ['active', 'trialing'].includes(subscription.status)

  await db.profiles.update(profile.id, {
    subscription_tier: isActive ? 'pro' : 'free',
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    minutes_quota: isActive ? 2000 : 30,
  })

  console.log(`Subscription updated for user ${profile.id}: ${subscription.status}`)
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find user by stripe customer ID
  const profile = await db.profiles.findByStripeCustomerId(customerId)

  if (!profile) {
    console.error('No profile found for customer:', customerId)
    return
  }

  // Downgrade to free tier
  await db.profiles.update(profile.id, {
    subscription_tier: 'free',
    subscription_status: 'canceled',
    minutes_quota: 30,
  })

  console.log(`Subscription cancelled for user ${profile.id}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  // @ts-ignore - subscription property exists in runtime but not in types
  const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id

  if (!subscriptionId) return // Not a subscription invoice

  // Find user by stripe customer ID
  const profile = await db.profiles.findByStripeCustomerId(customerId)

  if (!profile) return

  // Reset monthly usage on successful payment
  await db.profiles.update(profile.id, {
    minutes_used: 0,
    subscription_status: 'active',
  })

  console.log(`Payment succeeded, reset usage for user ${profile.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Find user by stripe customer ID
  const profile = await db.profiles.findByStripeCustomerId(customerId)

  if (!profile) return

  // Mark subscription as past_due
  await db.profiles.update(profile.id, {
    subscription_status: 'past_due',
  })

  console.log(`Payment failed for user ${profile.id}`)
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to retrieve account information' },
        { status: 500 }
      )
    }

    // Step 1: Cancel Stripe subscription if exists
    if (profile?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id)
        console.log('Stripe subscription canceled:', profile.stripe_subscription_id)
      } catch (stripeError: any) {
        console.error('Error canceling Stripe subscription:', stripeError)
        // Continue with account deletion even if Stripe fails
        // We'll log the error but not block the deletion
      }
    }

    // Step 2: Delete all user's audio files from storage
    try {
      const { data: recordings, error: recordingsError } = await supabase
        .from('recordings')
        .select('storage_path')
        .eq('user_id', user.id)

      if (!recordingsError && recordings && recordings.length > 0) {
        const storagePaths = recordings.map((r: any) => r.storage_path)

        // Delete files from storage
        if (storagePaths.length > 0) {
          const { error: deleteError } = await supabase
            .storage
            .from('recordings')
            .remove(storagePaths)

          if (deleteError) {
            console.error('Error deleting storage files:', deleteError)
            // Continue with account deletion - files will be orphaned
          } else {
            console.log(`Deleted ${storagePaths.length} audio files from storage`)
          }
        }
      }
    } catch (storageError: any) {
      console.error('Error cleaning up storage:', storageError)
      // Continue with account deletion
    }

    // Step 3: Delete user from auth
    // This cascades to delete profiles and all related data
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please try again.' },
        { status: 500 }
      )
    }

    // Success - account completely deleted
    return NextResponse.json({
      success: true,
      message: 'Account successfully deleted. All associated data has been removed.'
    })
  } catch (error: any) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}

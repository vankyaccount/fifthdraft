import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type AuthenticatedRequest, AuthService } from '@/lib/auth'
import { db } from '@/lib/db/queries'
import { LocalStorage } from '@/lib/storage/local'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: NextRequest) {
  return withAuth(req, async (authReq: AuthenticatedRequest) => {
    try {
      // Get user profile with subscription info
      const profile = await db.profiles.findById(authReq.user.id)

      if (!profile) {
        console.error('Error fetching profile')
        return NextResponse.json(
          { error: 'Failed to retrieve account information' },
          { status: 500 }
        )
      }

      // Step 1: Cancel Stripe subscription if exists
      if (profile.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(profile.stripe_subscription_id)
          console.log('Stripe subscription canceled:', profile.stripe_subscription_id)
        } catch (stripeError: any) {
          console.error('Error canceling Stripe subscription:', stripeError)
          // Continue with account deletion even if Stripe fails
        }
      }

      // Step 2: Delete all user's audio files from storage
      try {
        const recordings = await db.recordings.findByUserId(authReq.user.id)

        if (recordings && recordings.length > 0) {
          const storagePaths = recordings.map((r) => r.storage_path)

          // Delete files from local storage
          if (storagePaths.length > 0) {
            const { deleted, errors: deleteErrors } = await LocalStorage.deleteMany(storagePaths)

            if (deleteErrors.length > 0) {
              console.error('Error deleting storage files:', deleteErrors)
            } else {
              console.log(`Deleted ${deleted} audio files from storage`)
            }
          }
        }
      } catch (storageError: any) {
        console.error('Error cleaning up storage:', storageError)
        // Continue with account deletion
      }

      // Step 3: Delete user account and all related data
      // This cascades to delete profiles and all related data via foreign key constraints
      await AuthService.deleteAccount(authReq.user.id)

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
  })
}

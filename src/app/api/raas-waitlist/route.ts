import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/queries'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const result = await getCurrentUser()

    if (!result.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { company, use_case, expected_volume, feedback } = body

    // Insert into raas_waitlist table
    const { data: waitlistEntry, error: insertError } = await db.query(`
      INSERT INTO raas_waitlist (
        user_id, email, company, use_case, expected_volume, feedback, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id, created_at
    `, [
      result.user.id,
      result.user.email,
      company || null,
      use_case || null,
      expected_volume || null,
      feedback || null
    ])

    if (insertError) {
      console.error('Error inserting waitlist entry:', insertError)
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: result.user.email!,
        subject: 'Welcome to the RAAS Waitlist - FifthDraft',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #4f46e5 50%, #7c3aed 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">You're on the RAAS Waitlist!</h1>
                </div>

                <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
                  <h2 style="color: #111827; margin-top: 0;">Thanks for your interest in Result as a Service</h2>
                  <p style="color: #4b5563; line-height: 1.6;">
                    We're excited to have you on the waitlist for RAAS! We're working hard to bring you automated professional deliverables that transform your meetings and brainstorming sessions into polished, client-ready outputs.
                  </p>

                  <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #4f46e5; margin-top: 0;">What to Expect:</h3>
                    <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
                      <li>Early access to RAAS features (Q2 2026)</li>
                      <li>Special pricing for waitlist members</li>
                      <li>Exclusive beta testing opportunities</li>
                      <li>Priority onboarding and support</li>
                    </ul>
                  </div>

                  ${use_case ? `
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #4f46e5; margin-top: 0;">Your Use Case:</h3>
                      <p style="color: #4b5563; margin: 0;">${use_case}</p>
                    </div>
                  ` : ''}

                  <p style="color: #4b5563; line-height: 1.6;">
                    We'll keep you updated on our progress and reach out when RAAS is ready for you to try. In the meantime, explore FifthDraft's Pro features including Idea Studio!
                  </p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fifthdraft.ai'}/dashboard" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Go to Dashboard
                  </a>
                </div>

                <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                    FifthDraft - Transform Conversations into Results
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
                    Questions? Reply to this email or contact <a href="mailto:support@fifthdraft.ai" style="color: #4f46e5;">support@fifthdraft.ai</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    // Send notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'support@fifthdraft.ai'
      await sendEmail({
        to: adminEmail,
        subject: 'New RAAS Waitlist Entry',
        html: `
          <h2>New RAAS Waitlist Entry</h2>
          <p><strong>Email:</strong> ${result.user.email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          ${use_case ? `<p><strong>Use Case:</strong> ${use_case}</p>` : ''}
          ${expected_volume ? `<p><strong>Expected Volume:</strong> ${expected_volume}</p>` : ''}
          ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
          <p><strong>Signed up:</strong> ${new Date().toLocaleString()}</p>
        `,
      })
    } catch (adminEmailError) {
      console.error('Error sending admin notification:', adminEmailError)
      // Don't fail the request if admin email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined RAAS waitlist'
    })

  } catch (error) {
    console.error('RAAS waitlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

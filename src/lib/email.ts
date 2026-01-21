// Email service using Resend
// To set up: npm install resend
// Add RESEND_API_KEY to your environment variables

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

interface EmailResult {
  success: boolean
  error?: string
}

// Check if Resend is available (optional dependency)
let Resend: any = null
try {
  Resend = require('resend').Resend
} catch {
  // Resend not installed - will use console logging fallback
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const fromAddress = from || process.env.EMAIL_FROM || 'FifthDraft <noreply@fifthdraft.com>'

  // If no API key or Resend not installed, log and return success (for development)
  if (!apiKey || !Resend) {
    console.log('=== EMAIL (Dev Mode - No Resend configured) ===')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`From: ${fromAddress}`)
    console.log('HTML:', html.substring(0, 200) + '...')
    console.log('==============================================')

    // Return success in dev mode so auth flow works
    return { success: true }
  }

  try {
    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to FifthDraft!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">FifthDraft</h1>
          </div>

          <h2 style="color: #1F2937;">Welcome${name ? `, ${name}` : ''}!</h2>

          <p>Thanks for joining FifthDraft - your AI-powered note-taking companion.</p>

          <p>Here's what you can do:</p>
          <ul style="padding-left: 20px;">
            <li><strong>Meeting Notes:</strong> Record meetings and get structured notes with action items</li>
            <li><strong>Idea Studio:</strong> Transform brainstorming sessions into organized insights</li>
            <li><strong>Export:</strong> Download your notes as Markdown, PDF, or DOCX</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fifthdraft.com'}/dashboard"
               style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Go to Dashboard
            </a>
          </div>

          <p>Your free tier includes 30 minutes/month. Need more? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fifthdraft.com'}/pricing" style="color: #4F46E5;">Upgrade to Pro</a> for 2000 minutes and Idea Studio features.</p>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

          <p style="color: #6B7280; font-size: 14px;">
            Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fifthdraft.com'}/help" style="color: #4F46E5;">Help Center</a>.
          </p>

          <p style="color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} FifthDraft. All rights reserved.
          </p>
        </body>
      </html>
    `
  }),

  passwordReset: (resetUrl: string) => ({
    subject: 'Reset Your FifthDraft Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">FifthDraft</h1>
          </div>

          <h2 style="color: #1F2937;">Reset Your Password</h2>

          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Reset Password
            </a>
          </div>

          <p style="color: #6B7280; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>

          <p style="color: #6B7280; font-size: 14px;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <a href="${resetUrl}" style="color: #4F46E5; word-break: break-all;">${resetUrl}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

          <p style="color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} FifthDraft. All rights reserved.
          </p>
        </body>
      </html>
    `
  }),

  subscriptionConfirmation: (tier: string) => ({
    subject: `Welcome to FifthDraft ${tier}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">FifthDraft</h1>
          </div>

          <h2 style="color: #1F2937;">You're now on ${tier}!</h2>

          <p>Thank you for upgrading! Your account has been upgraded and you now have access to:</p>

          <ul style="padding-left: 20px;">
            <li>2000 minutes/month of recording time</li>
            <li>Idea Studio with AI Research Assistant</li>
            <li>Project Brief Generator</li>
            <li>Mind Map visualizations</li>
            <li>System audio capture</li>
            <li>File uploads up to 120MB</li>
            <li>Lifetime transcript retention</li>
            <li>Export to all formats (MD, PDF, DOCX)</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fifthdraft.com'}/dashboard"
               style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Start Using Pro Features
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

          <p style="color: #6B7280; font-size: 14px;">
            Manage your subscription anytime from <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fifthdraft.com'}/dashboard/settings" style="color: #4F46E5;">Settings</a>.
          </p>

          <p style="color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} FifthDraft. All rights reserved.
          </p>
        </body>
      </html>
    `
  }),
}

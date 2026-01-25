// Email service using Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'FifthDraft <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Email service config:', {
        hasApiKey: !!process.env.RESEND_API_KEY,
        fromEmail: FROM_EMAIL,
        toEmail: to,
        subject,
      });

      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured - email not sent');
        return { success: false, error: 'Email service not configured' };
      }

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });

      console.log('Email sent successfully:', { to, subject, id: result.data?.id });
      return { success: true };
    } catch (error: unknown) {
      console.error('Email send error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        to,
        subject,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }

  static async sendVerificationEmail(email: string, token: string): Promise<{ success: boolean; error?: string }> {
    const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            .link { color: #6366f1; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">FifthDraft</div>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thanks for signing up! Please click the button below to verify your email address and activate your account.</p>
              <p style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </p>
              <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span class="link">${verifyUrl}</span>
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't create an account with FifthDraft, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>FifthDraft - Transform voice to polished notes</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your FifthDraft account',
      html,
    });
  }

  static async sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean; error?: string }> {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            .link { color: #6366f1; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">FifthDraft</div>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password.</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span class="link">${resetUrl}</span>
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>FifthDraft - Transform voice to polished notes</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your FifthDraft password',
      html,
    });
  }
}

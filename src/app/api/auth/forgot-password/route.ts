import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper to create redirect URL (handles reverse proxy)
function createRedirectUrl(req: NextRequest, path: string): URL {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost) {
    return new URL(path, `${forwardedProto}://${forwardedHost}`);
  }
  return new URL(path, req.url);
}

export async function POST(req: NextRequest) {
  try {
    // Check if this is a form submission or JSON request
    const contentType = req.headers.get('content-type') || '';
    let email: string;
    let isFormSubmission = false;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Form submission - parse form data
      const formData = await req.formData();
      email = formData.get('email') as string;
      isFormSubmission = true;
    } else {
      // JSON request
      const body = await req.json();
      email = body.email;
    }

    if (!email) {
      if (isFormSubmission) {
        const redirectUrl = createRedirectUrl(req, `/forgot-password?error=${encodeURIComponent('Email is required')}`);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to not reveal if email exists
    await AuthService.requestPasswordReset(email);

    if (isFormSubmission) {
      // For form submission, redirect to success page
      const redirectUrl = createRedirectUrl(req, `/forgot-password?success=true&email=${encodeURIComponent(email)}`);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password route error:', error);

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // For form submission, redirect with error
      const redirectUrl = createRedirectUrl(req, `/forgot-password?error=${encodeURIComponent('Internal server error')}`);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

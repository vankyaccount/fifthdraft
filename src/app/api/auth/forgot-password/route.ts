import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

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
        // Check for proxy headers to determine the correct host for redirect
        const forwardedHost = req.headers.get('x-forwarded-host');
        const forwardedProto = req.headers.get('x-forwarded-proto');

        let redirectUrl = `/forgot-password?error=${encodeURIComponent('Email is required')}`;
        if (forwardedHost && forwardedProto) {
          redirectUrl = `${forwardedProto}://${forwardedHost}/forgot-password?error=${encodeURIComponent('Email is required')}`;
        }

        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to not reveal if email exists
    await AuthService.requestPasswordReset(email);

    if (isFormSubmission) {
      // For form submission, redirect to success page
      // Check for proxy headers to determine the correct host
      const forwardedHost = req.headers.get('x-forwarded-host');
      const forwardedProto = req.headers.get('x-forwarded-proto');

      let redirectUrl = `/forgot-password?success=true&email=${encodeURIComponent(email)}`;
      if (forwardedHost && forwardedProto) {
        redirectUrl = `${forwardedProto}://${forwardedHost}/forgot-password?success=true&email=${encodeURIComponent(email)}`;
      }

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
      const forwardedHost = req.headers.get('x-forwarded-host');
      const forwardedProto = req.headers.get('x-forwarded-proto');

      let redirectUrl = `/forgot-password?error=${encodeURIComponent('Internal server error')}`;
      if (forwardedHost && forwardedProto) {
        redirectUrl = `${forwardedProto}://${forwardedHost}/forgot-password?error=${encodeURIComponent('Internal server error')}`;
      }

      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

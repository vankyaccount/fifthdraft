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
    let password: string;
    let fullName: string;
    let isFormSubmission = false;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Form submission - parse form data
      const formData = await req.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
      fullName = formData.get('fullName') as string || '';
      isFormSubmission = true;
    } else {
      // JSON request
      const body = await req.json();
      email = body.email;
      password = body.password;
      fullName = body.fullName || '';
    }

    console.log('Signup attempt:', { email, hasPassword: !!password, fullName });

    if (!email || !password) {
      if (isFormSubmission) {
        const redirectUrl = createRedirectUrl(req, `/signup?error=${encodeURIComponent('Email and password are required')}`);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      if (isFormSubmission) {
        const redirectUrl = createRedirectUrl(req, `/signup?error=${encodeURIComponent('Password must be at least 6 characters')}`);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const result = await AuthService.signUp(email, password, fullName);

    if (result.error) {
      console.error('Signup failed:', { email, error: result.error });
      if (isFormSubmission) {
        const redirectUrl = createRedirectUrl(req, `/signup?error=${encodeURIComponent(result.error)}`);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    console.log('Signup successful:', { email, userId: result.userId });

    if (isFormSubmission) {
      // For form submission, redirect appropriately
      const path = result.needsVerification
        ? `/verify-email?email=${encodeURIComponent(email)}`
        : '/onboarding';
      const redirectUrl = createRedirectUrl(req, path);
      return NextResponse.redirect(redirectUrl);
    } else {
      // For JSON request, return JSON response
      return NextResponse.json({
        success: true,
        needsVerification: result.needsVerification,
      });
    }
  } catch (error) {
    console.error('Signup route error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // For form submission, redirect with error
      const redirectUrl = createRedirectUrl(req, `/signup?error=${encodeURIComponent('Internal server error')}`);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

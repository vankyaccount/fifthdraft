import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

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
        // Check for proxy headers to determine the correct host for redirect
        const forwardedHost = req.headers.get('x-forwarded-host');
        const forwardedProto = req.headers.get('x-forwarded-proto');

        let redirectUrl = `/signup?error=${encodeURIComponent('Email and password are required')}`;
        if (forwardedHost && forwardedProto) {
          redirectUrl = `${forwardedProto}://${forwardedHost}/signup?error=${encodeURIComponent('Email and password are required')}`;
        }

        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      if (isFormSubmission) {
        // Check for proxy headers to determine the correct host for redirect
        const forwardedHost = req.headers.get('x-forwarded-host');
        const forwardedProto = req.headers.get('x-forwarded-proto');

        let redirectUrl = `/signup?error=${encodeURIComponent('Password must be at least 6 characters')}`;
        if (forwardedHost && forwardedProto) {
          redirectUrl = `${forwardedProto}://${forwardedHost}/signup?error=${encodeURIComponent('Password must be at least 6 characters')}`;
        }

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
        // Check for proxy headers to determine the correct host for redirect
        const forwardedHost = req.headers.get('x-forwarded-host');
        const forwardedProto = req.headers.get('x-forwarded-proto');

        let redirectUrl = `/signup?error=${encodeURIComponent(result.error)}`;
        if (forwardedHost && forwardedProto) {
          redirectUrl = `${forwardedProto}://${forwardedHost}/signup?error=${encodeURIComponent(result.error)}`;
        }

        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    console.log('Signup successful:', { email, userId: result.userId });

    if (isFormSubmission) {
      // For form submission, redirect appropriately
      // Check for proxy headers to determine the correct host
      const forwardedHost = req.headers.get('x-forwarded-host');
      const forwardedProto = req.headers.get('x-forwarded-proto');

      let redirectUrl = result.needsVerification
        ? `/verify-email?email=${encodeURIComponent(email)}`
        : '/onboarding';

      if (forwardedHost && forwardedProto) {
        redirectUrl = `${forwardedProto}://${forwardedHost}${redirectUrl}`;
      }

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
      const forwardedHost = req.headers.get('x-forwarded-host');
      const forwardedProto = req.headers.get('x-forwarded-proto');

      let redirectUrl = `/signup?error=${encodeURIComponent('Internal server error')}`;
      if (forwardedHost && forwardedProto) {
        redirectUrl = `${forwardedProto}://${forwardedHost}/signup?error=${encodeURIComponent('Internal server error')}`;
      }

      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

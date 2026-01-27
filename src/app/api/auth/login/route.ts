import { NextRequest, NextResponse } from 'next/server';
import { AuthService, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  console.log('Login API called');

  try {
    // Check if this is a form submission or JSON request
    const contentType = req.headers.get('content-type') || '';
    let email: string;
    let password: string;
    let isFormSubmission = false;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Form submission - parse form data
      const formData = await req.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
      isFormSubmission = true;
      console.log('Login via form submission');
    } else {
      // JSON request
      const body = await req.json();
      email = body.email;
      password = body.password;
      console.log('Login via JSON');
    }

    console.log('Login attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      if (isFormSubmission) {
        // Check for proxy headers to determine the correct host for redirect
        const forwardedHost = req.headers.get('x-forwarded-host');
        const forwardedProto = req.headers.get('x-forwarded-proto');

        let redirectUrl = `/login?error=${encodeURIComponent('Email and password are required')}`;
        if (forwardedHost && forwardedProto) {
          redirectUrl = `${forwardedProto}://${forwardedHost}/login?error=${encodeURIComponent('Email and password are required')}`;
        }

        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await AuthService.login(email, password);

    if (result.error) {
      console.log('Login failed:', { email, error: result.error });
      if (isFormSubmission) {
        // Check for proxy headers to determine the correct host for redirect
        const forwardedHost = req.headers.get('x-forwarded-host');
        const forwardedProto = req.headers.get('x-forwarded-proto');

        let redirectUrl = `/login?error=${encodeURIComponent(result.error)}`;
        if (forwardedHost && forwardedProto) {
          redirectUrl = `${forwardedProto}://${forwardedHost}/login?error=${encodeURIComponent(result.error)}`;
        }

        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    console.log('Login successful:', { email, userId: result.user?.id });

    if (isFormSubmission) {
      // For form submission, redirect to dashboard with cookies set
      // Check for proxy headers to determine the correct host
      const forwardedHost = req.headers.get('x-forwarded-host');
      const forwardedProto = req.headers.get('x-forwarded-proto');

      let redirectUrl = '/dashboard';
      if (forwardedHost && forwardedProto) {
        // Construct the redirect URL using the original host
        redirectUrl = `${forwardedProto}://${forwardedHost}/dashboard`;
      } else {
        // Fallback to relative redirect
        redirectUrl = '/dashboard';
      }

      const response = NextResponse.redirect(redirectUrl);
      if (result.tokens) {
        setAuthCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
        console.log('Auth cookies set on redirect for user:', email);
      }
      return response;
    } else {
      // For JSON request, return JSON response with cookies
      const response = NextResponse.json({ user: result.user, success: true });
      if (result.tokens) {
        setAuthCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
        console.log('Auth cookies set for user:', email);
      }
      return response;
    }
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

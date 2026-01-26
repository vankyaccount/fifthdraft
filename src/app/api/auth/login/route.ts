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
        return NextResponse.redirect(new URL('/login?error=Email and password are required', req.url));
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
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(result.error)}`, req.url));
      }
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    console.log('Login successful:', { email, userId: result.user?.id });

    if (isFormSubmission) {
      // For form submission, redirect to dashboard with cookies set
      const response = NextResponse.redirect(new URL('/dashboard', req.url));
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

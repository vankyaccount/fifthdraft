import { NextRequest, NextResponse } from 'next/server';
import { AuthService, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  console.log('Login API called');
  try {
    const { email, password } = await req.json();
    console.log('Login attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await AuthService.login(email, password);

    if (result.error) {
      console.log('Login failed:', { email, error: result.error });
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    console.log('Login successful:', { email, userId: result.user?.id });
    const response = NextResponse.json({ user: result.user });

    // Set auth cookies
    if (result.tokens) {
      setAuthCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
      console.log('Auth cookies set for user:', email);
    }

    return response;
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

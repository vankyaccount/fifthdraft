import { NextRequest, NextResponse } from 'next/server';
import { AuthService, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await AuthService.login(email, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({ user: result.user });

    // Set auth cookies
    if (result.tokens) {
      setAuthCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
    }

    return response;
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

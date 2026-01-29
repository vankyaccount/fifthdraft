import { NextRequest, NextResponse } from 'next/server';
import { AuthService, setAuthCookies } from '@/lib/auth';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const result = await AuthService.refreshTokens(refreshToken);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({ user: result.user });

    // Set new auth cookies
    if (result.tokens) {
      setAuthCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
    }

    return response;
  } catch (error) {
    console.error('Refresh token route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

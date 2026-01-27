import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { setAuthCookies } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  console.log('Verify email GET called');
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    console.log('Verify email token (GET):', token ? `${token.substring(0, 8)}...` : 'none');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const result = await AuthService.verifyEmail(token);

    if (!result.success) {
      console.log('Verify email failed (GET):', result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    console.log('Verify email successful (GET):', result.userId);

    // Get user info to generate tokens
    const user = await AuthService.getUserById(result.userId!);
    if (!user) {
      return NextResponse.json({ error: 'User not found after verification' }, { status: 400 });
    }

    // Generate tokens for the verified user
    const tokens = AuthService.generateTokens(user.id, user.email);

    // Create response and set auth cookies
    // For direct email link access, return a simple HTML page that redirects
    // This ensures cookies are set and the browser redirects properly
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verified</title>
        </head>
        <body>
          <p>Email verified successfully! Redirecting to dashboard...</p>
          <script>
            // Wait a moment to ensure cookies are set, then redirect
            setTimeout(() => {
              window.location.href = '/verify-success?verified=true';
            }, 1000);
          </script>
        </body>
      </html>
    `;

    const response = new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

    setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

    console.log('Auth cookies set after email verification for user:', user.email);

    return response;
  } catch (error) {
    console.error('Verify email route error (GET):', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('Verify email POST called');
  try {
    const { token } = await req.json();
    console.log('Verify email token (POST):', token ? `${token.substring(0, 8)}...` : 'none');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const result = await AuthService.verifyEmail(token);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Get user info to generate tokens
    const user = await AuthService.getUserById(result.userId!);
    if (!user) {
      return NextResponse.json({ error: 'User not found after verification' }, { status: 400 });
    }

    // Generate tokens for the verified user
    const tokens = AuthService.generateTokens(user.id, user.email);

    // Create response and set auth cookies
    // For POST requests, return JSON but client should handle redirect appropriately
    const response = NextResponse.json({ success: true, userId: result.userId, redirect: '/verify-success?verified=true' });
    setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

    console.log('Auth cookies set after email verification for user:', user.email);

    return response;
  } catch (error) {
    console.error('Verify email route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

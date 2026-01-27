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
      // Return a proper HTML page with error message
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Email Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9fafb; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; }
              .error-icon { font-size: 3rem; color: #ef4444; margin-bottom: 1rem; }
              h1 { color: #dc2626; margin-bottom: 1rem; }
              p { color: #6b7280; margin-bottom: 1.5rem; }
              a { display: inline-block; background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; }
              a:hover { background-color: #4338ca; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">❌</div>
              <h1>Verification Failed</h1>
              <p>No verification token provided. Please check your email link.</p>
              <a href="/login">Go to Login</a>
            </div>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const result = await AuthService.verifyEmail(token);

    if (!result.success) {
      console.log('Verify email failed (GET):', result.error);

      // Return a proper HTML page with error message
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Email Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9fafb; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; }
              .error-icon { font-size: 3rem; color: #ef4444; margin-bottom: 1rem; }
              h1 { color: #dc2626; margin-bottom: 1rem; }
              p { color: #6b7280; margin-bottom: 1.5rem; }
              a { display: inline-block; background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; }
              a:hover { background-color: #4338ca; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">❌</div>
              <h1>Verification Failed</h1>
              <p>${result.error || 'Invalid or expired verification token'}</p>
              <a href="/login">Go to Login</a>
            </div>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    console.log('Verify email successful (GET):', result.userId);

    // Get user info to generate tokens
    const user = await AuthService.getUserById(result.userId!);
    if (!user) {
      // Return a proper HTML page with error message
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Email Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9fafb; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; }
              .error-icon { font-size: 3rem; color: #ef4444; margin-bottom: 1rem; }
              h1 { color: #dc2626; margin-bottom: 1rem; }
              p { color: #6b7280; margin-bottom: 1.5rem; }
              a { display: inline-block; background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; }
              a:hover { background-color: #4338ca; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">❌</div>
              <h1>Verification Failed</h1>
              <p>User not found after verification</p>
              <a href="/login">Go to Login</a>
            </div>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
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
          <meta http-equiv="refresh" content="2;url=/verify-success?verified=true">
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9fafb; }
            .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; }
            .success-icon { font-size: 3rem; color: #10b981; margin-bottom: 1rem; }
            h1 { color: #059669; margin-bottom: 1rem; }
            p { color: #6b7280; margin-bottom: 1.5rem; }
            .loader { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top: 4px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Email Verified!</h1>
            <div class="loader"></div>
            <p>Your email has been verified successfully. Redirecting to dashboard...</p>
            <p>If you're not redirected automatically, <a href="/verify-success?verified=true">click here</a>.</p>
          </div>
          <script>
            // Wait a moment to ensure cookies are set, then redirect
            setTimeout(() => {
              window.location.href = '/verify-success?verified=true';
            }, 2000);
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

    // Return a proper HTML page with error message
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Server Error</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9fafb; }
            .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; }
            .error-icon { font-size: 3rem; color: #ef4444; margin-bottom: 1rem; }
            h1 { color: #dc2626; margin-bottom: 1rem; }
            p { color: #6b7280; margin-bottom: 1.5rem; }
            a { display: inline-block; background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; }
            a:hover { background-color: #4338ca; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">❌</div>
            <h1>Server Error</h1>
            <p>An error occurred during email verification. Please try again later.</p>
            <a href="/login">Go to Login</a>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
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

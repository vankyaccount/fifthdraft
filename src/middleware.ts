// Edge-compatible middleware for JWT authentication
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Get JWT secret as Uint8Array for jose
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  return new TextEncoder().encode(secret);
};

interface UserPayload {
  sub: string;
  email: string;
  email_verified: boolean;
}

async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.type !== 'access') {
      console.log('Middleware: Token type mismatch, expected access, got:', payload.type);
      return null;
    }
    console.log('Middleware: Token verification successful for user:', payload.sub);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      email_verified: payload.email_verified as boolean,
    };
  } catch (error) {
    console.log('Middleware: Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}


export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Debug logging for protected routes
  if (pathname.startsWith('/dashboard') || pathname.includes('verify-email') || pathname.includes('verify-success')) {
    const allCookies = request.cookies.getAll();
    console.log('Middleware:', {
      pathname,
      hasAccessToken: !!accessToken,
      tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'none',
      allCookies: allCookies.map(c => ({ name: c.name, valuePresent: !!c.value })),
      cookieHeader: request.headers.get('cookie'), // This shows the raw cookie header
      url: request.url,
      headers: {
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        'user-agent': request.headers.get('user-agent'),
      },
    });
  }

  let user: UserPayload | null = null;
  if (accessToken) {
    user = await verifyToken(accessToken);
  }

  // Helper function to create redirect URL properly
  const createRedirectUrl = (path: string): URL => {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

    if (forwardedHost) {
      // Behind a proxy - construct full URL with forwarded headers
      return new URL(path, `${forwardedProto}://${forwardedHost}`);
    }
    // Direct access - use request URL as base
    return new URL(path, request.url);
  };

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      console.log('Middleware: Redirecting to /login - no authenticated user, hasToken:', !!accessToken);
      return NextResponse.redirect(createRedirectUrl('/login'));
    }

    // Check if user's email is verified
    // Allow bypassing email verification for development/testing
    const bypassEmailVerification = process.env.BYPASS_EMAIL_VERIFICATION === 'true';
    if (!bypassEmailVerification && !user.email_verified) {
      console.log('Middleware: User email not verified, redirecting to /unverified');
      return NextResponse.redirect(createRedirectUrl('/unverified'));
    }

    console.log('Middleware: User authenticated for dashboard:', user.email);
  }

  // Redirect authenticated users away from auth pages (except reset-password and unverified)
  if (
    (pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/forgot-password')) &&
    user
  ) {
    console.log('Middleware: Redirecting authenticated user to /dashboard');
    return NextResponse.redirect(createRedirectUrl('/dashboard'));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-success',
    '/unverified',
  ],
};

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

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      console.log('Middleware: Redirecting to /login - no authenticated user, hasToken:', !!accessToken);
      // Check for proxy headers to determine the correct host
      const forwardedHost = request.headers.get('x-forwarded-host');
      const forwardedProto = request.headers.get('x-forwarded-proto');

      let redirectUrl = '/login';
      if (forwardedHost && forwardedProto) {
        // Construct the redirect URL using the original host
        redirectUrl = `${forwardedProto}://${forwardedHost}/login`;
      } else {
        // Fallback to relative redirect
        redirectUrl = '/login';
      }
      return NextResponse.redirect(redirectUrl);
    }
    console.log('Middleware: User authenticated for dashboard:', user.email);
  }

  // Redirect authenticated users away from auth pages (except reset-password)
  if (
    (pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/forgot-password')) &&
    user
  ) {
    console.log('Middleware: Redirecting authenticated user to /dashboard');
    // Check for proxy headers to determine the correct host
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto');

    let redirectUrl = '/dashboard';
    if (forwardedHost && forwardedProto) {
      // Construct the redirect URL using the original host
      redirectUrl = `${forwardedProto}://${forwardedHost}/dashboard`;
    } else {
      // Fallback to relative redirect
      redirectUrl = '/dashboard';
    }
    return NextResponse.redirect(redirectUrl);
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
  ],
};

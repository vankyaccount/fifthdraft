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
    if (payload.type !== 'access') return null;
    return {
      sub: payload.sub as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  let user: UserPayload | null = null;
  if (accessToken) {
    user = await verifyToken(accessToken);
  }

  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      console.log('Middleware: Redirecting to /login - no authenticated user');
      return NextResponse.redirect(new URL('/login', request.url));
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
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
  ],
};

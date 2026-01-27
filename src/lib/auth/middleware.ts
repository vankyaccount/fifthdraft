// Auth middleware for API routes
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './service';
import { query } from '@/lib/db/postgres';
import type { Profile } from './types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  email_verified: boolean;
}

// Extend NextRequest to include authenticated user
export interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser;
}

// Get token from request (cookie or header)
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Try cookie
  return request.cookies.get('access_token')?.value || null;
}

// Auth middleware wrapper for API routes
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = AuthService.verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Attach user to request
  const authenticatedRequest = request as AuthenticatedRequest;
  authenticatedRequest.user = {
    id: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified,
  };

  return handler(authenticatedRequest);
}

// Optional auth - doesn't fail if not authenticated
export async function withOptionalAuth(
  request: NextRequest,
  handler: (req: NextRequest, user: AuthenticatedUser | null) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = getTokenFromRequest(request);

  let user: AuthenticatedUser | null = null;

  if (token) {
    const payload = AuthService.verifyAccessToken(token);
    if (payload) {
      user = {
        id: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified,
      };
    }
  }

  return handler(request, user);
}

// Get user profile for authenticated user
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const result = await query<Profile>(
      'SELECT * FROM profiles WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Get user from cookies (for server components)
export async function getServerUser(cookies: {
  get: (name: string) => { value: string } | undefined;
}): Promise<AuthenticatedUser | null> {
  const token = cookies.get('access_token')?.value;
  if (!token) return null;

  const payload = AuthService.verifyAccessToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified,
  };
}

// Get user with profile from cookies (for server components)
export async function getServerUserWithProfile(cookies: {
  get: (name: string) => { value: string } | undefined;
}): Promise<{ user: AuthenticatedUser; profile: Profile } | null> {
  const user = await getServerUser(cookies);
  if (!user) return null;

  const profile = await getUserProfile(user.id);
  if (!profile) return null;

  return { user, profile };
}

// Cookie options for auth tokens
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  // Only use secure cookies when actually on HTTPS
  // For HTTP environments (no SSL certificate), secure must be false
  secure: process.env.AUTH_COOKIE_SECURE
          ? process.env.AUTH_COOKIE_SECURE === 'true'
          : false, // Changed from checking NODE_ENV to defaulting to false for HTTP environments
  // Use 'lax' for same-site requests in HTTP environments
  // 'none' requires secure=true (HTTPS), so we avoid it when not on HTTPS
  sameSite: process.env.AUTH_COOKIE_SAMESITE
            ? process.env.AUTH_COOKIE_SAMESITE as 'strict' | 'lax' | 'none'
            : 'lax' as const, // Changed to default to 'lax' for HTTP environments
  path: '/',
};

// Set auth cookies on response
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  // Debug: Log cookie options
  const accessCookieOptions = {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes
  };
  const refreshCookieOptions = {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  };

  console.log('Setting cookies with options:', {
    secure: AUTH_COOKIE_OPTIONS.secure,
    sameSite: AUTH_COOKIE_OPTIONS.sameSite,
    path: AUTH_COOKIE_OPTIONS.path,
    nodeEnv: process.env.NODE_ENV,
    authCookieSecure: process.env.AUTH_COOKIE_SECURE,
    authCookieSameSite: process.env.AUTH_COOKIE_SAMESITE,
  });

  response.cookies.set('access_token', accessToken, accessCookieOptions);
  response.cookies.set('refresh_token', refreshToken, refreshCookieOptions);

  // Debug: Log the Set-Cookie headers that will be sent
  const setCookieHeaders = response.headers.getSetCookie();
  console.log('Set-Cookie headers after setting:', setCookieHeaders.length > 0 ? setCookieHeaders.map(h => h.split(';')[0]) : 'NONE - cookies may not be set correctly');
}

// Clear auth cookies on response
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
}

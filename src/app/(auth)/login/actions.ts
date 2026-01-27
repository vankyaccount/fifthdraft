'use server';

import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth';

const COOKIE_OPTIONS = {
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

export async function loginAction(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Login action called for:', email);

    const result = await AuthService.login(email, password);

    if (result.error) {
      console.log('Login action failed:', result.error);
      return { success: false, error: result.error };
    }

    if (!result.tokens) {
      console.log('Login action: No tokens returned');
      return { success: false, error: 'Authentication failed' };
    }

    // For consistency with API routes, we'll redirect to set cookies properly
    // Server actions cookies might not propagate properly in all deployment scenarios
    // So we'll return success and let the client handle the redirect/set cookies

    // Actually, let's try a different approach - directly return success
    // The cookies should be set properly with the updated options
    const cookieStore = await cookies();

    cookieStore.set('access_token', result.tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
    });

    cookieStore.set('refresh_token', result.tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log('Login action successful, cookies set for:', email);
    return { success: true };
  } catch (error) {
    console.error('Login action error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

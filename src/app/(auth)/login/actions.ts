'use server';

import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
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

    // Set cookies using next/headers - this is the reliable way in Next.js
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

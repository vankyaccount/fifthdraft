import { NextRequest, NextResponse } from 'next/server';
import { AuthService, getTokenFromRequest, getUserProfile } from '@/lib/auth';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = AuthService.verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get user from auth table
    const user = await AuthService.getUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user profile
    const profile = await getUserProfile(payload.sub);

    return NextResponse.json({
      user,
      profile,
    });
  } catch (error) {
    console.error('Me route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

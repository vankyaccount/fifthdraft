import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const result = await AuthService.verifyEmail(token);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: result.userId });
  } catch (error) {
    console.error('Verify email route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

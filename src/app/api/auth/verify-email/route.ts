import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

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
    return NextResponse.json({ success: true, userId: result.userId });
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

    return NextResponse.json({ success: true, userId: result.userId });
  } catch (error) {
    console.error('Verify email route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

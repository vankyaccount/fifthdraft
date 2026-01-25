import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    console.log('Signup attempt:', { email, hasPassword: !!password, fullName });

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const result = await AuthService.signUp(email, password, fullName || '');

    if (result.error) {
      console.error('Signup failed:', { email, error: result.error });
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    console.log('Signup successful:', { email, userId: result.userId });
    return NextResponse.json({
      success: true,
      needsVerification: result.needsVerification,
    });
  } catch (error) {
    console.error('Signup route error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

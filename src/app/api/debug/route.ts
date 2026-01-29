import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to test different parts of the auth system
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  // Test 1: Basic response
  results.tests = { ...results.tests as object, basic: 'ok' };

  // Test 2: Check imports one by one
  try {
    // Test database connection
    const { pool } = await import('@/lib/db');
    const dbResult = await pool.query('SELECT 1 as test');
    results.tests = { ...results.tests as object, database: dbResult.rows[0]?.test === 1 ? 'ok' : 'failed' };
  } catch (error) {
    results.tests = { ...results.tests as object, database: `error: ${error instanceof Error ? error.message : 'unknown'}` };
  }

  // Test 3: Check AuthService import
  try {
    const { AuthService } = await import('@/lib/auth');
    results.tests = { ...results.tests as object, authServiceImport: 'ok' };

    // Test if generateTokens works (doesn't need DB)
    const testTokens = AuthService.generateTokens('test-id', 'test@test.com', true);
    results.tests = { ...results.tests as object, tokenGeneration: testTokens.accessToken ? 'ok' : 'failed' };
  } catch (error) {
    results.tests = { ...results.tests as object, authService: `error: ${error instanceof Error ? error.message : 'unknown'}` };
  }

  // Test 4: Check middleware import
  try {
    const { setAuthCookies } = await import('@/lib/auth/middleware');
    results.tests = { ...results.tests as object, middlewareImport: setAuthCookies ? 'ok' : 'failed' };
  } catch (error) {
    results.tests = { ...results.tests as object, middlewareImport: `error: ${error instanceof Error ? error.message : 'unknown'}` };
  }

  // Test 5: Check Resend import
  try {
    const { EmailService } = await import('@/lib/email/resend');
    results.tests = { ...results.tests as object, emailServiceImport: EmailService ? 'ok' : 'failed' };
  } catch (error) {
    results.tests = { ...results.tests as object, emailServiceImport: `error: ${error instanceof Error ? error.message : 'unknown'}` };
  }

  return NextResponse.json(results);
}

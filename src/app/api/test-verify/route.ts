import { NextRequest, NextResponse } from 'next/server';

// Minimal test endpoint to diagnose verify-email 503 error
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    step: 'start',
  };

  try {
    // Step 1: Check if we can get the token parameter
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    results.step = 'parsed_url';
    results.hasToken = !!token;
    results.tokenPreview = token ? `${token.substring(0, 8)}...` : 'none';

    // Step 2: Test AuthService import
    try {
      const { AuthService } = await import('@/lib/auth');
      results.step = 'auth_imported';
      results.authImported = true;

      // Step 3: Test if verifyEmail can be called (with invalid token, will fail gracefully)
      if (token) {
        try {
          const verifyResult = await AuthService.verifyEmail(token);
          results.step = 'verify_called';
          results.verifyResult = verifyResult;
        } catch (verifyError) {
          results.verifyError = verifyError instanceof Error ? verifyError.message : 'unknown';
        }
      }
    } catch (importError) {
      results.authImportError = importError instanceof Error ? importError.message : 'unknown';
    }

    // Step 4: Test setAuthCookies import
    try {
      const { setAuthCookies } = await import('@/lib/auth/middleware');
      results.setAuthCookiesImported = !!setAuthCookies;
    } catch (importError) {
      results.setAuthCookiesImportError = importError instanceof Error ? importError.message : 'unknown';
    }

    // Step 5: Test HTML response generation (similar to verify-email)
    const htmlTest = `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body><p>Test passed</p></body>
      </html>
    `;
    results.htmlGenerationTest = 'ok';

    // Return JSON for diagnostics
    return NextResponse.json(results);
  } catch (error) {
    results.error = error instanceof Error ? error.message : 'unknown';
    results.stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(results, { status: 500 });
  }
}

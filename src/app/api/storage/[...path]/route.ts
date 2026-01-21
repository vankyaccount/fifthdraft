import { NextRequest, NextResponse } from 'next/server';
import { LocalStorage } from '@/lib/storage/local';
import { getTokenFromRequest, AuthService } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = AuthService.verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { path: pathParts } = await params;
    const storagePath = pathParts.join('/');

    // Verify user owns this file (path starts with their user ID)
    if (!storagePath.startsWith(payload.sub)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Download file
    const { data, error } = await LocalStorage.download(storagePath);

    if (error || !data) {
      return NextResponse.json({ error: error || 'File not found' }, { status: 404 });
    }

    // Get content type
    const contentType = LocalStorage.getContentType(storagePath);

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': data.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Storage route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

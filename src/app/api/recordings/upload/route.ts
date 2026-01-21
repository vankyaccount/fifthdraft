import { NextRequest, NextResponse } from 'next/server';
import { LocalStorage } from '@/lib/storage/local';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth';
import { query } from '@/lib/db/postgres';

export async function POST(req: NextRequest) {
  return withAuth(req, async (authReq: AuthenticatedRequest) => {
    try {
      const formData = await authReq.formData();
      const file = formData.get('file') as File | null;
      const mode = formData.get('mode') as string || 'meeting';
      const whisperMode = formData.get('whisperMode') === 'true';

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Get user profile to check quota
      const profileResult = await query<{
        subscription_tier: string;
        minutes_used: number;
        minutes_quota: number;
      }>(
        'SELECT subscription_tier, minutes_used, minutes_quota FROM profiles WHERE id = $1',
        [authReq.user.id]
      );

      if (profileResult.rows.length === 0) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      const profile = profileResult.rows[0];

      // Check file size limits based on tier
      const fileSizeLimits: Record<string, number> = {
        free: 30 * 1024 * 1024, // 30MB
        pro: 120 * 1024 * 1024, // 120MB
        pro_plus: 240 * 1024 * 1024, // 240MB
        team: 240 * 1024 * 1024, // 240MB
        enterprise: 480 * 1024 * 1024, // 480MB
      };

      const maxFileSize = fileSizeLimits[profile.subscription_tier] || fileSizeLimits.free;

      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `File size exceeds limit of ${maxFileSize / (1024 * 1024)}MB for your plan` },
          { status: 400 }
        );
      }

      // Check quota
      if (profile.minutes_used >= profile.minutes_quota) {
        return NextResponse.json(
          { error: 'Monthly transcription quota exceeded' },
          { status: 403 }
        );
      }

      // Upload file to local storage
      const buffer = Buffer.from(await file.arrayBuffer());
      const { path: storagePath, error: uploadError } = await LocalStorage.upload(
        authReq.user.id,
        file.name,
        buffer,
        file.type
      );

      if (uploadError) {
        return NextResponse.json({ error: uploadError }, { status: 500 });
      }

      // Create recording record
      const recordingResult = await query<{ id: string }>(
        `INSERT INTO recordings (user_id, mode, whisper_mode, storage_path, file_size, duration, mime_type, status, processing_progress, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 0, $6, 'queued', 0, NOW(), NOW())
         RETURNING id`,
        [authReq.user.id, mode, whisperMode, storagePath, file.size, file.type || 'audio/webm']
      );

      const recordingId = recordingResult.rows[0].id;

      return NextResponse.json({
        recordingId,
        storagePath,
        fileSize: file.size,
      });
    } catch (error) {
      console.error('Recording upload error:', error);
      return NextResponse.json({ error: 'Failed to upload recording' }, { status: 500 });
    }
  });
}

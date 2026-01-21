-- Add recording_type column to recordings table
-- This tracks the source of the recording for analytics and features

ALTER TABLE recordings
ADD COLUMN recording_type TEXT DEFAULT 'microphone'
CHECK (recording_type IN ('microphone', 'file_upload', 'system_audio'));

-- Add index for filtering by recording type
CREATE INDEX idx_recordings_type ON recordings(recording_type);

-- Add index for combined queries (user + type)
CREATE INDEX idx_recordings_user_type ON recordings(user_id, recording_type);

-- Update existing recordings to have explicit type
UPDATE recordings
SET recording_type = CASE
  WHEN storage_path LIKE '%.webm' THEN 'microphone'
  WHEN storage_path LIKE '%system%' THEN 'system_audio'
  ELSE 'file_upload'
END
WHERE recording_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN recordings.recording_type IS 'Source of the recording: microphone (browser recording), file_upload (uploaded audio file), system_audio (system + mic capture)';

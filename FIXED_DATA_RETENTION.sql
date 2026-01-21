-- ============================================
-- DATA RETENTION & HELPER FUNCTIONS
-- ============================================

-- ============================================
-- AUDIO CLEANUP FUNCTION (48-hour retention)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_audio()
RETURNS void AS $$
BEGIN
  -- Mark recordings where audio should be deleted (48+ hours old)
  UPDATE public.recordings
  SET audio_deleted_at = NOW()
  WHERE audio_deleted_at IS NULL
  AND created_at < NOW() - INTERVAL '48 hours';

  -- Note: Actual deletion from storage.objects will be done via Edge Function
  -- This function just marks the records
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FREE TIER TRANSCRIPT EXPIRATION (7-day retention)
-- ============================================
CREATE OR REPLACE FUNCTION expire_free_tier_transcripts()
RETURNS void AS $$
BEGIN
  -- Set expiration date for free tier transcripts
  UPDATE public.transcriptions
  SET expires_at = created_at + INTERVAL '7 days'
  WHERE expires_at IS NULL
  AND recording_id IN (
    SELECT r.id FROM public.recordings r
    JOIN public.profiles p ON r.user_id = p.id
    WHERE p.subscription_tier = 'free'
    AND r.created_at < NOW() - INTERVAL '7 days'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTION: Check if transcript is accessible
-- ============================================
CREATE OR REPLACE FUNCTION is_transcript_accessible(transcript_id UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  transcript_expires TIMESTAMPTZ;
  user_tier TEXT;
BEGIN
  -- Get transcript expiration
  SELECT expires_at INTO transcript_expires
  FROM public.transcriptions
  WHERE id = transcript_id;

  -- Get user tier
  SELECT subscription_tier INTO user_tier
  FROM public.profiles p
  JOIN public.recordings r ON p.id = r.user_id
  JOIN public.transcriptions t ON r.id = t.recording_id
  WHERE t.id = transcript_id AND p.id = user_id_param;

  -- Check accessibility
  IF user_tier = 'free' THEN
    RETURN transcript_expires IS NULL OR transcript_expires > NOW();
  ELSE
    -- Paid tiers have lifetime access
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get minutes used in current month
-- ============================================
CREATE OR REPLACE FUNCTION get_monthly_minutes_used(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  total_minutes INTEGER;
BEGIN
  SELECT COALESCE(SUM(units_consumed), 0) INTO total_minutes
  FROM public.usage_logs
  WHERE user_id = user_id_param
  AND resource_type = 'transcription'
  AND created_at >= DATE_TRUNC('month', NOW());

  RETURN total_minutes;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Check if user can process recording
-- ============================================
CREATE OR REPLACE FUNCTION can_process_recording(user_id_param UUID, duration_minutes INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  user_quota INTEGER;
  used_minutes INTEGER;
BEGIN
  -- Get user's quota
  SELECT minutes_quota INTO user_quota
  FROM public.profiles
  WHERE id = user_id_param;

  -- Get monthly usage
  used_minutes := get_monthly_minutes_used(user_id_param);

  -- Check if within quota
  RETURN (used_minutes + duration_minutes) <= user_quota;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

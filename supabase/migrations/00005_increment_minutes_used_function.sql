-- Function to safely increment user's minutes_used
-- This uses atomic increment to avoid race conditions

CREATE OR REPLACE FUNCTION increment_minutes_used(
  user_id UUID,
  minutes INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET minutes_used = COALESCE(minutes_used, 0) + minutes
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_minutes_used(UUID, INTEGER) TO authenticated;

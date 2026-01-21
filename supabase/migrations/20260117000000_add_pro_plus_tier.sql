-- Add Pro+ tier with 4000 minutes/month (waitlist-only, $299/year or $30/month)
-- Pro+ includes: Everything in Pro + early access to new features

-- Step 1: Add 'pro_plus' to subscription_tier enum values
-- Update the CHECK constraint on profiles table
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_subscription_tier_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_tier_check
CHECK (subscription_tier IN ('free', 'pro', 'pro_plus', 'team', 'enterprise'));

-- Step 2: Create pro_plus_waitlist table
CREATE TABLE public.pro_plus_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,

  -- Waitlist metadata
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
  priority_score INTEGER DEFAULT 0,  -- Higher = earlier invite

  -- Reasons for priority (feedback collection)
  feedback TEXT,
  use_case TEXT,
  company TEXT,

  -- Tracking
  position_in_queue INTEGER,  -- Updated periodically
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ,

  -- Unique constraint: one pending entry per user
  UNIQUE (user_id, status) WHERE status = 'pending'
);

-- Create index for efficient waitlist queries
CREATE INDEX idx_pro_plus_waitlist_status ON public.pro_plus_waitlist(status);
CREATE INDEX idx_pro_plus_waitlist_priority ON public.pro_plus_waitlist(priority_score DESC, created_at ASC);
CREATE INDEX idx_pro_plus_waitlist_user_id ON public.pro_plus_waitlist(user_id);

-- Step 3: Update quota function to include pro_plus
CREATE OR REPLACE FUNCTION update_subscription_quota()
RETURNS TRIGGER AS $$
BEGIN
  NEW.minutes_quota = CASE NEW.subscription_tier
    WHEN 'free' THEN 30
    WHEN 'pro' THEN 2000
    WHEN 'pro_plus' THEN 4000
    WHEN 'team' THEN 150
    WHEN 'enterprise' THEN 999999
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Enable RLS on waitlist table
ALTER TABLE public.pro_plus_waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own waitlist entry
CREATE POLICY "Users can view their own pro_plus_waitlist entry"
ON public.pro_plus_waitlist FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins and super_admins can read all waitlist entries
CREATE POLICY "Admins can view all pro_plus_waitlist entries"
ON public.pro_plus_waitlist FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Policy: Admins can update waitlist entries
CREATE POLICY "Admins can update pro_plus_waitlist entries"
ON public.pro_plus_waitlist FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Policy: Users can insert their own entry (handled via API)
CREATE POLICY "Users can insert their own pro_plus_waitlist entry"
ON public.pro_plus_waitlist FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create function to calculate waitlist position
CREATE OR REPLACE FUNCTION get_waitlist_position(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  position INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO position
  FROM public.pro_plus_waitlist
  WHERE status = 'pending'
    AND (priority_score > (
      SELECT priority_score FROM public.pro_plus_waitlist WHERE user_id = $1
    ) OR (
      priority_score = (
        SELECT priority_score FROM public.pro_plus_waitlist WHERE user_id = $1
      ) AND created_at < (
        SELECT created_at FROM public.pro_plus_waitlist WHERE user_id = $1
      )
    ));

  RETURN COALESCE(position, 1);
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to update position_in_queue on waitlist
CREATE OR REPLACE FUNCTION update_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.position_in_queue = get_waitlist_position(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pro_plus_waitlist_position
BEFORE INSERT OR UPDATE ON public.pro_plus_waitlist
FOR EACH ROW
EXECUTE FUNCTION update_waitlist_position();

-- Step 7: Add conversion timestamp trigger
CREATE OR REPLACE FUNCTION update_pro_plus_conversion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pro_plus_conversion_timestamp
BEFORE UPDATE ON public.pro_plus_waitlist
FOR EACH ROW
WHEN (NEW.status = 'converted')
EXECUTE FUNCTION update_pro_plus_conversion();

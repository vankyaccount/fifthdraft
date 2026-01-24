-- RAAS Waitlist Table
-- This table stores users who have signed up for the RAAS (Result as a Service) waitlist

CREATE TABLE IF NOT EXISTS raas_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company TEXT,
  use_case TEXT,
  expected_volume TEXT,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'contacted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_raas_waitlist_user_id ON raas_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_raas_waitlist_status ON raas_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_raas_waitlist_created ON raas_waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_raas_waitlist_email ON raas_waitlist(email);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_raas_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER raas_waitlist_updated_at
  BEFORE UPDATE ON raas_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_raas_waitlist_updated_at();

-- Comments for documentation
COMMENT ON TABLE raas_waitlist IS 'Stores RAAS (Result as a Service) waitlist signups';
COMMENT ON COLUMN raas_waitlist.status IS 'Status: pending (default), approved (ready for access), contacted (sales reached out), rejected';
COMMENT ON COLUMN raas_waitlist.expected_volume IS 'Expected monthly deliverable volume: 1-10, 11-50, 51-100, 100+';

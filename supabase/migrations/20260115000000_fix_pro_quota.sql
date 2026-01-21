-- Fix Pro tier quota from 100 to 2000 minutes
-- This aligns with the pricing page showing 2000 mins/month for Pro

CREATE OR REPLACE FUNCTION update_subscription_quota()
RETURNS TRIGGER AS $$
BEGIN
  NEW.minutes_quota = CASE NEW.subscription_tier
    WHEN 'free' THEN 30
    WHEN 'pro' THEN 2000
    WHEN 'team' THEN 150
    WHEN 'enterprise' THEN 999999
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing Pro users to have 2000 minutes quota
UPDATE profiles
SET minutes_quota = 2000
WHERE subscription_tier = 'pro';

-- ============================================
-- ADD MOBILE COLUMN TO PROFILES TABLE
-- ============================================
-- This migration adds mobile phone number support to user profiles

-- Add mobile column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);

-- Create index for mobile lookups (optional, for future features like SMS verification)
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.mobile IS 'User mobile phone number in E.164 format (e.g., +1234567890)';

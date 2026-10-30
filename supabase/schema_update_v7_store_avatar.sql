-- =========================================================================
-- SYAFIRA STORE SCHEMA UPDATE V7: STORE PROFILE AVATAR
-- Adds avatar_url column to store_profile table
-- =========================================================================

ALTER TABLE public.store_profile 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

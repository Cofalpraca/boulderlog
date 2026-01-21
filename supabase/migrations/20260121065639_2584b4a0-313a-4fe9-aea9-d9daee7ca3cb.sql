-- Add failed_attempts and flash_count columns to sessions table
-- These are display-only counters that do NOT affect analytics, user level, or development zones

ALTER TABLE public.sessions 
ADD COLUMN failed_attempts INTEGER DEFAULT 0,
ADD COLUMN flash_count INTEGER DEFAULT 0;

-- Add comment to document the purpose
COMMENT ON COLUMN public.sessions.failed_attempts IS 'Global failed attempts counter for ON-WALL sessions. Display only, does not affect analytics.';
COMMENT ON COLUMN public.sessions.flash_count IS 'Global flash counter for ON-WALL sessions. Display only, does not affect analytics.';
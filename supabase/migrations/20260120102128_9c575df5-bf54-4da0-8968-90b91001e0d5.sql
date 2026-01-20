-- ============================================================================
-- PRODUCTION HARDENING MIGRATION
-- ============================================================================

-- Part A1: Add session status column with proper lifecycle management
-- ============================================================================

-- Create session status enum type
DO $$ BEGIN
  CREATE TYPE public.session_status AS ENUM ('draft', 'active', 'completed', 'discarded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add status column to sessions table
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Repair existing data: sessions with date_end are 'completed', others are 'active'
UPDATE public.sessions 
SET status = CASE 
  WHEN date_end IS NOT NULL THEN 'completed'
  ELSE 'active'
END
WHERE status IS NULL OR status = 'active';

-- Add constraint: completed sessions must have date_end
CREATE OR REPLACE FUNCTION public.validate_session_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
  -- Completed sessions MUST have date_end
  IF NEW.status = 'completed' AND NEW.date_end IS NULL THEN
    RAISE EXCEPTION 'Completed sessions must have date_end set';
  END IF;
  
  -- Non-completed sessions should not have date_end (soft check, just clear it)
  IF NEW.status IN ('draft', 'active', 'discarded') AND NEW.date_end IS NOT NULL THEN
    NEW.date_end := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS validate_session_lifecycle_trigger ON public.sessions;
CREATE TRIGGER validate_session_lifecycle_trigger
BEFORE INSERT OR UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.validate_session_lifecycle();

-- Part A2: Add unique constraints to prevent duplicates
-- ============================================================================

-- Unique gym name per user (name + city to allow same name in different cities)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gyms_user_name_city_unique'
  ) THEN
    ALTER TABLE public.gyms ADD CONSTRAINT gyms_user_name_city_unique UNIQUE (user_id, name, city);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If constraint already exists or there's a conflict, just log and continue
  RAISE NOTICE 'Unique constraint on gyms may already exist or has conflicts';
END $$;

-- Unique mapping label per gym
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gym_grade_mappings_gym_label_unique'
  ) THEN
    ALTER TABLE public.gym_grade_mappings ADD CONSTRAINT gym_grade_mappings_gym_label_unique UNIQUE (gym_id, label);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Unique constraint on gym_grade_mappings may already exist';
END $$;

-- Unique session-gym link
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'session_gyms_unique'
  ) THEN
    ALTER TABLE public.session_gyms ADD CONSTRAINT session_gyms_unique UNIQUE (session_id, gym_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Unique constraint on session_gyms may already exist';
END $$;

-- Part A3: Add/ensure foreign keys with ON DELETE CASCADE
-- ============================================================================

-- boulder_logs -> sessions (cascade)
ALTER TABLE public.boulder_logs DROP CONSTRAINT IF EXISTS boulder_logs_session_id_fkey;
ALTER TABLE public.boulder_logs ADD CONSTRAINT boulder_logs_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

-- session_gyms -> sessions (cascade)
ALTER TABLE public.session_gyms DROP CONSTRAINT IF EXISTS session_gyms_session_id_fkey;
ALTER TABLE public.session_gyms ADD CONSTRAINT session_gyms_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

-- session_zone_summaries -> sessions (cascade)
ALTER TABLE public.session_zone_summaries DROP CONSTRAINT IF EXISTS session_zone_summaries_session_id_fkey;
ALTER TABLE public.session_zone_summaries ADD CONSTRAINT session_zone_summaries_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

-- session_items -> sessions (cascade)
ALTER TABLE public.session_items DROP CONSTRAINT IF EXISTS session_items_session_id_fkey;
ALTER TABLE public.session_items ADD CONSTRAINT session_items_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

-- session_sets -> session_items (cascade)
ALTER TABLE public.session_sets DROP CONSTRAINT IF EXISTS session_sets_session_item_id_fkey;
ALTER TABLE public.session_sets ADD CONSTRAINT session_sets_session_item_id_fkey 
  FOREIGN KEY (session_item_id) REFERENCES public.session_items(id) ON DELETE CASCADE;

-- gym_grade_mappings -> gyms (cascade)
ALTER TABLE public.gym_grade_mappings DROP CONSTRAINT IF EXISTS gym_grade_mappings_gym_id_fkey;
ALTER TABLE public.gym_grade_mappings ADD CONSTRAINT gym_grade_mappings_gym_id_fkey 
  FOREIGN KEY (gym_id) REFERENCES public.gyms(id) ON DELETE CASCADE;

-- Part A4: Create weekly_aggregates table for performance (Part D)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_aggregates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  on_wall_sessions integer DEFAULT 0,
  off_wall_sessions integer DEFAULT 0,
  total_boulders integer DEFAULT 0,
  total_sets integer DEFAULT 0,
  max_grade_raw text,
  has_pain boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT weekly_aggregates_user_week_unique UNIQUE (user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.weekly_aggregates ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekly_aggregates
CREATE POLICY "Users can view own weekly aggregates" 
  ON public.weekly_aggregates FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly aggregates" 
  ON public.weekly_aggregates FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly aggregates" 
  ON public.weekly_aggregates FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add update trigger
CREATE TRIGGER update_weekly_aggregates_updated_at
BEFORE UPDATE ON public.weekly_aggregates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
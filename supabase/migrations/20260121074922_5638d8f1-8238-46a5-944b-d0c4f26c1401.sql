-- Phase 1: Add compound indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_type_status 
ON public.sessions(user_id, session_type, status);

CREATE INDEX IF NOT EXISTS idx_weekly_aggregates_user_week 
ON public.weekly_aggregates(user_id, week_start DESC);

-- Phase 3: Create user_level_cache table for pre-computed climbing levels
CREATE TABLE public.user_level_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  level_score NUMERIC,
  level_v_grade VARCHAR(10),
  level_font_grade VARCHAR(10),
  max_score NUMERIC,
  max_v_grade VARCHAR(10),
  max_font_grade VARCHAR(10),
  boulders_used INTEGER DEFAULT 0,
  total_boulders INTEGER DEFAULT 0,
  window_days INTEGER DEFAULT 90,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_level_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_level_cache
CREATE POLICY "Users can view own level cache"
ON public.user_level_cache
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own level cache"
ON public.user_level_cache
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own level cache"
ON public.user_level_cache
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_level_cache_updated_at
BEFORE UPDATE ON public.user_level_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
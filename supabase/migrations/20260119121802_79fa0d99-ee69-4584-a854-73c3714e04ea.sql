-- Add optional pain tracking fields to sessions table
-- These fields provide context for pain reporting without affecting analytics calculations
-- pain_level: severity 1-5 (1=minor discomfort, 5=severe pain)
-- pain_area: body part affected
-- pain_note: optional description

ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS pain_level smallint CHECK (pain_level IS NULL OR (pain_level >= 1 AND pain_level <= 5)),
ADD COLUMN IF NOT EXISTS pain_area text CHECK (pain_area IS NULL OR pain_area IN ('fingers', 'elbow', 'shoulder', 'back', 'wrist', 'knee', 'other')),
ADD COLUMN IF NOT EXISTS pain_note text;

-- Add comment for documentation
COMMENT ON COLUMN public.sessions.pain_level IS 'Pain severity 1-5 (1=minor, 5=severe). Optional even when pain_flag=true.';
COMMENT ON COLUMN public.sessions.pain_area IS 'Body area affected: fingers, elbow, shoulder, back, wrist, knee, other.';
COMMENT ON COLUMN public.sessions.pain_note IS 'Optional free-text description of pain/injury.';
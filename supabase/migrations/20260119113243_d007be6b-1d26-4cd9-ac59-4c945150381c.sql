-- Add config_json column to templates for ON-WALL configuration
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS config_json jsonb DEFAULT NULL;

-- Add is_system column to templates for system presets  
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

-- Make user_id nullable for system templates
ALTER TABLE public.templates ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS "Users can read system templates" ON public.templates;
CREATE POLICY "Users can read system templates" 
ON public.templates 
FOR SELECT 
USING (is_system = true);

-- Insert system ON-WALL template presets
INSERT INTO public.templates (name, template_type, subtype, is_system, user_id, config_json)
VALUES 
  (
    'Project Session',
    'on_wall',
    'project',
    true,
    NULL,
    '{"focus": "project", "description": "Focus on hard attempts with beta notes", "grade_focus": 1, "recommended_duration_min": 90, "zone_guidance": {"comfort": 10, "growth": 30, "limit": 60}, "tag_presets": ["Project", "Beta", "Crux"], "logging_fields": {"notes": true, "attempts": true, "style": false, "angle": true}}'::jsonb
  ),
  (
    'Volume / Mileage',
    'on_wall',
    'volume',
    true,
    NULL,
    '{"focus": "volume", "description": "High volume of easier boulders for endurance", "grade_focus": -2, "recommended_duration_min": 120, "zone_guidance": {"comfort": 60, "growth": 35, "limit": 5}, "tag_presets": ["Flash", "Volume", "Endurance"], "logging_fields": {"notes": false, "attempts": false, "style": false, "angle": false}}'::jsonb
  ),
  (
    'Limit Boulders',
    'on_wall',
    'limit',
    true,
    NULL,
    '{"focus": "limit", "description": "Maximum difficulty attempts at your limit", "grade_focus": 2, "recommended_duration_min": 60, "zone_guidance": {"comfort": 5, "growth": 25, "limit": 70}, "tag_presets": ["Limit", "Send", "Almost"], "logging_fields": {"notes": true, "attempts": true, "style": true, "angle": true}}'::jsonb
  ),
  (
    'Technique / Slabs',
    'on_wall',
    'technique',
    true,
    NULL,
    '{"focus": "technique", "description": "Focus on footwork, slabs, and technical movement", "grade_focus": -1, "recommended_duration_min": 75, "zone_guidance": {"comfort": 40, "growth": 50, "limit": 10}, "tag_presets": ["Slab", "Footwork", "Balance", "Technique"], "logging_fields": {"notes": true, "attempts": false, "style": true, "angle": true}}'::jsonb
  ),
  (
    'Warm-up + Moderate',
    'on_wall',
    'warmup',
    true,
    NULL,
    '{"focus": "warmup", "description": "Structured warm-up followed by moderate climbing", "grade_focus": 0, "recommended_duration_min": 90, "zone_guidance": {"comfort": 35, "growth": 55, "limit": 10}, "tag_presets": ["Warmup", "Moderate", "Flash"], "logging_fields": {"notes": false, "attempts": false, "style": false, "angle": false}}'::jsonb
  );
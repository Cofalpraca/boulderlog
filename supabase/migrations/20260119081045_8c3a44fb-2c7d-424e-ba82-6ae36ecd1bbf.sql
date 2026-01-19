-- Expand preferred_grade column to allow longer values
-- Current: varchar(10) which is too short for "colors:Niebieski" (16 chars)
-- New: varchar(100) to safely accommodate any grade format like "grading_type:grade_label"
ALTER TABLE public.profiles 
ALTER COLUMN preferred_grade TYPE varchar(100);
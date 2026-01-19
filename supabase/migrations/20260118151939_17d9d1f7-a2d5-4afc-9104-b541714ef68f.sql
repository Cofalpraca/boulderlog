-- ==============================================
-- CLIMBING TRAINING PWA - DATABASE SCHEMA
-- Academic Engineering Thesis Project
-- ==============================================

-- 1. ENUMS
-- ==============================================

CREATE TYPE public.grading_type AS ENUM ('font', 'v_scale', 'colors', 'numeric');
CREATE TYPE public.session_type AS ENUM ('on_wall', 'off_wall');
CREATE TYPE public.exercise_category AS ENUM ('fingers', 'strength', 'core', 'mobility');
CREATE TYPE public.template_type AS ENUM ('on_wall', 'off_wall');

-- ==============================================
-- 2. PROFILES TABLE (extends auth.users)
-- ==============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    preferred_grade VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- 3. GYMS TABLE
-- ==============================================

CREATE TABLE public.gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    grading_type public.grading_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gyms" ON public.gyms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gyms" ON public.gyms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gyms" ON public.gyms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gyms" ON public.gyms
    FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- 4. GYM GRADE MAPPINGS
-- ==============================================

CREATE TABLE public.gym_grade_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    label VARCHAR(20) NOT NULL,
    order_index INT NOT NULL,
    approx_font_min VARCHAR(10),
    approx_font_max VARCHAR(10),
    approx_v_min VARCHAR(10),
    approx_v_max VARCHAR(10),
    color_hex VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_grade_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gym grade mappings" ON public.gym_grade_mappings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.gyms WHERE gyms.id = gym_grade_mappings.gym_id AND gyms.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own gym grade mappings" ON public.gym_grade_mappings
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.gyms WHERE gyms.id = gym_grade_mappings.gym_id AND gyms.user_id = auth.uid())
    );

CREATE POLICY "Users can update own gym grade mappings" ON public.gym_grade_mappings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.gyms WHERE gyms.id = gym_grade_mappings.gym_id AND gyms.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own gym grade mappings" ON public.gym_grade_mappings
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.gyms WHERE gyms.id = gym_grade_mappings.gym_id AND gyms.user_id = auth.uid())
    );

-- ==============================================
-- 5. SESSIONS TABLE
-- ==============================================

CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type public.session_type NOT NULL,
    subtype VARCHAR(30),
    date_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    date_end TIMESTAMP WITH TIME ZONE,
    rpe INT CHECK (rpe >= 1 AND rpe <= 10),
    finger_fatigue INT CHECK (finger_fatigue >= 1 AND finger_fatigue <= 10),
    pain_flag BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.sessions
    FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- 6. SESSION GYM JOIN TABLE
-- ==============================================

CREATE TABLE public.session_gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    UNIQUE(session_id, gym_id)
);

ALTER TABLE public.session_gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session gyms" ON public.session_gyms
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_gyms.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own session gyms" ON public.session_gyms
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_gyms.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own session gyms" ON public.session_gyms
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_gyms.session_id AND sessions.user_id = auth.uid())
    );

-- ==============================================
-- 7. BOULDER LOGS
-- ==============================================

CREATE TABLE public.boulder_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    grade_type public.grading_type NOT NULL,
    grade_raw VARCHAR(20) NOT NULL,
    count INT NOT NULL DEFAULT 1,
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.boulder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boulder logs" ON public.boulder_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = boulder_logs.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own boulder logs" ON public.boulder_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = boulder_logs.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can update own boulder logs" ON public.boulder_logs
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = boulder_logs.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own boulder logs" ON public.boulder_logs
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = boulder_logs.session_id AND sessions.user_id = auth.uid())
    );

-- ==============================================
-- 8. EXERCISES (OFF-WALL Library)
-- ==============================================

CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category public.exercise_category NOT NULL,
    exercise_type VARCHAR(30),
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and system exercises" ON public.exercises
    FOR SELECT USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises" ON public.exercises
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update own exercises" ON public.exercises
    FOR UPDATE USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own exercises" ON public.exercises
    FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- ==============================================
-- 9. PROTOCOLS
-- ==============================================

CREATE TABLE public.protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    params_json JSONB,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and system protocols" ON public.protocols
    FOR SELECT USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own protocols" ON public.protocols
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update own protocols" ON public.protocols
    FOR UPDATE USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own protocols" ON public.protocols
    FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- ==============================================
-- 10. TEMPLATES
-- ==============================================

CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_type public.template_type NOT NULL,
    subtype VARCHAR(30),
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates" ON public.templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON public.templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.templates
    FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- 11. TEMPLATE ITEMS
-- ==============================================

CREATE TABLE public.template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
    protocol_id UUID REFERENCES public.protocols(id) ON DELETE SET NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own template items" ON public.template_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.templates WHERE templates.id = template_items.template_id AND templates.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own template items" ON public.template_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.templates WHERE templates.id = template_items.template_id AND templates.user_id = auth.uid())
    );

CREATE POLICY "Users can update own template items" ON public.template_items
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.templates WHERE templates.id = template_items.template_id AND templates.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own template items" ON public.template_items
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.templates WHERE templates.id = template_items.template_id AND templates.user_id = auth.uid())
    );

-- ==============================================
-- 12. SESSION ITEMS (OFF-WALL exercises in session)
-- ==============================================

CREATE TABLE public.session_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
    protocol_id UUID REFERENCES public.protocols(id) ON DELETE SET NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session items" ON public.session_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_items.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own session items" ON public.session_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_items.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can update own session items" ON public.session_items
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_items.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own session items" ON public.session_items
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_items.session_id AND sessions.user_id = auth.uid())
    );

-- ==============================================
-- 13. SESSION SETS (individual sets within session items)
-- ==============================================

CREATE TABLE public.session_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_item_id UUID NOT NULL REFERENCES public.session_items(id) ON DELETE CASCADE,
    set_no INT NOT NULL,
    reps INT,
    duration_sec INT,
    weight_kg DECIMAL(5,2),
    rpe INT CHECK (rpe >= 1 AND rpe <= 10),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session sets" ON public.session_sets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.session_items 
            JOIN public.sessions ON sessions.id = session_items.session_id 
            WHERE session_items.id = session_sets.session_item_id AND sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own session sets" ON public.session_sets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.session_items 
            JOIN public.sessions ON sessions.id = session_items.session_id 
            WHERE session_items.id = session_sets.session_item_id AND sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own session sets" ON public.session_sets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.session_items 
            JOIN public.sessions ON sessions.id = session_items.session_id 
            WHERE session_items.id = session_sets.session_item_id AND sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own session sets" ON public.session_sets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.session_items 
            JOIN public.sessions ON sessions.id = session_items.session_id 
            WHERE session_items.id = session_sets.session_item_id AND sessions.user_id = auth.uid()
        )
    );

-- ==============================================
-- 14. GYM DIFFICULTY PROFILES (per user per gym)
-- ==============================================

CREATE TABLE public.gym_difficulty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    difficulty_bias DECIMAL(4,2),
    samples_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, gym_id)
);

ALTER TABLE public.gym_difficulty_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gym difficulty profiles" ON public.gym_difficulty_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gym difficulty profiles" ON public.gym_difficulty_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gym difficulty profiles" ON public.gym_difficulty_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gym difficulty profiles" ON public.gym_difficulty_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- 15. SESSION ZONE SUMMARIES (development zones per session)
-- ==============================================

CREATE TABLE public.session_zone_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
    comfort_pct INT DEFAULT 0 CHECK (comfort_pct >= 0 AND comfort_pct <= 100),
    growth_pct INT DEFAULT 0 CHECK (growth_pct >= 0 AND growth_pct <= 100),
    limit_pct INT DEFAULT 0 CHECK (limit_pct >= 0 AND limit_pct <= 100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_zone_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session zone summaries" ON public.session_zone_summaries
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_zone_summaries.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own session zone summaries" ON public.session_zone_summaries
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_zone_summaries.session_id AND sessions.user_id = auth.uid())
    );

CREATE POLICY "Users can update own session zone summaries" ON public.session_zone_summaries
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_zone_summaries.session_id AND sessions.user_id = auth.uid())
    );

-- ==============================================
-- 16. WEEKLY PLAN
-- ==============================================

CREATE TABLE public.weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly plans" ON public.weekly_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly plans" ON public.weekly_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly plans" ON public.weekly_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly plans" ON public.weekly_plans
    FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- 17. PLANNED SESSIONS (within weekly plan)
-- ==============================================

CREATE TABLE public.planned_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_plan_id UUID NOT NULL REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    session_type public.session_type NOT NULL,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.planned_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own planned sessions" ON public.planned_sessions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.weekly_plans WHERE weekly_plans.id = planned_sessions.weekly_plan_id AND weekly_plans.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own planned sessions" ON public.planned_sessions
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.weekly_plans WHERE weekly_plans.id = planned_sessions.weekly_plan_id AND weekly_plans.user_id = auth.uid())
    );

CREATE POLICY "Users can update own planned sessions" ON public.planned_sessions
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.weekly_plans WHERE weekly_plans.id = planned_sessions.weekly_plan_id AND weekly_plans.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own planned sessions" ON public.planned_sessions
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.weekly_plans WHERE weekly_plans.id = planned_sessions.weekly_plan_id AND weekly_plans.user_id = auth.uid())
    );

-- ==============================================
-- 18. HELPER FUNCTIONS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON public.gyms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_weekly_plans_updated_at BEFORE UPDATE ON public.weekly_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- 19. INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_date_start ON public.sessions(date_start);
CREATE INDEX idx_sessions_session_type ON public.sessions(session_type);
CREATE INDEX idx_boulder_logs_session_id ON public.boulder_logs(session_id);
CREATE INDEX idx_gym_grade_mappings_gym_id ON public.gym_grade_mappings(gym_id);
CREATE INDEX idx_session_items_session_id ON public.session_items(session_id);
CREATE INDEX idx_session_sets_session_item_id ON public.session_sets(session_item_id);
CREATE INDEX idx_gym_difficulty_profiles_user_gym ON public.gym_difficulty_profiles(user_id, gym_id);

-- ==============================================
-- 20. SEED SYSTEM EXERCISES
-- ==============================================

INSERT INTO public.exercises (id, name, category, exercise_type, description, is_system) VALUES
-- Fingers
(gen_random_uuid(), 'Max Hangs', 'fingers', 'hangboard', '10-second max weight hangs on 20mm edge', true),
(gen_random_uuid(), 'Repeaters', 'fingers', 'hangboard', '7:3 repeaters protocol on various edge sizes', true),
(gen_random_uuid(), 'One-Arm Hangs', 'fingers', 'hangboard', 'One-arm assisted hangs for maximum recruitment', true),
(gen_random_uuid(), 'Min Edge Hangs', 'fingers', 'hangboard', 'Bodyweight hangs on minimum edge depth', true),
-- Strength
(gen_random_uuid(), 'Pull-ups', 'strength', 'pulling', 'Standard pull-ups for general pulling strength', true),
(gen_random_uuid(), 'Weighted Pull-ups', 'strength', 'pulling', 'Pull-ups with added weight for strength gains', true),
(gen_random_uuid(), 'Lock-offs', 'strength', 'isometric', 'Isometric holds at various arm positions', true),
(gen_random_uuid(), 'Campus Board', 'strength', 'power', 'Dynamic power training on campus rungs', true),
(gen_random_uuid(), 'Front Lever Progressions', 'strength', 'tension', 'Progressive front lever training', true),
-- Core
(gen_random_uuid(), 'Hanging Leg Raises', 'core', 'dynamic', 'Leg raises while hanging from bar', true),
(gen_random_uuid(), 'Front Lever Holds', 'core', 'isometric', 'Front lever position holds for time', true),
(gen_random_uuid(), 'Dragon Flags', 'core', 'dynamic', 'Advanced core control exercise', true),
(gen_random_uuid(), 'L-Sit', 'core', 'isometric', 'L-sit holds on parallettes or floor', true),
-- Mobility
(gen_random_uuid(), 'Hip Openers', 'mobility', 'flexibility', 'Frog stretch and hip circles', true),
(gen_random_uuid(), 'Shoulder Mobility', 'mobility', 'flexibility', 'Shoulder circles and stretches', true),
(gen_random_uuid(), 'Wrist Prep', 'mobility', 'warmup', 'Wrist circles and stretches for climbing', true);

-- ==============================================
-- 21. SEED SYSTEM PROTOCOLS
-- ==============================================

INSERT INTO public.protocols (id, name, params_json, is_system) VALUES
(gen_random_uuid(), 'Max Hangs 10s', '{"hang_time": 10, "rest": 180, "sets": 5, "edge_mm": 20}', true),
(gen_random_uuid(), 'Repeaters 7:3', '{"hang_time": 7, "rest_short": 3, "reps": 6, "sets": 4, "rest_long": 180}', true),
(gen_random_uuid(), 'Density Hangs', '{"hang_time": 30, "rest": 30, "sets": 10}', true),
(gen_random_uuid(), 'Power Endurance', '{"on_time": 30, "off_time": 30, "rounds": 8}', true),
(gen_random_uuid(), 'Strength Sets 5x5', '{"reps": 5, "sets": 5, "rest": 180}', true),
(gen_random_uuid(), 'Hypertrophy 3x10', '{"reps": 10, "sets": 3, "rest": 90}', true);
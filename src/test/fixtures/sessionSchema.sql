-- Isolated PostgreSQL fixture for the tables used by the atomic save RPC.
-- Apply the repository's real lifecycle trigger and save migration on top.
CREATE ROLE authenticated;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
  $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE TYPE public.session_type AS ENUM ('on_wall', 'off_wall');
CREATE TYPE public.grading_type AS ENUM ('font', 'v_scale', 'colors', 'numeric');
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  session_type session_type NOT NULL, subtype text, date_start timestamptz NOT NULL DEFAULT now(),
  date_end timestamptz, status text DEFAULT 'active', notes text, rpe integer,
  finger_fatigue integer, pain_flag boolean, pain_level integer, pain_area text, pain_note text,
  failed_attempts integer, flash_count integer
);
CREATE TABLE gyms (id uuid PRIMARY KEY, user_id uuid NOT NULL);
CREATE TABLE exercises (id uuid PRIMARY KEY, user_id uuid, is_system boolean);
CREATE TABLE protocols (id uuid PRIMARY KEY, user_id uuid, is_system boolean);
CREATE TABLE session_gyms (
  session_id uuid REFERENCES sessions ON DELETE CASCADE, gym_id uuid REFERENCES gyms,
  UNIQUE(session_id, gym_id)
);
CREATE TABLE boulder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES sessions ON DELETE CASCADE,
  grade_raw text NOT NULL, grade_type grading_type NOT NULL, count integer NOT NULL,
  tags text[], notes text
);
CREATE TABLE session_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES sessions ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises, protocol_id uuid REFERENCES protocols, order_index integer NOT NULL
);
CREATE TABLE session_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_item_id uuid NOT NULL REFERENCES session_items ON DELETE CASCADE,
  set_no integer NOT NULL, reps integer, duration_sec integer, weight_kg numeric, rpe integer
);
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner ON sessions TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner ON gyms TO authenticated USING (user_id = auth.uid());
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY available ON exercises TO authenticated USING (is_system OR user_id = auth.uid());
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY available ON protocols TO authenticated USING (is_system OR user_id = auth.uid());
ALTER TABLE session_gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner ON session_gyms TO authenticated USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = session_id AND user_id = auth.uid())
);
ALTER TABLE boulder_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner ON boulder_logs TO authenticated USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = session_id AND user_id = auth.uid())
);
ALTER TABLE session_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner ON session_items TO authenticated USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = session_id AND user_id = auth.uid())
);
ALTER TABLE session_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner ON session_sets TO authenticated USING (
  EXISTS (SELECT 1 FROM session_items i JOIN sessions s ON s.id = i.session_id
    WHERE i.id = session_item_id AND s.user_id = auth.uid())
);
GRANT USAGE ON SCHEMA public, auth TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

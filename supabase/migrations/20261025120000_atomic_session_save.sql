-- One RPC call is one PostgreSQL transaction. A failed child insert rolls back
-- the entire save; a lost response can safely be retried with the offline key.
ALTER TABLE public.sessions ADD COLUMN offline_id text;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_user_offline_id_unique
  UNIQUE (user_id, offline_id);

CREATE OR REPLACE FUNCTION public.save_completed_session(
  p_session jsonb,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_logs jsonb DEFAULT '[]'::jsonb,
  p_offline_id text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_session_id uuid;
  v_session_type public.session_type;
  v_item jsonb;
  v_item_id uuid;
BEGIN
  IF v_user_id IS NULL OR (p_session->>'user_id')::uuid IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Session owner does not match authenticated user';
  END IF;
  IF p_session->>'status' IS DISTINCT FROM 'completed'
     OR NULLIF(p_session->>'date_end', '') IS NULL THEN
    RAISE EXCEPTION 'Only completed sessions with an end time can be saved';
  END IF;

  IF p_offline_id IS NOT NULL THEN
    IF btrim(p_offline_id) = '' OR p_session->>'id' IS NOT NULL THEN
      RAISE EXCEPTION 'Invalid offline session key';
    END IF;
    v_session_type := (p_session->>'session_type')::public.session_type;
    INSERT INTO public.sessions (
      user_id, session_type, subtype, date_start, date_end, status, offline_id,
      notes, rpe, finger_fatigue, pain_flag, pain_level, pain_area, pain_note,
      failed_attempts, flash_count
    ) VALUES (
      v_user_id, v_session_type, p_session->>'subtype',
      (p_session->>'date_start')::timestamptz, (p_session->>'date_end')::timestamptz,
      'completed', p_offline_id, p_session->>'notes', (p_session->>'rpe')::integer,
      (p_session->>'finger_fatigue')::integer, (p_session->>'pain_flag')::boolean,
      (p_session->>'pain_level')::integer, p_session->>'pain_area', p_session->>'pain_note',
      (p_session->>'failed_attempts')::integer, (p_session->>'flash_count')::integer
    ) ON CONFLICT (user_id, offline_id) DO NOTHING RETURNING id INTO v_session_id;

    IF v_session_id IS NULL THEN
      SELECT id INTO STRICT v_session_id FROM public.sessions
      WHERE user_id = v_user_id AND offline_id = p_offline_id;
      RETURN v_session_id;
    END IF;
    IF NULLIF(p_session->>'gym_id', '') IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.gyms
                     WHERE id = (p_session->>'gym_id')::uuid AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Gym is not owned by authenticated user';
      END IF;
      INSERT INTO public.session_gyms (session_id, gym_id)
      VALUES (v_session_id, (p_session->>'gym_id')::uuid);
    END IF;
  ELSE
    SELECT id, session_type INTO STRICT v_session_id, v_session_type
    FROM public.sessions
    WHERE id = (p_session->>'id')::uuid AND user_id = v_user_id
      AND session_type = 'off_wall' AND status IN ('active', 'completed')
    FOR UPDATE;

    UPDATE public.sessions SET
      status = 'completed', date_end = (p_session->>'date_end')::timestamptz,
      notes = p_session->>'notes', rpe = (p_session->>'rpe')::integer,
      finger_fatigue = (p_session->>'finger_fatigue')::integer,
      pain_flag = (p_session->>'pain_flag')::boolean,
      pain_level = (p_session->>'pain_level')::integer,
      pain_area = p_session->>'pain_area', pain_note = p_session->>'pain_note'
    WHERE id = v_session_id;
    DELETE FROM public.session_items WHERE session_id = v_session_id;
  END IF;

  IF v_session_type = 'on_wall' THEN
    IF jsonb_array_length(p_logs) = 0 THEN
      RAISE EXCEPTION 'Bouldering session must contain logs';
    END IF;
    INSERT INTO public.boulder_logs (session_id, grade_raw, grade_type, count, tags, notes)
    SELECT v_session_id, l.grade_raw, l.grade_type, l.count, l.tags, l.notes
    FROM jsonb_to_recordset(p_logs) AS l(
      grade_raw text, grade_type public.grading_type, count integer, tags text[], notes text
    );
  ELSE
    IF jsonb_array_length(p_items) = 0 OR NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_items) i
      WHERE jsonb_array_length(i->'sets') > 0
    ) THEN
      RAISE EXCEPTION 'Strength session must contain completed sets';
    END IF;
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
      IF NOT EXISTS (SELECT 1 FROM public.exercises
                     WHERE id = (v_item->>'exercise_id')::uuid
                       AND (is_system = true OR user_id = v_user_id)) THEN
        RAISE EXCEPTION 'Exercise is not available to authenticated user';
      END IF;
      IF NULLIF(v_item->>'protocol_id', '') IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.protocols WHERE id = (v_item->>'protocol_id')::uuid
          AND (is_system = true OR user_id = v_user_id)
      ) THEN
        RAISE EXCEPTION 'Protocol is not available to authenticated user';
      END IF;
      INSERT INTO public.session_items (session_id, exercise_id, protocol_id, order_index)
      VALUES (v_session_id, (v_item->>'exercise_id')::uuid,
              (v_item->>'protocol_id')::uuid, (v_item->>'order_index')::integer)
      RETURNING id INTO v_item_id;
      INSERT INTO public.session_sets (session_item_id, set_no, reps, duration_sec, weight_kg, rpe)
      SELECT v_item_id, s.set_no, s.reps, s.duration_sec, s.weight_kg, s.rpe
      FROM jsonb_to_recordset(v_item->'sets') AS s(
        set_no integer, reps integer, duration_sec integer, weight_kg numeric, rpe integer
      );
    END LOOP;
  END IF;
  RETURN v_session_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_completed_session(jsonb, jsonb, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_completed_session(jsonb, jsonb, jsonb, text) TO authenticated;

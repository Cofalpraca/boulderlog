-- A resumed PostgREST instance can still hold its pre-migration schema cache.
-- Fail explicitly if the prerequisite RPC is missing, then refresh its API metadata.
DO $$
BEGIN
  IF to_regprocedure('public.save_completed_session(jsonb,jsonb,jsonb,text)') IS NULL THEN
    RAISE EXCEPTION 'The atomic session save RPC must be installed before refreshing the API schema';
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';

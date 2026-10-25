// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const userId = '00000000-0000-4000-8000-000000000001';
const otherUserId = '00000000-0000-4000-8000-000000000002';
const exerciseId = '00000000-0000-4000-8000-000000000003';
const gymId = '00000000-0000-4000-8000-000000000004';
const sessionId = '00000000-0000-4000-8000-000000000005';
const protocolId = '00000000-0000-4000-8000-000000000006';
let db: PGlite;
const session = () => ({
  user_id: userId, session_type: 'off_wall', status: 'completed',
  date_start: '2026-10-25T09:00:00Z', date_end: '2026-10-25T10:00:00Z',
  rpe: 6, finger_fatigue: 0, pain_flag: false,
});
const items = () => [{
  exercise_id: exerciseId, protocol_id: protocolId, order_index: 0,
  sets: [
    { set_no: 1, reps: 5, duration_sec: null, weight_kg: 12.5, rpe: 7 },
    { set_no: 2, reps: null, duration_sec: 30, weight_kg: 0, rpe: 6 },
  ],
}];
const logs = () => [{ grade_raw: 'V3', grade_type: 'v_scale', count: 2, tags: ['Flash'], notes: 'test' }];
async function save(metadata: Record<string, unknown> = session(), strength = items(), boulders = [], key: string | null = 'offline-test') {
  const result = await db.query<{ id: string }>(
    'SELECT public.save_completed_session($1::jsonb, $2::jsonb, $3::jsonb, $4::text) AS id',
    [JSON.stringify(metadata), JSON.stringify(strength), JSON.stringify(boulders), key]);
  return result.rows[0].id;
}
async function count(table: string) {
  return (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync(new URL('./fixtures/sessionSchema.sql', import.meta.url), 'utf8'));
  const lifecycle = readFileSync(new URL('../../supabase/migrations/20260120102128_9c575df5-bf54-4da0-8968-90b91001e0d5.sql', import.meta.url), 'utf8');
  await db.exec(lifecycle.slice(lifecycle.indexOf('CREATE OR REPLACE FUNCTION public.validate_session_lifecycle()'), lifecycle.indexOf('-- Part A2')));
  await db.exec(readFileSync(new URL('../../supabase/migrations/20261025120000_atomic_session_save.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../../supabase/migrations/20261025143000_refresh_session_rpc_schema_cache.sql', import.meta.url), 'utf8'));
}, 30000);
beforeEach(async () => {
  await db.exec(`RESET ROLE; TRUNCATE sessions, gyms, exercises, protocols CASCADE;
    INSERT INTO exercises VALUES ('${exerciseId}', NULL, true);
    INSERT INTO protocols VALUES ('${protocolId}', NULL, true);
    INSERT INTO gyms VALUES ('${gymId}', '${userId}');
    SET ROLE authenticated;`);
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [userId]);
});
afterAll(async () => { await db?.close(); });

describe('atomic save in PostgreSQL with lifecycle trigger and RLS', () => {
  it('completes online OFF-WALL with an end time, exercises and all sets', async () => {
    await db.query("INSERT INTO sessions (id, user_id, session_type) VALUES ($1, $2, 'off_wall')", [sessionId, userId]);
    const id = await save({ ...session(), id: sessionId }, items(), [], null);
    expect(id).toBe(sessionId);
    const result = await db.query('SELECT status, date_end IS NOT NULL AS ended FROM sessions WHERE id = $1', [id]);
    expect(result.rows).toEqual([{ status: 'completed', ended: true }]);
    expect(await count('session_items')).toBe(1);
    expect(await count('session_sets')).toBe(2);
  });
  it('syncs OFF-WALL with correct exercise, protocol, order, set values and zero fatigue', async () => {
    await save();
    const result = await db.query(`SELECT exercise_id, protocol_id, order_index, set_no, reps, duration_sec, weight_kg::text, session_sets.rpe
      FROM session_items JOIN session_sets ON session_item_id = session_items.id ORDER BY set_no`);
    expect(result.rows).toEqual([
      { exercise_id: exerciseId, protocol_id: protocolId, order_index: 0, set_no: 1, reps: 5, duration_sec: null, weight_kg: '12.5', rpe: 7 },
      { exercise_id: exerciseId, protocol_id: protocolId, order_index: 0, set_no: 2, reps: null, duration_sec: 30, weight_kg: '0', rpe: 6 },
    ]);
    expect((await db.query('SELECT finger_fatigue, pain_flag FROM sessions')).rows).toEqual([{ finger_fatigue: 0, pain_flag: false }]);
  });
  it('syncs ON-WALL with a gym, logs and history-compatible status', async () => {
    await save({ ...session(), session_type: 'on_wall', gym_id: gymId }, [], logs());
    expect(await count('session_gyms')).toBe(1);
    expect((await db.query("SELECT status FROM sessions WHERE status = 'completed' AND date_end IS NOT NULL")).rows).toHaveLength(1);
    expect((await db.query('SELECT grade_raw, count, tags FROM boulder_logs')).rows).toEqual([{ grade_raw: 'V3', count: 2, tags: ['Flash'] }]);
  });
  it('retries after a lost response without duplicating sessions, exercises or sets', async () => {
    const first = await save();
    expect(await save()).toBe(first);
    expect(await count('sessions')).toBe(1);
    expect(await count('session_items')).toBe(1);
    expect(await count('session_sets')).toBe(2);
  });
  it('retries ON-WALL without duplicating gym links or logs', async () => {
    const metadata = { ...session(), session_type: 'on_wall', gym_id: gymId };
    const first = await save(metadata, [], logs());
    expect(await save(metadata, [], logs())).toBe(first);
    expect(await count('session_gyms')).toBe(1);
    expect(await count('boulder_logs')).toBe(1);
  });
  it('rolls back session, gym and logs when a log insert fails', async () => {
    await expect(save({ ...session(), session_type: 'on_wall', gym_id: gymId }, [], [{ ...logs()[0], grade_type: 'invalid' }])).rejects.toThrow();
    for (const table of ['sessions', 'session_gyms', 'boulder_logs']) expect(await count(table)).toBe(0);
  });
  it('rolls back session, exercises and earlier sets when a later set fails', async () => {
    const invalid = items();
    invalid[0].sets[1].set_no = null;
    await expect(save(session(), invalid)).rejects.toThrow();
    for (const table of ['sessions', 'session_items', 'session_sets']) expect(await count(table)).toBe(0);
    expect(await save()).toBeTruthy();
  });
  it('preserves existing online data and active status when replacement fails', async () => {
    await db.query("INSERT INTO sessions (id, user_id, session_type) VALUES ($1, $2, 'off_wall')", [sessionId, userId]);
    const old = await db.query<{ id: string }>('INSERT INTO session_items (session_id, exercise_id, order_index) VALUES ($1, $2, 0) RETURNING id', [sessionId, exerciseId]);
    await db.query('INSERT INTO session_sets (session_item_id, set_no, reps) VALUES ($1, 1, 42)', [old.rows[0].id]);
    const invalid = items();
    invalid[0].sets[1].set_no = null;
    await expect(save({ ...session(), id: sessionId }, invalid, [], null)).rejects.toThrow();
    expect((await db.query('SELECT status, date_end FROM sessions')).rows).toEqual([{ status: 'active', date_end: null }]);
    expect((await db.query('SELECT reps FROM session_sets')).rows).toEqual([{ reps: 42 }]);
  });
  it('rejects unfinished or empty sessions without creating records', async () => {
    await expect(save({ ...session(), date_end: null })).rejects.toThrow();
    await expect(save({ ...session(), status: 'active' })).rejects.toThrow();
    await expect(save(session(), [])).rejects.toThrow();
    expect(await count('sessions')).toBe(0);
  });
  it('rejects another owner, private exercises, private protocols and foreign gyms', async () => {
    await expect(save({ ...session(), user_id: otherUserId })).rejects.toThrow();
    await db.exec(`RESET ROLE;
      UPDATE exercises SET is_system = false, user_id = '${otherUserId}';
      SET ROLE authenticated;`);
    await expect(save()).rejects.toThrow('Exercise is not available');
    await db.exec(`RESET ROLE;
      UPDATE exercises SET is_system = true;
      UPDATE protocols SET is_system = false, user_id = '${otherUserId}';
      SET ROLE authenticated;`);
    await expect(save()).rejects.toThrow('Protocol is not available');
    await db.exec(`RESET ROLE; UPDATE gyms SET user_id = '${otherUserId}'; SET ROLE authenticated;`);
    await expect(save({ ...session(), session_type: 'on_wall', gym_id: gymId }, [], logs())).rejects.toThrow('Gym is not owned');
    expect(await count('sessions')).toBe(0);
  });
  it('does not allow completing someone else\'s session or an anonymous save', async () => {
    await db.exec(`RESET ROLE; INSERT INTO sessions (id, user_id, session_type) VALUES ('${sessionId}', '${otherUserId}', 'off_wall'); SET ROLE authenticated;`);
    await expect(save({ ...session(), id: sessionId }, items(), [], null)).rejects.toThrow();
    await db.query("SELECT set_config('request.jwt.claim.sub', '', false)");
    await expect(save()).rejects.toThrow('Session owner');
  });
});

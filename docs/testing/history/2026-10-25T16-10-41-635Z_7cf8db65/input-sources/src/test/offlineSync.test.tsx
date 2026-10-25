import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOfflineStorage, type OfflineItemWithSets } from '@/hooks/useOfflineStorage';
import { syncOfflineSessions } from '@/lib/syncOfflineSessions';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const session = (tempId = 'temp-test', type: 'on_wall' | 'off_wall' = 'off_wall') => ({
  id: '', tempId, user_id: 'user-1', session_type: type, date_start: '2026-10-25T09:00:00Z',
});
const endTime = '2026-10-25T10:00:00Z';
const item = (): OfflineItemWithSets => ({
  id: 'item-1', exercise_id: 'exercise-1', exercise_name: 'Pull-up', exercise_category: 'strength',
  protocol_id: 'protocol-1', order_index: 0,
  sets: [
    { id: 'set-1', set_no: 1, reps: 5, duration_sec: null, weight_kg: 12.5, rpe: 7 },
    { id: 'set-2', set_no: 2, reps: null, duration_sec: 30, weight_kg: 0, rpe: 6 },
  ],
});
const log = { id: 'log-1', grade_raw: 'V3', grade_type: 'v_scale', count: 2, tags: ['Flash'] };
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('offline storage and synchronization', () => {
  const setup = () => {
    const { result } = renderHook(() => useOfflineStorage());
    const rpc = vi.fn().mockResolvedValue({ data: 'server-id', error: null });
    const client = { rpc } as unknown as SupabaseClient<Database>;
    return { result, rpc, client };
  };
  const prepare = async (storage: ReturnType<typeof useOfflineStorage>) => {
    expect(await storage.saveSessionOffline(session())).toBe(true);
    expect(await storage.completeSessionOffline('temp-test', {
      date_end: endTime, finger_fatigue: 0, pain_flag: false,
    }, { items: [item()] })).toBe(true);
  };
  it('uploads OFF-WALL exercises and sets and only then removes local records', async () => {
    const { result, rpc, client } = setup();
    await act(async () => { await prepare(result.current); });
    const deleted = vi.spyOn(result.current, 'deletePendingSession');
    rpc.mockImplementation(async () => {
      expect(deleted).not.toHaveBeenCalled();
      expect(await result.current.getSessionSetsForItem('item-1')).toHaveLength(2);
      return { data: 'server-id', error: null };
    });
    await act(async () => {
      expect(await syncOfflineSessions('user-1', result.current, client)).toEqual({ syncedCount: 1, failedCount: 0 });
    });
    expect(rpc).toHaveBeenCalledWith('save_completed_session', expect.objectContaining({
      p_offline_id: 'temp-test',
      p_session: expect.objectContaining({ status: 'completed', date_end: endTime, finger_fatigue: 0, pain_flag: false }),
      p_items: [{ exercise_id: 'exercise-1', protocol_id: 'protocol-1', order_index: 0,
        sets: item().sets.map(({ id, ...set }) => set) }],
    }));
    expect(await result.current.getPendingSessions()).toEqual([]);
    expect(await result.current.getSessionItemsForSession('temp-test')).toEqual([]);
    expect(await result.current.getSessionSetsForItem('item-1')).toEqual([]);
  });
  it('uploads ON-WALL logs and completed status', async () => {
    const { result, rpc, client } = setup();
    await act(async () => {
      await result.current.saveSessionOffline({ ...session('boulder', 'on_wall'), gym_id: 'gym-1' });
      await result.current.completeSessionOffline('boulder', { date_end: endTime }, { logs: [log] });
      await syncOfflineSessions('user-1', result.current, client);
    });
    expect(rpc).toHaveBeenCalledWith('save_completed_session', expect.objectContaining({
      p_session: expect.objectContaining({ status: 'completed', gym_id: 'gym-1', date_end: endTime }),
      p_logs: [{ grade_raw: 'V3', grade_type: 'v_scale', count: 2, tags: ['Flash'], notes: null }],
    }));
    expect(await result.current.getLogsForSession('boulder')).toEqual([]);
  });
  it.each(['server error', 'network error', 'missing confirmation'])('keeps every local record after %s and allows retry', async failure => {
    const { result, rpc, client } = setup();
    await act(async () => { await prepare(result.current); });
    if (failure === 'network error') rpc.mockRejectedValueOnce(new Error('Connection lost'));
    else rpc.mockResolvedValueOnce(failure === 'server error'
      ? { data: null, error: { message: 'Insert failed' } } : { data: null, error: null });
    await act(async () => {
      expect(await syncOfflineSessions('user-1', result.current, client)).toEqual({ syncedCount: 0, failedCount: 1 });
    });
    expect(await result.current.getPendingSessions()).toHaveLength(1);
    expect(await result.current.getSessionItemsForSession('temp-test')).toHaveLength(1);
    expect(await result.current.getSessionSetsForItem('item-1')).toHaveLength(2);
    await act(async () => {
      expect(await syncOfflineSessions('user-1', result.current, client)).toEqual({ syncedCount: 1, failedCount: 0 });
    });
    expect(rpc.mock.calls[0][1].p_offline_id).toBe(rpc.mock.calls[1][1].p_offline_id);
  });
  it('does not upload or delete an active session or another user\'s session', async () => {
    const { result, rpc, client } = setup();
    await act(async () => {
      await result.current.saveSessionOffline(session());
      await result.current.saveSessionOffline({ ...session('other-user'), user_id: 'user-2', date_end: endTime });
      expect(await syncOfflineSessions('user-1', result.current, client)).toEqual({ syncedCount: 0, failedCount: 0 });
    });
    expect(rpc).not.toHaveBeenCalled();
    expect(await result.current.getPendingSessions()).toHaveLength(2);
  });
  it('does not treat a local read failure as an empty payload', async () => {
    const { result, rpc, client } = setup();
    await act(async () => { await prepare(result.current); });
    const storage = { ...result.current, getSessionSetsForItem: vi.fn().mockRejectedValue(new Error('Read failed')) };
    await act(async () => {
      expect(await syncOfflineSessions('user-1', storage, client)).toEqual({ syncedCount: 0, failedCount: 1 });
    });
    expect(rpc).not.toHaveBeenCalled();
    expect(await result.current.getPendingSessions()).toHaveLength(1);
  });
  it('rolls back the entire local completion if a later set cannot be written', async () => {
    const { result } = setup();
    await act(async () => { await prepare(result.current); });
    const originalPut = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function(value, key) {
      if (this.name === 'pendingSessionSets' && value.id === 'bad') throw new Error('Disk full');
      return originalPut.call(this, value, key);
    });
    const replacement = item();
    replacement.sets[1].id = 'bad';
    await act(async () => {
      expect(await result.current.completeSessionOffline('temp-test', { date_end: endTime, notes: 'replacement' }, { items: [replacement] })).toBe(false);
    });
    expect((await result.current.getPendingSessions())[0].notes).toBeUndefined();
    expect((await result.current.getSessionSetsForItem('item-1')).map(s => s.id)).toEqual(['set-1', 'set-2']);
  });
  it('rolls back local cleanup if deleting a set fails, then retries safely', async () => {
    const { result, client } = setup();
    await act(async () => { await prepare(result.current); });
    const originalDelete = IDBObjectStore.prototype.delete;
    const deletion = vi.spyOn(IDBObjectStore.prototype, 'delete').mockImplementation(function(key) {
      if (this.name === 'pendingSessionSets') throw new Error('Delete failed');
      return originalDelete.call(this, key);
    });
    await act(async () => {
      expect(await syncOfflineSessions('user-1', result.current, client)).toEqual({ syncedCount: 0, failedCount: 1 });
    });
    expect(await result.current.getPendingSessions()).toHaveLength(1);
    expect(await result.current.getSessionItemsForSession('temp-test')).toHaveLength(1);
    expect(await result.current.getSessionSetsForItem('item-1')).toHaveLength(2);
    deletion.mockRestore();
    await act(async () => {
      expect(await syncOfflineSessions('user-1', result.current, client)).toEqual({ syncedCount: 1, failedCount: 0 });
    });
  });
  it('notifies other hook instances when a session becomes ready to sync', async () => {
    const first = renderHook(() => useOfflineStorage());
    const second = renderHook(() => useOfflineStorage());
    await act(async () => { await first.result.current.saveSessionOffline(session()); });
    expect(second.result.current.pendingCount).toBe(0);
    await act(async () => {
      await first.result.current.completeSessionOffline('temp-test', { date_end: endTime }, { items: [item()] });
    });
    await waitFor(() => expect(second.result.current.pendingCount).toBe(1));
  });
  it('does not report success when IndexedDB aborts after the last put succeeds', async () => {
    const { result } = setup();
    await act(async () => { await prepare(result.current); });
    const originalPut = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function(value, key) {
      const request = originalPut.call(this, value, key);
      if (this.name === 'pendingSessions' && value.notes === 'abort on commit') {
        request.addEventListener('success', () => this.transaction.abort());
      }
      return request;
    });
    await act(async () => {
      expect(await result.current.completeSessionOffline('temp-test', {
        date_end: endTime, notes: 'abort on commit',
      }, { items: [] })).toBe(false);
    });
    expect((await result.current.getPendingSessions())[0].notes).toBeUndefined();
    expect(await result.current.getSessionItemsForSession('temp-test')).toHaveLength(1);
    expect(await result.current.getSessionSetsForItem('item-1')).toHaveLength(2);
  });
  it('rejects completion of a missing session and replaces children on local retry', async () => {
    const { result } = setup();
    await act(async () => {
      expect(await result.current.completeSessionOffline('missing', { date_end: endTime }, { items: [item()] })).toBe(false);
      await prepare(result.current);
      await result.current.completeSessionOffline('temp-test', { date_end: endTime }, { items: [item()] });
    });
    expect(await result.current.getSessionItemsForSession('temp-test')).toHaveLength(1);
    expect(await result.current.getSessionSetsForItem('item-1')).toHaveLength(2);
  });
});

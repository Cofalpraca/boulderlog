import { IDBFactory } from 'fake-indexeddb';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

const mocks = vi.hoisted(() => ({ user: { id: 'user-1' }, rpc: vi.fn(), error: vi.fn(), success: vi.fn() }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: mocks.rpc } }));
vi.mock('sonner', () => ({ toast: { error: mocks.error, success: mocks.success } }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  mocks.rpc.mockResolvedValue({ data: 'server-id', error: null });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function renderIndicator() {
  render(<QueryClientProvider client={new QueryClient()}><OfflineIndicator /></QueryClientProvider>);
}
describe('OfflineIndicator synchronization triggers', () => {
  it('syncs a session completed by another hook instance while already online', async () => {
    const { result } = renderHook(() => useOfflineStorage());
    renderIndicator();
    await act(async () => {
      await result.current.saveSessionOffline({ id: '', tempId: 'active', user_id: 'user-1',
        session_type: 'on_wall', date_start: '2026-10-25T09:00:00Z' });
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.completeSessionOffline('active', { date_end: '2026-10-25T10:00:00Z' }, {
        logs: [{ id: 'log-1', grade_type: 'v_scale', grade_raw: 'V3', count: 1 }],
      });
    });
    await waitFor(() => expect(mocks.success).toHaveBeenCalledOnce());
    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(await result.current.getPendingSessions()).toEqual([]);
  });
  it('shows a failed startup sync, then accepts a service-worker retry without overlapping requests', async () => {
    const { result } = renderHook(() => useOfflineStorage());
    await act(async () => {
      await result.current.saveSessionOffline({ id: '', tempId: 'pending', user_id: 'user-1',
        session_type: 'on_wall', date_start: '2026-10-25T09:00:00Z' });
      await result.current.completeSessionOffline('pending', { date_end: '2026-10-25T10:00:00Z' }, {
        logs: [{ id: 'log-1', grade_type: 'v_scale', grade_raw: 'V3', count: 1 }],
      });
    });
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: 'Save failed' } });
    renderIndicator();
    await waitFor(() => expect(mocks.error).toHaveBeenCalledOnce());
    expect(await result.current.getPendingSessions()).toHaveLength(1);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sync Now' })).toBeEnabled());
    let finish: (value: { data: string; error: null }) => void;
    mocks.rpc.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    act(() => { window.dispatchEvent(new Event('sw-sync-sessions')); });
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledTimes(2));
    act(() => {
      window.dispatchEvent(new Event('sw-sync-sessions'));
      window.dispatchEvent(new Event('sw-sync-sessions'));
    });
    expect(mocks.rpc).toHaveBeenCalledTimes(2);
    await act(async () => { finish!({ data: 'server-id', error: null }); });
    await waitFor(() => expect(mocks.success).toHaveBeenCalledOnce());
    expect(await result.current.getPendingSessions()).toEqual([]);
  });
});

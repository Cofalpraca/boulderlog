import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StrengthSession from '@/pages/StrengthSession';

const mocks = vi.hoisted(() => ({
  user: { id: 'user-1' }, rpc: vi.fn(), from: vi.fn(), toast: vi.fn(), clear: vi.fn(),
  cacheData: vi.fn().mockResolvedValue(true), getCachedData: vi.fn().mockResolvedValue(null),
  completeSessionOffline: vi.fn(), deletePendingSession: vi.fn(),
}));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: mocks.rpc, from: mocks.from } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock('@/contexts/ActiveSessionContext', () => ({ useActiveSession: () => ({ clearActiveSession: vi.fn() }) }));
vi.mock('@/hooks/useSessionPersistence', () => ({ useSessionPersistence: () => ({ clearSessionState: mocks.clear }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/hooks/useOfflineStorage', () => ({
  generateTempId: () => 'temp-test',
  useOfflineStorage: () => ({ isOnline: true, cacheData: mocks.cacheData, getCachedData: mocks.getCachedData,
    completeSessionOffline: mocks.completeSessionOffline, deletePendingSession: mocks.deletePendingSession }),
}));
function Location() { return <p data-testid="location">{useLocation().pathname}</p>; }
function openSession(empty = false) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  client.setQueryData(['session', 'session-1'], { id: 'session-1', status: 'active' });
  client.setQueryData(['exercises', 'user-1'], []);
  client.setQueryData(['protocols', 'user-1'], []);
  client.setQueryData(['session_items', 'session-1'], empty ? [] : [{
    id: 'item-1', exercise_id: 'exercise-1', protocol_id: 'protocol-1', order_index: 0,
    exercises: { id: 'exercise-1', name: 'Pull-up', category: 'strength' },
    session_sets: [{ id: 'set-1', set_no: 1, reps: 5, duration_sec: null, weight_kg: 12.5, rpe: 7 }],
  }]);
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/session/session-1/strength']}>
    <Location /><Routes><Route path="/session/:sessionId/strength" element={<StrengthSession />} />
      <Route path="/analytics" element={<p>Analytics</p>} /></Routes>
  </MemoryRouter></QueryClientProvider>);
}
async function finish() {
  fireEvent.click(screen.getByRole('button', { name: 'session.end' }));
  fireEvent.click(await screen.findByRole('button', { name: 'session.saveSession' }));
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  mocks.rpc.mockResolvedValue({ data: 'session-1', error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('StrengthSession completion through the UI', () => {
  it('submits completed status, end time, protocol and sets, then navigates after confirmation', async () => {
    openSession();
    await screen.findByText('Pull-up');
    await finish();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/analytics'));
    expect(mocks.rpc).toHaveBeenCalledWith('save_completed_session', {
      p_session: expect.objectContaining({ id: 'session-1', user_id: 'user-1', status: 'completed', date_end: expect.any(String) }),
      p_items: [{ exercise_id: 'exercise-1', protocol_id: 'protocol-1', order_index: 0,
        sets: [{ set_no: 1, reps: 5, duration_sec: null, weight_kg: 12.5, rpe: 7 }] }],
    });
    expect(mocks.clear).toHaveBeenCalledOnce();
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it.each(['database error', 'no confirmation'])('keeps the form and recovery data after %s and permits retry', async failure => {
    mocks.rpc.mockResolvedValueOnce(failure === 'database error'
      ? { data: null, error: { message: 'Save failed' } } : { data: null, error: null });
    openSession();
    await screen.findByText('Pull-up');
    await finish();
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
    expect(mocks.clear).not.toHaveBeenCalled();
    expect(screen.getByTestId('location')).toHaveTextContent('/session/session-1/strength');
    fireEvent.click(screen.getByRole('button', { name: 'session.saveSession' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/analytics'));
    expect(mocks.rpc).toHaveBeenCalledTimes(2);
  });
  it('does not clear recovery data or navigate before the server confirms success', async () => {
    let resolve: (response: { data: string; error: null }) => void;
    mocks.rpc.mockReturnValueOnce(new Promise(done => { resolve = done; }));
    openSession();
    await screen.findByText('Pull-up');
    await finish();
    expect(screen.getByRole('button', { name: 'session.saveSession' })).toBeDisabled();
    expect(mocks.clear).not.toHaveBeenCalled();
    expect(screen.getByTestId('location')).toHaveTextContent('/session/session-1/strength');
    resolve!({ data: 'session-1', error: null });
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/analytics'));
  });
  it('rejects an empty session without calling the server', async () => {
    openSession(true);
    await finish();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.clear).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }));
  });
});

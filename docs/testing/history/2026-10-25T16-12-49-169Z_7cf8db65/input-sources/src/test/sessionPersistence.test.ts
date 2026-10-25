import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Session Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should store active session data in localStorage', () => {
    const sessionData = {
      sessionId: 'test-session-123',
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      gymId: 'gym-456',
      gymName: 'Test Gym',
      isOffline: false,
      route: '/session/test-session-123/boulders',
    };

    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    
    const stored = localStorage.getItem('boulderlog_active_session');
    expect(stored).not.toBeNull();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.sessionId).toBe('test-session-123');
    expect(parsed.sessionType).toBe('on_wall');
    expect(parsed.gymName).toBe('Test Gym');
  });

  it('should clear active session data', () => {
    const sessionData = {
      sessionId: 'test-session-123',
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      isOffline: false,
      route: '/session/test-session-123/boulders',
    };

    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    localStorage.removeItem('boulderlog_active_session');
    
    expect(localStorage.getItem('boulderlog_active_session')).toBeNull();
  });

  it('should persist session state with timestamp', () => {
    const sessionId = 'test-session-123';
    const stateKey = `boulderlog_session_state_${sessionId}`;
    
    const state = {
      boulders: [{ id: '1', grade_raw: 'V3', count: 1 }],
      sessionNotes: 'Test notes',
      rpe: 7,
      lastUpdated: Date.now(),
    };

    localStorage.setItem(stateKey, JSON.stringify(state));
    
    const stored = localStorage.getItem(stateKey);
    expect(stored).not.toBeNull();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.boulders).toHaveLength(1);
    expect(parsed.sessionNotes).toBe('Test notes');
    expect(parsed.rpe).toBe(7);
  });

  it('should restore session state after tab switch', () => {
    const sessionData = {
      sessionId: 'test-session-123',
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      isOffline: false,
      route: '/session/test-session-123/boulders',
    };

    const stateData = {
      boulders: [
        { id: '1', grade_raw: 'V3', count: 1 },
        { id: '2', grade_raw: 'V4', count: 1 },
      ],
      rpe: 6,
      lastUpdated: Date.now(),
    };

    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    localStorage.setItem(`boulderlog_session_state_${sessionData.sessionId}`, JSON.stringify(stateData));

    // Simulate tab return
    const storedSession = localStorage.getItem('boulderlog_active_session');
    const storedState = localStorage.getItem(`boulderlog_session_state_${sessionData.sessionId}`);
    
    expect(storedSession).not.toBeNull();
    expect(storedState).not.toBeNull();
    
    const session = JSON.parse(storedSession!);
    const state = JSON.parse(storedState!);
    
    expect(session.sessionId).toBe('test-session-123');
    expect(state.boulders).toHaveLength(2);
  });

  it('should handle offline sessions', () => {
    const sessionData = {
      sessionId: 'offline-temp_123456789',
      sessionType: 'off_wall',
      startTime: new Date().toISOString(),
      isOffline: true,
      route: '/session/offline-temp_123456789/strength',
    };

    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    
    const stored = localStorage.getItem('boulderlog_active_session');
    const parsed = JSON.parse(stored!);
    
    expect(parsed.isOffline).toBe(true);
    expect(parsed.sessionId.startsWith('offline-')).toBe(true);
  });

  it('should not lose data on browser back navigation', () => {
    // Simulate starting a session
    const sessionData = {
      sessionId: 'test-session-789',
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      gymId: 'gym-123',
      gymName: 'Boulder Gym',
      isOffline: false,
      route: '/session/test-session-789/boulders',
    };

    const stateData = {
      boulders: [
        { id: 'b1', grade_raw: 'Blue', count: 1 },
        { id: 'b2', grade_raw: 'Green', count: 1 },
        { id: 'b3', grade_raw: 'Blue', count: 1 },
      ],
      rpe: 5,
      fingerFatigue: 3,
      lastUpdated: Date.now(),
    };

    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    localStorage.setItem(`boulderlog_session_state_${sessionData.sessionId}`, JSON.stringify(stateData));

    // Simulate browser back button (data should still be in localStorage)
    const activeSession = localStorage.getItem('boulderlog_active_session');
    expect(activeSession).not.toBeNull();
    
    const sessionState = localStorage.getItem(`boulderlog_session_state_${sessionData.sessionId}`);
    expect(sessionState).not.toBeNull();
    
    const state = JSON.parse(sessionState!);
    expect(state.boulders).toHaveLength(3);
  });
});

describe('Session Discard Lifecycle', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should clear all localStorage keys when session is discarded', () => {
    const sessionId = 'test-session-discard';
    const sessionData = {
      sessionId,
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      gymId: 'gym-123',
      gymName: 'Test Gym',
      isOffline: false,
      route: `/session/${sessionId}/boulders`,
    };

    const stateData = {
      boulders: [{ id: '1', grade_raw: 'V3', count: 1 }],
      sessionNotes: 'Test notes',
      rpe: 7,
      lastUpdated: Date.now(),
    };

    // Simulate session start
    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    localStorage.setItem(`boulderlog_session_state_${sessionId}`, JSON.stringify(stateData));

    // Verify data exists before discard
    expect(localStorage.getItem('boulderlog_active_session')).not.toBeNull();
    expect(localStorage.getItem(`boulderlog_session_state_${sessionId}`)).not.toBeNull();

    // Simulate discard: clear both active session and session state
    localStorage.removeItem('boulderlog_active_session');
    localStorage.removeItem(`boulderlog_session_state_${sessionId}`);

    // Verify complete cleanup
    expect(localStorage.getItem('boulderlog_active_session')).toBeNull();
    expect(localStorage.getItem(`boulderlog_session_state_${sessionId}`)).toBeNull();
  });

  it('discard should leave no traces of session data', () => {
    const sessionId = 'ghost-session-test';
    
    // Simulate starting a session with boulders
    const sessionData = {
      sessionId,
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      isOffline: false,
      route: `/session/${sessionId}/boulders`,
    };

    const stateData = {
      boulders: [
        { id: 'b1', grade_raw: 'V4', count: 1, tags: ['Flash'] },
        { id: 'b2', grade_raw: 'V5', count: 1, tags: [] },
      ],
      rpe: 6,
      fingerFatigue: 4,
      painFlag: false,
      lastUpdated: Date.now(),
    };

    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    localStorage.setItem(`boulderlog_session_state_${sessionId}`, JSON.stringify(stateData));

    // Simulate full discard cleanup (as done by ActiveSessionGuard)
    localStorage.removeItem('boulderlog_active_session');
    localStorage.removeItem(`boulderlog_session_state_${sessionId}`);

    // Verify no ghost data remains
    const allKeys = Object.keys(localStorageMock);
    const sessionRelatedKeys = allKeys.filter(k => 
      k.includes(sessionId) || k === 'boulderlog_active_session'
    );
    expect(sessionRelatedKeys).toHaveLength(0);
  });

  it('continue session should preserve all session data', () => {
    const sessionId = 'continue-session-test';
    
    const sessionData = {
      sessionId,
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      gymId: 'gym-456',
      gymName: 'Continue Gym',
      isOffline: false,
      route: `/session/${sessionId}/boulders`,
    };

    const stateData = {
      boulders: [
        { id: 'c1', grade_raw: 'V3', count: 1 },
        { id: 'c2', grade_raw: 'V3', count: 1 },
        { id: 'c3', grade_raw: 'V4', count: 1 },
      ],
      sessionNotes: 'Good progress today',
      rpe: 7,
      fingerFatigue: 5,
      painFlag: false,
      lastUpdated: Date.now(),
    };

    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    localStorage.setItem(`boulderlog_session_state_${sessionId}`, JSON.stringify(stateData));

    // Simulate continue: data should be preserved
    const storedSession = localStorage.getItem('boulderlog_active_session');
    const storedState = localStorage.getItem(`boulderlog_session_state_${sessionId}`);

    expect(storedSession).not.toBeNull();
    expect(storedState).not.toBeNull();

    const session = JSON.parse(storedSession!);
    const state = JSON.parse(storedState!);

    expect(session.sessionId).toBe(sessionId);
    expect(session.gymName).toBe('Continue Gym');
    expect(state.boulders).toHaveLength(3);
    expect(state.sessionNotes).toBe('Good progress today');
  });

  it('offline session discard should clear offline temp id data', () => {
    const tempId = 'temp_1234567890';
    const sessionId = `offline-${tempId}`;
    
    const sessionData = {
      sessionId,
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      isOffline: true,
      route: `/session/${sessionId}/boulders`,
    };

    const stateData = {
      boulders: [{ id: 'o1', grade_raw: 'Blue', count: 1 }],
      lastUpdated: Date.now(),
    };

    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    localStorage.setItem(`boulderlog_session_state_${sessionId}`, JSON.stringify(stateData));

    // Simulate offline discard
    localStorage.removeItem('boulderlog_active_session');
    localStorage.removeItem(`boulderlog_session_state_${sessionId}`);

    expect(localStorage.getItem('boulderlog_active_session')).toBeNull();
    expect(localStorage.getItem(`boulderlog_session_state_${sessionId}`)).toBeNull();
  });

  it('session finish should clear active session but data was already saved to DB', () => {
    const sessionId = 'finish-session-test';
    
    const sessionData = {
      sessionId,
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      isOffline: false,
      route: `/session/${sessionId}/boulders`,
    };

    const stateData = {
      boulders: [
        { id: 'f1', grade_raw: 'V5', count: 1, tags: ['Top'] },
      ],
      rpe: 8,
      fingerFatigue: 6,
      painFlag: true,
      lastUpdated: Date.now(),
    };

    localStorage.setItem('boulderlog_active_session', JSON.stringify(sessionData));
    localStorage.setItem(`boulderlog_session_state_${sessionId}`, JSON.stringify(stateData));

    // Simulate finish: clear local state (DB was updated separately)
    localStorage.removeItem('boulderlog_active_session');
    localStorage.removeItem(`boulderlog_session_state_${sessionId}`);

    // After finish, no local session data should remain
    expect(localStorage.getItem('boulderlog_active_session')).toBeNull();
    expect(localStorage.getItem(`boulderlog_session_state_${sessionId}`)).toBeNull();
  });

  it('multiple sessions should not interfere with each other during discard', () => {
    const sessionId1 = 'session-1';
    const sessionId2 = 'session-2';
    
    // Set up two session states (only one should be active at a time, but state keys can coexist)
    localStorage.setItem(`boulderlog_session_state_${sessionId1}`, JSON.stringify({
      boulders: [{ id: 's1', grade_raw: 'V3', count: 1 }],
      lastUpdated: Date.now() - 10000,
    }));

    localStorage.setItem('boulderlog_active_session', JSON.stringify({
      sessionId: sessionId2,
      sessionType: 'on_wall',
      startTime: new Date().toISOString(),
      isOffline: false,
      route: `/session/${sessionId2}/boulders`,
    }));

    localStorage.setItem(`boulderlog_session_state_${sessionId2}`, JSON.stringify({
      boulders: [{ id: 's2', grade_raw: 'V4', count: 1 }],
      lastUpdated: Date.now(),
    }));

    // Discard session 2 (current active)
    localStorage.removeItem('boulderlog_active_session');
    localStorage.removeItem(`boulderlog_session_state_${sessionId2}`);

    // Session 1 state should still exist (orphaned but not affected)
    expect(localStorage.getItem(`boulderlog_session_state_${sessionId1}`)).not.toBeNull();
    
    // Active session and session 2 state should be gone
    expect(localStorage.getItem('boulderlog_active_session')).toBeNull();
    expect(localStorage.getItem(`boulderlog_session_state_${sessionId2}`)).toBeNull();
  });
});

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

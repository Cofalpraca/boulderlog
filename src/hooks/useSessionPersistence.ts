import { useEffect, useCallback } from 'react';
import { useActiveSession, ActiveSessionData } from '@/contexts/ActiveSessionContext';

const SESSION_STATE_KEY_PREFIX = 'boulderlog_session_state_';

interface SessionState {
  boulders?: unknown[];
  deletedBoulderIds?: string[];
  sessionItems?: unknown[];
  sessionNotes?: string;
  rpe?: number;
  fingerFatigue?: number;
  painFlag?: boolean;
  failedAttempts?: number;
  flashCount?: number;
  lastUpdated: number;
}

export function useSessionPersistence(sessionId: string | undefined) {
  const { setActiveSession, clearActiveSession } = useActiveSession();

  const storageKey = sessionId ? `${SESSION_STATE_KEY_PREFIX}${sessionId}` : null;

  // Save session state to localStorage
  const saveSessionState = useCallback((state: Omit<SessionState, 'lastUpdated'>) => {
    if (!storageKey) return;
    
    const stateWithTimestamp: SessionState = {
      ...state,
      lastUpdated: Date.now(),
    };
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateWithTimestamp));
    } catch (e) {
      console.error('Failed to save session state:', e);
    }
  }, [storageKey]);

  // Load session state from localStorage
  const loadSessionState = useCallback((): SessionState | null => {
    if (!storageKey) return null;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as SessionState;
      }
    } catch (e) {
      console.error('Failed to load session state:', e);
    }
    return null;
  }, [storageKey]);

  // Clear session state from localStorage
  const clearSessionState = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    clearActiveSession();
  }, [storageKey, clearActiveSession]);

  // Register active session
  const registerActiveSession = useCallback((data: Omit<ActiveSessionData, 'startTime'> & { startTime?: string }) => {
    setActiveSession({
      ...data,
      startTime: data.startTime || new Date().toISOString(),
    });
  }, [setActiveSession]);

  // Handle beforeunload to warn user about unsaved session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (storageKey && localStorage.getItem(storageKey)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [storageKey]);

  return {
    saveSessionState,
    loadSessionState,
    clearSessionState,
    registerActiveSession,
  };
}

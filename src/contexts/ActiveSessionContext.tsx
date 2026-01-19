import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type SessionType = Database['public']['Enums']['session_type'];

export interface ActiveSessionData {
  sessionId: string;
  sessionType: SessionType;
  startTime: string;
  gymId?: string;
  gymName?: string;
  isOffline: boolean;
  route: string;
}

interface ActiveSessionContextType {
  activeSession: ActiveSessionData | null;
  setActiveSession: (session: ActiveSessionData | null) => void;
  clearActiveSession: () => void;
  hasActiveSession: boolean;
  restoreSession: () => void;
}

const STORAGE_KEY = 'boulderlog_active_session';

const ActiveSessionContext = createContext<ActiveSessionContextType | undefined>(undefined);

export function ActiveSessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSessionState] = useState<ActiveSessionData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored) as ActiveSessionData;
        setActiveSessionState(session);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Handle visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const session = JSON.parse(stored) as ActiveSessionData;
            setActiveSessionState(session);
            
            // If we're not on the session route, prompt to restore
            const currentPath = location.pathname;
            if (!currentPath.includes('/session/') && session.route) {
              // Will be handled by the navigation guard
            }
          } catch (e) {
            // Invalid data, ignore
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [location.pathname]);

  // Persist to localStorage whenever activeSession changes
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeSession));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeSession]);

  const setActiveSession = useCallback((session: ActiveSessionData | null) => {
    setActiveSessionState(session);
  }, []);

  const clearActiveSession = useCallback(() => {
    setActiveSessionState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const restoreSession = useCallback(() => {
    if (activeSession?.route) {
      navigate(activeSession.route);
    }
  }, [activeSession, navigate]);

  return (
    <ActiveSessionContext.Provider
      value={{
        activeSession,
        setActiveSession,
        clearActiveSession,
        hasActiveSession: !!activeSession,
        restoreSession,
      }}
    >
      {children}
    </ActiveSessionContext.Provider>
  );
}

export function useActiveSession() {
  const context = useContext(ActiveSessionContext);
  if (context === undefined) {
    throw new Error('useActiveSession must be used within an ActiveSessionProvider');
  }
  return context;
}

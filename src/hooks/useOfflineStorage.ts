import { useState, useEffect, useCallback } from 'react';

// IndexedDB database configuration
const DB_NAME = 'climbtrack-offline';
const DB_VERSION = 2; // Bumped version for new stores
const STORES = {
  pendingSessions: 'pendingSessions',
  pendingLogs: 'pendingLogs',
  pendingSessionItems: 'pendingSessionItems',
  pendingSessionSets: 'pendingSessionSets',
  cachedData: 'cachedData',
};

export interface PendingSession {
  id: string;
  tempId: string;
  user_id: string;
  session_type: 'on_wall' | 'off_wall';
  subtype?: string;
  date_start: string;
  date_end?: string;
  gym_id?: string;
  notes?: string;
  rpe?: number;
  finger_fatigue?: number;
  pain_flag?: boolean;
  createdAt: number;
  synced: boolean;
}

export interface PendingBoulderLog {
  id: string;
  sessionTempId: string;
  grade_raw: string;
  grade_type: string;
  count: number;
  tags?: string[];
  notes?: string;
}

export interface PendingSessionItem {
  id: string;
  sessionTempId: string;
  exercise_id: string;
  exercise_name: string;
  exercise_category: string;
  order_index: number;
}

export interface PendingSessionSet {
  id: string;
  sessionItemId: string;
  set_no: number;
  reps: number | null;
  duration_sec: number | null;
  weight_kg: number | null;
  rpe: number | null;
}

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.pendingSessions)) {
        db.createObjectStore(STORES.pendingSessions, { keyPath: 'tempId' });
      }
      if (!db.objectStoreNames.contains(STORES.pendingLogs)) {
        const logsStore = db.createObjectStore(STORES.pendingLogs, { keyPath: 'id' });
        logsStore.createIndex('sessionTempId', 'sessionTempId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.pendingSessionItems)) {
        const itemsStore = db.createObjectStore(STORES.pendingSessionItems, { keyPath: 'id' });
        itemsStore.createIndex('sessionTempId', 'sessionTempId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.pendingSessionSets)) {
        const setsStore = db.createObjectStore(STORES.pendingSessionSets, { keyPath: 'id' });
        setsStore.createIndex('sessionItemId', 'sessionItemId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.cachedData)) {
        db.createObjectStore(STORES.cachedData, { keyPath: 'key' });
      }
    };
  });
}

// Hook for managing offline storage
export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Count pending sessions
  const refreshPendingCount = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingSessions, 'readonly');
      const store = tx.objectStore(STORES.pendingSessions);
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        setPendingCount(countRequest.result);
      };
    } catch (error) {
      console.error('Failed to count pending sessions:', error);
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Save session offline
  const saveSessionOffline = useCallback(async (session: Omit<PendingSession, 'createdAt' | 'synced'>) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingSessions, 'readwrite');
      const store = tx.objectStore(STORES.pendingSessions);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          ...session,
          createdAt: Date.now(),
          synced: false,
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      await refreshPendingCount();
      return true;
    } catch (error) {
      console.error('Failed to save session offline:', error);
      return false;
    }
  }, [refreshPendingCount]);

  // Update session offline (for adding end time, notes, etc.)
  const updateSessionOffline = useCallback(async (tempId: string, updates: Partial<PendingSession>) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingSessions, 'readwrite');
      const store = tx.objectStore(STORES.pendingSessions);
      
      const existing = await new Promise<PendingSession | undefined>((resolve, reject) => {
        const request = store.get(tempId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (existing) {
        await new Promise<void>((resolve, reject) => {
          const request = store.put({ ...existing, ...updates });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update session offline:', error);
      return false;
    }
  }, []);

  // Save boulder logs offline
  const saveBoulderLogsOffline = useCallback(async (sessionTempId: string, logs: Omit<PendingBoulderLog, 'sessionTempId'>[]) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingLogs, 'readwrite');
      const store = tx.objectStore(STORES.pendingLogs);
      
      for (const log of logs) {
        await new Promise<void>((resolve, reject) => {
          const request = store.put({ ...log, sessionTempId });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save logs offline:', error);
      return false;
    }
  }, []);

  // Save session items offline (for OFF-WALL sessions)
  const saveSessionItemsOffline = useCallback(async (sessionTempId: string, items: Omit<PendingSessionItem, 'sessionTempId'>[]) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingSessionItems, 'readwrite');
      const store = tx.objectStore(STORES.pendingSessionItems);
      
      for (const item of items) {
        await new Promise<void>((resolve, reject) => {
          const request = store.put({ ...item, sessionTempId });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save session items offline:', error);
      return false;
    }
  }, []);

  // Save session sets offline (for OFF-WALL sessions)
  const saveSessionSetsOffline = useCallback(async (sessionItemId: string, sets: Omit<PendingSessionSet, 'sessionItemId'>[]) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingSessionSets, 'readwrite');
      const store = tx.objectStore(STORES.pendingSessionSets);
      
      for (const set of sets) {
        await new Promise<void>((resolve, reject) => {
          const request = store.put({ ...set, sessionItemId });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save session sets offline:', error);
      return false;
    }
  }, []);

  // Get all pending sessions
  const getPendingSessions = useCallback(async (): Promise<PendingSession[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingSessions, 'readonly');
      const store = tx.objectStore(STORES.pendingSessions);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get pending sessions:', error);
      return [];
    }
  }, []);

  // Get boulder logs for a session
  const getLogsForSession = useCallback(async (sessionTempId: string): Promise<PendingBoulderLog[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingLogs, 'readonly');
      const store = tx.objectStore(STORES.pendingLogs);
      const index = store.index('sessionTempId');
      
      return new Promise((resolve, reject) => {
        const request = index.getAll(sessionTempId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get logs for session:', error);
      return [];
    }
  }, []);

  // Get session items for an offline session
  const getSessionItemsForSession = useCallback(async (sessionTempId: string): Promise<PendingSessionItem[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingSessionItems, 'readonly');
      const store = tx.objectStore(STORES.pendingSessionItems);
      const index = store.index('sessionTempId');
      
      return new Promise((resolve, reject) => {
        const request = index.getAll(sessionTempId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get session items:', error);
      return [];
    }
  }, []);

  // Get session sets for an item
  const getSessionSetsForItem = useCallback(async (sessionItemId: string): Promise<PendingSessionSet[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.pendingSessionSets, 'readonly');
      const store = tx.objectStore(STORES.pendingSessionSets);
      const index = store.index('sessionItemId');
      
      return new Promise((resolve, reject) => {
        const request = index.getAll(sessionItemId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get session sets:', error);
      return [];
    }
  }, []);

  // Delete a pending session and its logs/items/sets
  const deletePendingSession = useCallback(async (tempId: string) => {
    try {
      const db = await openDB();
      
      // Delete session
      const sessionTx = db.transaction(STORES.pendingSessions, 'readwrite');
      const sessionStore = sessionTx.objectStore(STORES.pendingSessions);
      await new Promise<void>((resolve, reject) => {
        const request = sessionStore.delete(tempId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      // Delete associated boulder logs
      const logsTx = db.transaction(STORES.pendingLogs, 'readwrite');
      const logsStore = logsTx.objectStore(STORES.pendingLogs);
      const logsIndex = logsStore.index('sessionTempId');
      
      const logs = await new Promise<PendingBoulderLog[]>((resolve, reject) => {
        const request = logsIndex.getAll(tempId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      
      for (const log of logs) {
        await new Promise<void>((resolve, reject) => {
          const request = logsStore.delete(log.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      // Delete associated session items and their sets
      const itemsTx = db.transaction(STORES.pendingSessionItems, 'readwrite');
      const itemsStore = itemsTx.objectStore(STORES.pendingSessionItems);
      const itemsIndex = itemsStore.index('sessionTempId');
      
      const items = await new Promise<PendingSessionItem[]>((resolve, reject) => {
        const request = itemsIndex.getAll(tempId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      const setsTx = db.transaction(STORES.pendingSessionSets, 'readwrite');
      const setsStore = setsTx.objectStore(STORES.pendingSessionSets);
      const setsIndex = setsStore.index('sessionItemId');

      for (const item of items) {
        // Delete sets for this item
        const sets = await new Promise<PendingSessionSet[]>((resolve, reject) => {
          const request = setsIndex.getAll(item.id);
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });

        for (const set of sets) {
          await new Promise<void>((resolve, reject) => {
            const request = setsStore.delete(set.id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        }

        // Delete the item
        await new Promise<void>((resolve, reject) => {
          const request = itemsStore.delete(item.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      
      await refreshPendingCount();
      return true;
    } catch (error) {
      console.error('Failed to delete pending session:', error);
      return false;
    }
  }, [refreshPendingCount]);

  // Cache data for offline use
  const cacheData = useCallback(async (key: string, data: unknown) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.cachedData, 'readwrite');
      const store = tx.objectStore(STORES.cachedData);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ key, data, cachedAt: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to cache data:', error);
      return false;
    }
  }, []);

  // Get cached data
  const getCachedData = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.cachedData, 'readonly');
      const store = tx.objectStore(STORES.cachedData);
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.data || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }, []);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    setIsSyncing,
    saveSessionOffline,
    updateSessionOffline,
    saveBoulderLogsOffline,
    saveSessionItemsOffline,
    saveSessionSetsOffline,
    getPendingSessions,
    getLogsForSession,
    getSessionItemsForSession,
    getSessionSetsForItem,
    deletePendingSession,
    cacheData,
    getCachedData,
    refreshPendingCount,
  };
}

// Generate a temporary ID for offline sessions
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

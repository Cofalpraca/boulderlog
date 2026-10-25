import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'climbtrack-offline';
const DB_VERSION = 2;
const SESSION_STORES = ['pendingSessions', 'pendingLogs', 'pendingSessionItems', 'pendingSessionSets'];
const STORAGE_CHANGED = 'offline-storage-changed';

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
  pain_level?: number | null;
  pain_area?: string | null;
  pain_note?: string | null;
  failed_attempts?: number;
  flash_count?: number;
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
  protocol_id?: string;
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
export type OfflineItemWithSets = Omit<PendingSessionItem, 'sessionTempId'> & {
  sets: Omit<PendingSessionSet, 'sessionItemId'>[];
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingSessions')) {
        db.createObjectStore('pendingSessions', { keyPath: 'tempId' });
      }
      for (const [name, index] of [
        ['pendingLogs', 'sessionTempId'], ['pendingSessionItems', 'sessionTempId'],
        ['pendingSessionSets', 'sessionItemId'],
      ]) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' }).createIndex(index, index);
        }
      }
      if (!db.objectStoreNames.contains('cachedData')) db.createObjectStore('cachedData', { keyPath: 'key' });
    };
  });
}
function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
// Resolve only after commit: a successful individual request can still roll back.
async function transact<T>(stores: string[], mode: IDBTransactionMode, action: (tx: IDBTransaction) => Promise<T>): Promise<T> {
  const db = await openDB();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(stores, mode);
      let result: T;
      let actionError: unknown;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(actionError || tx.error || new Error('Offline transaction aborted'));
      action(tx).then(value => { result = value; }).catch(error => {
        actionError = error;
        tx.abort();
      });
    });
  } finally {
    db.close();
  }
}
async function removeDetails(tx: IDBTransaction, tempId: string) {
  const logsStore = tx.objectStore('pendingLogs');
  const logs: PendingBoulderLog[] = await requestResult(logsStore.index('sessionTempId').getAll(tempId));
  for (const log of logs) logsStore.delete(log.id);
  const itemsStore = tx.objectStore('pendingSessionItems');
  const items: PendingSessionItem[] = await requestResult(itemsStore.index('sessionTempId').getAll(tempId));
  const setsStore = tx.objectStore('pendingSessionSets');
  for (const item of items) {
    const sets: PendingSessionSet[] = await requestResult(setsStore.index('sessionItemId').getAll(item.id));
    for (const set of sets) setsStore.delete(set.id);
    itemsStore.delete(item.id);
  }
}
async function writeOffline(action: () => Promise<unknown>): Promise<boolean> {
  try {
    await action();
    window.dispatchEvent(new Event(STORAGE_CHANGED));
    return true;
  } catch (error) {
    console.error('Offline storage write failed:', error);
    return false;
  }
}
export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);
  const getPendingSessions = useCallback((): Promise<PendingSession[]> =>
    transact(['pendingSessions'], 'readonly', tx => requestResult(tx.objectStore('pendingSessions').getAll())), []);
  const refreshPendingCount = useCallback(async () => {
    try {
      const sessions = await getPendingSessions();
      setPendingCount(sessions.filter(s => !s.synced && s.date_end).length);
    } catch (error) {
      console.error('Failed to count pending sessions:', error);
    }
  }, [getPendingSessions]);
  useEffect(() => {
    void refreshPendingCount();
    window.addEventListener(STORAGE_CHANGED, refreshPendingCount);
    return () => window.removeEventListener(STORAGE_CHANGED, refreshPendingCount);
  }, [refreshPendingCount]);
  const saveSessionOffline = useCallback((session: Omit<PendingSession, 'createdAt' | 'synced'>) =>
    writeOffline(() => transact(['pendingSessions'], 'readwrite', async tx => {
      await requestResult(tx.objectStore('pendingSessions').put({ ...session, createdAt: Date.now(), synced: false }));
    })), []);
  const updateSessionOffline = useCallback((tempId: string, updates: Partial<PendingSession>) =>
    writeOffline(() => transact(['pendingSessions'], 'readwrite', async tx => {
      const store = tx.objectStore('pendingSessions');
      const existing = await requestResult(store.get(tempId));
      if (!existing) throw new Error('Offline session not found');
      await requestResult(store.put({ ...existing, ...updates }));
    })), []);
  const saveBoulderLogsOffline = useCallback((sessionTempId: string, logs: Omit<PendingBoulderLog, 'sessionTempId'>[]) =>
    writeOffline(() => transact(['pendingLogs'], 'readwrite', async tx => {
      for (const log of logs) tx.objectStore('pendingLogs').put({ ...log, sessionTempId });
    })), []);
  const saveSessionItemsOffline = useCallback((sessionTempId: string, items: Omit<PendingSessionItem, 'sessionTempId'>[]) =>
    writeOffline(() => transact(['pendingSessionItems'], 'readwrite', async tx => {
      for (const item of items) tx.objectStore('pendingSessionItems').put({ ...item, sessionTempId });
    })), []);
  const saveSessionSetsOffline = useCallback((sessionItemId: string, sets: Omit<PendingSessionSet, 'sessionItemId'>[]) =>
    writeOffline(() => transact(['pendingSessionSets'], 'readwrite', async tx => {
      for (const set of sets) tx.objectStore('pendingSessionSets').put({ ...set, sessionItemId });
    })), []);
  const getLogsForSession = useCallback((tempId: string): Promise<PendingBoulderLog[]> =>
    transact(['pendingLogs'], 'readonly', tx => requestResult(tx.objectStore('pendingLogs').index('sessionTempId').getAll(tempId))), []);
  const getSessionItemsForSession = useCallback((tempId: string): Promise<PendingSessionItem[]> =>
    transact(['pendingSessionItems'], 'readonly', tx => requestResult(tx.objectStore('pendingSessionItems').index('sessionTempId').getAll(tempId))), []);
  const getSessionSetsForItem = useCallback((itemId: string): Promise<PendingSessionSet[]> =>
    transact(['pendingSessionSets'], 'readonly', tx => requestResult(tx.objectStore('pendingSessionSets').index('sessionItemId').getAll(itemId))), []);
  // Publish date_end and all child records in a single transaction.
  const completeSessionOffline = useCallback((tempId: string, updates: Partial<PendingSession>,
    details: { logs?: Omit<PendingBoulderLog, 'sessionTempId'>[]; items?: OfflineItemWithSets[] }) =>
    writeOffline(() => transact(SESSION_STORES, 'readwrite', async tx => {
      const store = tx.objectStore('pendingSessions');
      const session: PendingSession | undefined = await requestResult(store.get(tempId));
      if (!session || !updates.date_end) throw new Error('Offline session or end time missing');
      await removeDetails(tx, tempId);
      for (const log of details.logs || []) tx.objectStore('pendingLogs').put({ ...log, sessionTempId: tempId });
      for (const { sets, ...item } of details.items || []) {
        tx.objectStore('pendingSessionItems').put({ ...item, sessionTempId: tempId });
        for (const set of sets) tx.objectStore('pendingSessionSets').put({ ...set, sessionItemId: item.id });
      }
      store.put({ ...session, ...updates, tempId, synced: false });
    })), []);
  const deletePendingSession = useCallback((tempId: string) =>
    writeOffline(() => transact(SESSION_STORES, 'readwrite', async tx => {
      await removeDetails(tx, tempId);
      tx.objectStore('pendingSessions').delete(tempId);
    })), []);
  const cacheData = useCallback((key: string, data: unknown) =>
    writeOffline(() => transact(['cachedData'], 'readwrite', async tx => {
      tx.objectStore('cachedData').put({ key, data, cachedAt: Date.now() });
    })), []);
  const getCachedData = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      return await transact(['cachedData'], 'readonly', async tx => {
        const record = await requestResult(tx.objectStore('cachedData').get(key));
        return record?.data ?? null;
      });
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }, []);
  return {
    isOnline, pendingCount, isSyncing, setIsSyncing, saveSessionOffline, updateSessionOffline,
    saveBoulderLogsOffline, saveSessionItemsOffline, saveSessionSetsOffline, completeSessionOffline,
    getPendingSessions, getLogsForSession, getSessionItemsForSession, getSessionSetsForItem,
    deletePendingSession, cacheData, getCachedData, refreshPendingCount,
  };
}
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

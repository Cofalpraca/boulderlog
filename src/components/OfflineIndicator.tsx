import { useCallback, useEffect, useRef, useState } from 'react';
import { WifiOff, Cloud, Loader2, CheckCircle2 } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { syncOfflineSessions } from '@/lib/syncOfflineSessions';
import { useQueryClient } from '@tanstack/react-query';

export function OfflineIndicator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    isOnline, 
    pendingCount, 
    isSyncing, 
    setIsSyncing,
    getPendingSessions, 
    getLogsForSession,
    getSessionItemsForSession,
    getSessionSetsForItem,
    deletePendingSession,
    refreshPendingCount,
  } = useOfflineStorage();
  
  const syncInProgress = useRef(false);
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Show banner when offline or when there are pending sessions
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowBanner(true);
    } else if (pendingCount > 0) {
      setWasOffline(true);
      setShowBanner(true);
    } else if (pendingCount === 0 && wasOffline) {
      // Hide after successful sync
      const timer = setTimeout(() => {
        setShowBanner(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount, wasOffline]);

  const syncPendingSessions = useCallback(async () => {
    if (!user || syncInProgress.current) return;
    syncInProgress.current = true;
    setIsSyncing(true);
    try {
      const { syncedCount, failedCount } = await syncOfflineSessions(user.id, {
        getPendingSessions, getLogsForSession, getSessionItemsForSession,
        getSessionSetsForItem, deletePendingSession,
      }, supabase);
      if (syncedCount > 0) {
        toast.success(`Synced ${syncedCount} offline session${syncedCount > 1 ? 's' : ''}`);
        for (const key of ['sessions', 'dashboard_on_wall', 'dashboard_off_wall', 'session_history']) {
          void queryClient.invalidateQueries({ queryKey: [key] });
        }
      }
      if (failedCount > 0) toast.error('Some sessions could not be synced. Your offline data is safe; try again.');
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync sessions. Your offline data is safe; try again.');
    } finally {
      await refreshPendingCount();
      syncInProgress.current = false;
      setIsSyncing(false);
    }
  }, [user, getPendingSessions, getLogsForSession, getSessionItemsForSession,
    getSessionSetsForItem, deletePendingSession, queryClient, refreshPendingCount, setIsSyncing]);

  useEffect(() => {
    if (isOnline && pendingCount > 0) void syncPendingSessions();
  }, [isOnline, pendingCount, syncPendingSessions]);

  useEffect(() => {
    const handleSync = () => { if (isOnline) void syncPendingSessions(); };
    window.addEventListener('sw-sync-sessions', handleSync);
    return () => window.removeEventListener('sw-sync-sessions', handleSync);
  }, [isOnline, syncPendingSessions]);

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed bottom-20 left-4 right-4 z-50 p-3 rounded-xl shadow-lg transition-all animate-slide-up ${
        !isOnline 
          ? 'bg-amber-500/90 text-amber-950' 
          : pendingCount > 0 
            ? 'bg-primary/90 text-primary-foreground'
            : 'bg-green-500/90 text-green-950'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">You're offline</p>
                <p className="text-xs opacity-80">Sessions will sync when back online</p>
              </div>
            </>
          ) : pendingCount > 0 ? (
            <>
              <Cloud className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">{pendingCount} session{pendingCount > 1 ? 's' : ''} pending</p>
                <p className="text-xs opacity-80">Ready to sync</p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium text-sm">All sessions synced!</p>
            </>
          )}
        </div>
        
        {isOnline && pendingCount > 0 && (
          <Button 
            size="sm" 
            variant="secondary"
            onClick={syncPendingSessions}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Syncing...
              </>
            ) : (
              'Sync Now'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

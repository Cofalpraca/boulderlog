import { useEffect, useState } from 'react';
import { WifiOff, Cloud, Loader2, CheckCircle2 } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
    deletePendingSession,
    refreshPendingCount,
  } = useOfflineStorage();
  
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Show banner when offline or when there are pending sessions
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowBanner(true);
    } else if (wasOffline && pendingCount > 0) {
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

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing && user) {
      syncPendingSessions();
    }
  }, [isOnline, pendingCount, user]);

  const syncPendingSessions = async () => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const pendingSessions = await getPendingSessions();
      let syncedCount = 0;
      
      for (const session of pendingSessions) {
        if (session.synced) continue;
        
        try {
          // Create the session in Supabase
          const { data: newSession, error: sessionError } = await supabase
            .from('sessions')
            .insert({
              user_id: session.user_id,
              session_type: session.session_type,
              subtype: session.subtype || null,
              date_start: session.date_start,
              date_end: session.date_end || null,
              notes: session.notes || null,
              rpe: session.rpe || null,
              finger_fatigue: session.finger_fatigue || null,
              pain_flag: session.pain_flag || null,
            })
            .select()
            .single();
          
          if (sessionError) throw sessionError;
          
          // Link gym if present
          if (session.gym_id && newSession) {
            await supabase.from('session_gyms').insert({
              session_id: newSession.id,
              gym_id: session.gym_id,
            });
          }
          
          // Get and insert boulder logs
          const logs = await getLogsForSession(session.tempId);
          if (logs.length > 0 && newSession) {
            const logsToInsert = logs.map(log => ({
              session_id: newSession.id,
              grade_raw: log.grade_raw,
              grade_type: log.grade_type as 'font' | 'v_scale' | 'colors' | 'numeric',
              count: log.count,
              tags: log.tags || null,
              notes: log.notes || null,
            }));
            
            await supabase.from('boulder_logs').insert(logsToInsert);
          }
          
          // Delete the pending session after successful sync
          await deletePendingSession(session.tempId);
          syncedCount++;
        } catch (error) {
          console.error('Failed to sync session:', session.tempId, error);
        }
      }
      
      if (syncedCount > 0) {
        toast.success(`Synced ${syncedCount} offline session${syncedCount > 1 ? 's' : ''}`);
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard_on_wall'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard_off_wall'] });
        queryClient.invalidateQueries({ queryKey: ['session_history'] });
      }
      
      await refreshPendingCount();
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync some sessions');
    } finally {
      setIsSyncing(false);
    }
  };

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

import { useState } from 'react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloudOff, RefreshCw, Loader2, CheckCircle2, Mountain, Dumbbell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PendingSyncCard() {
  const { user } = useAuth();
  const { toast } = useToast();
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
    refreshPendingCount
  } = useOfflineStorage();
  
  const [syncProgress, setSyncProgress] = useState<string>('');

  const syncPendingSessions = async () => {
    if (!user || !isOnline || isSyncing) return;
    
    setIsSyncing(true);
    setSyncProgress('Starting sync...');
    
    try {
      const pendingSessions = await getPendingSessions();
      let syncedCount = 0;
      
      for (const pendingSession of pendingSessions) {
        setSyncProgress(`Syncing session ${syncedCount + 1}/${pendingSessions.length}...`);
        
        try {
          // Create session in Supabase
          const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
              user_id: pendingSession.user_id,
              session_type: pendingSession.session_type,
              date_start: pendingSession.date_start,
              date_end: pendingSession.date_end || null,
              notes: pendingSession.notes || null,
              rpe: pendingSession.rpe || null,
              finger_fatigue: pendingSession.finger_fatigue || null,
              pain_flag: pendingSession.pain_flag || null,
            })
            .select('id')
            .single();
          
          if (sessionError || !session) {
            console.error('Failed to sync session:', sessionError);
            continue;
          }
          
          // Link gym if present
          if (pendingSession.gym_id) {
            await supabase.from('session_gyms').insert({
              session_id: session.id,
              gym_id: pendingSession.gym_id,
            });
          }
          
          // Sync boulder logs (ON-WALL)
          if (pendingSession.session_type === 'on_wall') {
            const logs = await getLogsForSession(pendingSession.tempId);
            if (logs.length > 0) {
              const logsToInsert = logs.map(log => ({
                session_id: session.id,
                grade_raw: log.grade_raw,
                grade_type: log.grade_type as 'font' | 'v_scale' | 'colors' | 'numeric',
                count: log.count,
                tags: log.tags || null,
                notes: log.notes || null,
              }));
              await supabase.from('boulder_logs').insert(logsToInsert);
            }
          }
          
          // Sync session items and sets (OFF-WALL)
          if (pendingSession.session_type === 'off_wall') {
            const items = await getSessionItemsForSession(pendingSession.tempId);
            
            for (const item of items) {
              const { data: insertedItem } = await supabase
                .from('session_items')
                .insert({
                  session_id: session.id,
                  exercise_id: item.exercise_id,
                  order_index: item.order_index,
                })
                .select('id')
                .single();
              
              if (insertedItem) {
                const sets = await getSessionSetsForItem(item.id);
                if (sets.length > 0) {
                  const setsToInsert = sets.map(set => ({
                    session_item_id: insertedItem.id,
                    set_no: set.set_no,
                    reps: set.reps,
                    duration_sec: set.duration_sec,
                    weight_kg: set.weight_kg,
                    rpe: set.rpe,
                  }));
                  await supabase.from('session_sets').insert(setsToInsert);
                }
              }
            }
          }
          
          // Delete from IndexedDB
          await deletePendingSession(pendingSession.tempId);
          syncedCount++;
        } catch (error) {
          console.error('Error syncing session:', error);
        }
      }
      
      await refreshPendingCount();
      await queryClient.invalidateQueries({ queryKey: ['sessions'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard_on_wall'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard_off_wall'] });
      
      if (syncedCount > 0) {
        toast({
          title: 'Sync complete!',
          description: `${syncedCount} session${syncedCount > 1 ? 's' : ''} synced successfully`,
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: 'Sync failed',
        description: 'Some sessions could not be synced',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  if (pendingCount === 0) return null;

  return (
    <Card className="glass border-amber-500/50 bg-amber-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <CloudOff className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {pendingCount} offline session{pendingCount > 1 ? 's' : ''} pending
            </p>
            <p className="text-xs text-muted-foreground">
              {isOnline 
                ? isSyncing 
                  ? syncProgress 
                  : 'Ready to sync'
                : 'Waiting for connection'}
            </p>
          </div>
          {isOnline && (
            <Button 
              size="sm" 
              onClick={syncPendingSessions}
              disabled={isSyncing}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

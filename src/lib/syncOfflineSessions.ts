import type { useOfflineStorage } from '@/hooks/useOfflineStorage';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type OfflineStorage = Pick<ReturnType<typeof useOfflineStorage>,
  'getPendingSessions' | 'getLogsForSession' | 'getSessionItemsForSession' |
  'getSessionSetsForItem' | 'deletePendingSession'>;

export async function syncOfflineSessions(userId: string, storage: OfflineStorage, client: SupabaseClient<Database>) {
  const sessions = await storage.getPendingSessions();
  let syncedCount = 0;
  let failedCount = 0;
  for (const session of sessions) {
    if (session.synced || !session.date_end || session.user_id !== userId) continue;
    try {
      const logs = await storage.getLogsForSession(session.tempId);
      const items = await storage.getSessionItemsForSession(session.tempId);
      const itemsWithSets = await Promise.all(items.map(async item => ({
        exercise_id: item.exercise_id, protocol_id: item.protocol_id ?? null, order_index: item.order_index,
        sets: (await storage.getSessionSetsForItem(item.id)).map(set => ({
          set_no: set.set_no, reps: set.reps, duration_sec: set.duration_sec, weight_kg: set.weight_kg, rpe: set.rpe,
        })),
      })));
      const { data, error } = await client.rpc('save_completed_session', {
        p_offline_id: session.tempId,
        p_session: {
          user_id: session.user_id, session_type: session.session_type,
          subtype: session.subtype ?? null, date_start: session.date_start,
          date_end: session.date_end, status: 'completed', gym_id: session.gym_id ?? null,
          notes: session.notes ?? null, rpe: session.rpe ?? null,
          finger_fatigue: session.finger_fatigue ?? null, pain_flag: session.pain_flag ?? null,
          pain_level: session.pain_level ?? null, pain_area: session.pain_area ?? null,
          pain_note: session.pain_note ?? null, failed_attempts: session.failed_attempts ?? null,
          flash_count: session.flash_count ?? null,
        },
        p_logs: logs.map(log => ({
          grade_raw: log.grade_raw, grade_type: log.grade_type, count: log.count,
          tags: log.tags ?? null, notes: log.notes ?? null,
        })),
        p_items: itemsWithSets,
      });
      if (error) throw error;
      if (!data) throw new Error('Server did not confirm the saved session');
      if (!await storage.deletePendingSession(session.tempId)) throw new Error('Local cleanup failed');
      syncedCount++;
    } catch (error) {
      failedCount++;
      console.error('Failed to sync session:', session.tempId, error);
    }
  }
  return { syncedCount, failedCount };
}

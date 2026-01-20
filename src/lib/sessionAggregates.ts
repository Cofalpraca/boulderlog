/**
 * Session Aggregation Utilities
 * 
 * Computes and persists weekly aggregates on session finish.
 */

import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, format } from 'date-fns';
import { logError } from './errorLogger';

interface SessionFinishData {
  sessionId: string;
  userId: string;
  sessionType: 'on_wall' | 'off_wall';
  dateStart: string;
  boulderCount?: number;
  setCount?: number;
  maxGradeRaw?: string | null;
  hasPain?: boolean;
}

/**
 * Update weekly aggregates after a session is finished.
 * Uses upsert to handle both new and existing weeks.
 */
export async function updateWeeklyAggregate(data: SessionFinishData): Promise<boolean> {
  try {
    // Get the week start for this session
    const sessionDate = new Date(data.dateStart);
    const weekStart = startOfWeek(sessionDate, { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    
    // Fetch current aggregate (if exists)
    const { data: existing } = await supabase
      .from('weekly_aggregates')
      .select('*')
      .eq('user_id', data.userId)
      .eq('week_start', weekStartStr)
      .maybeSingle();
    
    // Compute new values
    const newOnWall = (existing?.on_wall_sessions || 0) + (data.sessionType === 'on_wall' ? 1 : 0);
    const newOffWall = (existing?.off_wall_sessions || 0) + (data.sessionType === 'off_wall' ? 1 : 0);
    const newBoulders = (existing?.total_boulders || 0) + (data.boulderCount || 0);
    const newSets = (existing?.total_sets || 0) + (data.setCount || 0);
    const hasPain = (existing?.has_pain || false) || (data.hasPain || false);
    
    // For max grade, we'd need to compare - for now just keep the latest if provided
    // In a full implementation, you'd compare grades properly
    const maxGrade = data.maxGradeRaw || existing?.max_grade_raw || null;
    
    // Upsert the aggregate
    const { error } = await supabase
      .from('weekly_aggregates')
      .upsert({
        user_id: data.userId,
        week_start: weekStartStr,
        on_wall_sessions: newOnWall,
        off_wall_sessions: newOffWall,
        total_boulders: newBoulders,
        total_sets: newSets,
        max_grade_raw: maxGrade,
        has_pain: hasPain,
      }, {
        onConflict: 'user_id,week_start',
      });
    
    if (error) {
      logError('analytics_compute', 'Failed to update weekly aggregate', {
        error,
        userId: data.userId,
        context: { weekStart: weekStartStr },
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logError('analytics_compute', 'Exception updating weekly aggregate', {
      error,
      userId: data.userId,
    });
    return false;
  }
}

/**
 * Fetch weekly aggregates for a user (for analytics)
 */
export async function fetchWeeklyAggregates(
  userId: string,
  fromDate: Date,
  toDate: Date
): Promise<Array<{
  week_start: string;
  on_wall_sessions: number;
  off_wall_sessions: number;
  total_boulders: number;
  total_sets: number;
  has_pain: boolean;
}>> {
  try {
    const { data, error } = await supabase
      .from('weekly_aggregates')
      .select('*')
      .eq('user_id', userId)
      .gte('week_start', format(fromDate, 'yyyy-MM-dd'))
      .lte('week_start', format(toDate, 'yyyy-MM-dd'))
      .order('week_start', { ascending: true });
    
    if (error) {
      logError('analytics_compute', 'Failed to fetch weekly aggregates', {
        error,
        userId,
      });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logError('analytics_compute', 'Exception fetching weekly aggregates', {
      error,
      userId,
    });
    return [];
  }
}

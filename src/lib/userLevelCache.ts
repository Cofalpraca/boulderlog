/**
 * User Level Cache Management
 * 
 * Pre-computes and caches user climbing level on session finish.
 * Reduces client-side computation by storing computed levels.
 */

import { supabase } from '@/integrations/supabase/client';
import { computeUserLevel, type GradeScale } from './userLevel';
import { logError } from './errorLogger';

interface UserLevelCacheData {
  user_id: string;
  level_score: number | null;
  level_v_grade: string | null;
  level_font_grade: string | null;
  max_score: number | null;
  max_v_grade: string | null;
  max_font_grade: string | null;
  boulders_used: number;
  total_boulders: number;
  window_days: number;
  computed_at: string;
}

/**
 * Fetch the cached user level if available and fresh
 */
export async function fetchUserLevelCache(userId: string): Promise<UserLevelCacheData | null> {
  try {
    const { data, error } = await supabase
      .from('user_level_cache')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      logError('user_level_cache', 'Failed to fetch user level cache', { error, userId });
      return null;
    }
    
    return data;
  } catch (error) {
    logError('user_level_cache', 'Exception fetching user level cache', { error, userId });
    return null;
  }
}

/**
 * Recompute and upsert user level cache.
 * Called after session finish or import.
 */
export async function updateUserLevelCache(userId: string): Promise<boolean> {
  try {
    // Fetch all ON-WALL sessions from the last 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, date_start, session_type, boulder_logs(grade_raw, count)')
      .eq('user_id', userId)
      .eq('session_type', 'on_wall')
      .gte('date_start', cutoffDate.toISOString())
      .order('date_start', { ascending: false });
    
    if (sessionsError) {
      logError('user_level_cache', 'Failed to fetch sessions for level cache', { 
        error: sessionsError, 
        userId 
      });
      return false;
    }
    
    // Fetch all gyms and their grade mappings
    const { data: gyms, error: gymsError } = await supabase
      .from('gyms')
      .select('id, grading_type')
      .eq('user_id', userId);
    
    if (gymsError || !gyms?.length) {
      // No gyms, clear cache
      await supabase.from('user_level_cache').delete().eq('user_id', userId);
      return true;
    }
    
    const { data: mappings, error: mappingsError } = await supabase
      .from('gym_grade_mappings')
      .select('*')
      .in('gym_id', gyms.map(g => g.id));
    
    if (mappingsError) {
      logError('user_level_cache', 'Failed to fetch mappings for level cache', { 
        error: mappingsError, 
        userId 
      });
      return false;
    }
    
    const primaryGym = gyms[0];
    const preferredScale: GradeScale = primaryGym?.grading_type as GradeScale || 'v_scale';
    const primaryMappings = mappings?.filter(m => m.gym_id === primaryGym?.id) || [];
    
    // Prepare session data for computation
    const sessionData = (sessions || []).map(s => ({
      id: s.id,
      date_start: s.date_start,
      session_type: s.session_type as 'on_wall' | 'off_wall',
      boulder_logs: s.boulder_logs || [],
    }));
    
    // Compute user level
    const result = computeUserLevel(
      sessionData,
      mappings || [],
      preferredScale,
      primaryMappings
    );
    
    // Upsert cache
    const cacheData: Omit<UserLevelCacheData, 'computed_at'> = {
      user_id: userId,
      level_score: result.levelScore ?? null,
      level_v_grade: result.levelVGrade ?? null,
      level_font_grade: result.levelFontGrade ?? null,
      max_score: result.maxScore ?? null,
      max_v_grade: result.maxVGrade ?? null,
      max_font_grade: result.maxFontGrade ?? null,
      boulders_used: result.bouldersUsed,
      total_boulders: result.totalBoulders,
      window_days: result.windowDays,
    };
    
    const { error: upsertError } = await supabase
      .from('user_level_cache')
      .upsert({
        ...cacheData,
        computed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
    
    if (upsertError) {
      logError('user_level_cache', 'Failed to upsert user level cache', { 
        error: upsertError, 
        userId 
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logError('user_level_cache', 'Exception updating user level cache', { error, userId });
    return false;
  }
}

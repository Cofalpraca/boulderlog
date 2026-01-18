import type { Database } from '@/integrations/supabase/types';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];
type BoulderLog = { grade_raw: string; count: number };

// V-Scale grade order for comparison
const V_SCALE_ORDER = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16'];

// Font grade order for comparison
const FONT_ORDER = ['4', '4+', '5', '5+', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a'];

/**
 * Get numeric index for V-Scale grade
 */
export function getVScaleIndex(grade: string | null): number {
  if (!grade) return -1;
  const idx = V_SCALE_ORDER.indexOf(grade);
  return idx >= 0 ? idx : -1;
}

/**
 * Get numeric index for Font grade
 */
export function getFontIndex(grade: string | null): number {
  if (!grade) return -1;
  const idx = FONT_ORDER.indexOf(grade);
  return idx >= 0 ? idx : -1;
}

/**
 * Convert grade mapping to normalized difficulty score (0-100)
 */
export function getMappingDifficulty(mapping: GradeMapping): number {
  // Prefer V-Scale for normalization
  const vMin = getVScaleIndex(mapping.approx_v_min);
  const vMax = getVScaleIndex(mapping.approx_v_max);
  
  if (vMin >= 0 && vMax >= 0) {
    const avgV = (vMin + vMax) / 2;
    return (avgV / (V_SCALE_ORDER.length - 1)) * 100;
  }
  
  // Fallback to Font
  const fMin = getFontIndex(mapping.approx_font_min);
  const fMax = getFontIndex(mapping.approx_font_max);
  
  if (fMin >= 0 && fMax >= 0) {
    const avgF = (fMin + fMax) / 2;
    return (avgF / (FONT_ORDER.length - 1)) * 100;
  }
  
  // Fallback to order_index
  return (mapping.order_index / 10) * 100;
}

/**
 * Compute development zones for a session
 * 
 * Zone classification based on ABSOLUTE difficulty thresholds:
 * - Comfort: bottom 40% of the grade scale (easy warmup/volume)
 * - Growth: middle 40% of the grade scale (training stimulus)
 * - Limit: top 20% of the grade scale (max attempts/projects)
 * 
 * Uses absolute thresholds based on available grade mappings rather than
 * session-relative ranges. This ensures consistent classification regardless
 * of which grades are climbed in a single session.
 */
export function computeSessionZones(
  logs: BoulderLog[],
  mappings: GradeMapping[],
  userId: string
): { comfort_pct: number; growth_pct: number; limit_pct: number } {
  if (!logs.length || !mappings.length) {
    return { comfort_pct: 0, growth_pct: 0, limit_pct: 0 };
  }

  // Calculate difficulty for each grade mapping
  const sortedMappings = [...mappings].sort((a, b) => 
    getMappingDifficulty(a) - getMappingDifficulty(b)
  );
  
  const mappingDifficulty = new Map<string, number>();
  mappings.forEach(m => {
    mappingDifficulty.set(m.label, getMappingDifficulty(m));
  });

  // Get the full difficulty range from the gym's grade mappings
  const minGymDifficulty = getMappingDifficulty(sortedMappings[0]);
  const maxGymDifficulty = getMappingDifficulty(sortedMappings[sortedMappings.length - 1]);
  const gymRange = maxGymDifficulty - minGymDifficulty;

  // Define absolute zone thresholds based on gym's grade range
  // Comfort: bottom 40%, Growth: middle 40%, Limit: top 20%
  const comfortThreshold = minGymDifficulty + gymRange * 0.4;
  const growthThreshold = minGymDifficulty + gymRange * 0.8;

  // Get difficulties of logged boulders
  const loggedDifficulties: number[] = [];
  logs.forEach(log => {
    const difficulty = mappingDifficulty.get(log.grade_raw);
    if (difficulty !== undefined) {
      for (let i = 0; i < log.count; i++) {
        loggedDifficulties.push(difficulty);
      }
    }
  });

  if (loggedDifficulties.length === 0) {
    return { comfort_pct: 0, growth_pct: 0, limit_pct: 0 };
  }

  // Count boulders in each zone based on absolute thresholds
  let comfort = 0;
  let growth = 0;
  let limit = 0;

  loggedDifficulties.forEach(d => {
    if (d <= comfortThreshold) {
      comfort++;
    } else if (d <= growthThreshold) {
      growth++;
    } else {
      limit++;
    }
  });

  const total = loggedDifficulties.length;
  
  return {
    comfort_pct: Math.round((comfort / total) * 100),
    growth_pct: Math.round((growth / total) * 100),
    limit_pct: Math.round((limit / total) * 100),
  };
}

/**
 * Compute gym difficulty profile based on user's session history
 * 
 * difficulty_bias interpretation:
 * - positive: gym grades harder than user's baseline
 * - negative: gym grades easier than user's baseline
 * - 0: average difficulty
 */
export function computeGymDifficultyProfile(
  sessions: Array<{
    id: string;
    gym_id: string;
    boulder_logs: BoulderLog[];
    mappings: GradeMapping[];
  }>,
  userBaseline: number // User's typical max difficulty across all gyms
): { difficulty_bias: number; samples_count: number } {
  if (!sessions.length) {
    return { difficulty_bias: 0, samples_count: 0 };
  }

  let totalDifficulty = 0;
  let sampleCount = 0;

  sessions.forEach(session => {
    const mappingDifficulty = new Map<string, number>();
    session.mappings.forEach(m => {
      mappingDifficulty.set(m.label, getMappingDifficulty(m));
    });

    session.boulder_logs.forEach(log => {
      const difficulty = mappingDifficulty.get(log.grade_raw);
      if (difficulty !== undefined) {
        totalDifficulty += difficulty * log.count;
        sampleCount += log.count;
      }
    });
  });

  if (sampleCount === 0) {
    return { difficulty_bias: 0, samples_count: 0 };
  }

  const avgDifficulty = totalDifficulty / sampleCount;
  const difficulty_bias = Number((userBaseline - avgDifficulty).toFixed(2));

  return { difficulty_bias, samples_count: sampleCount };
}

/**
 * Get max grade from logs
 */
export function getMaxGrade(logs: BoulderLog[], mappings: GradeMapping[]): string | null {
  if (!logs.length || !mappings.length) return null;
  
  const mappingDifficulty = new Map<string, { difficulty: number; label: string }>();
  mappings.forEach(m => {
    mappingDifficulty.set(m.label, { difficulty: getMappingDifficulty(m), label: m.label });
  });

  let maxDifficulty = -1;
  let maxGrade: string | null = null;

  logs.forEach(log => {
    if (log.count > 0) {
      const data = mappingDifficulty.get(log.grade_raw);
      if (data && data.difficulty > maxDifficulty) {
        maxDifficulty = data.difficulty;
        maxGrade = data.label;
      }
    }
  });

  return maxGrade;
}

/**
 * Calculate weekly volume stats
 */
export function calculateWeeklyStats(
  sessions: Array<{ date_start: string; boulder_logs?: BoulderLog[] }>,
  weekStart: Date
): { sessions: number; boulders: number; maxGrade: string | null } {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekSessions = sessions.filter(s => {
    const d = new Date(s.date_start);
    return d >= weekStart && d < weekEnd;
  });

  let totalBoulders = 0;
  weekSessions.forEach(s => {
    s.boulder_logs?.forEach(log => {
      totalBoulders += log.count;
    });
  });

  return {
    sessions: weekSessions.length,
    boulders: totalBoulders,
    maxGrade: null, // Would need mappings to calculate
  };
}

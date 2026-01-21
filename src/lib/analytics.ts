import type { Database } from '@/integrations/supabase/types';
import { mappingToVScore, DEFAULT_FONT_TO_V, buildGradeLookup, fontGradeToVScore, getVScaleIndex as getVScaleIndexFromUserLevel } from '@/lib/userLevel';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];
type BoulderLog = { grade_raw: string; count: number };

// V-Scale grade order for comparison - extended to V17
const V_SCALE_ORDER = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'];

// Font grade order for comparison - MUST be in correct difficulty order with + variants
const FONT_ORDER = ['4', '4+', '5', '5a', '5b', '5+', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a'];

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
 * Normalize a raw grade to a V-score using:
 * 1. Gym mappings (for color/numeric labels)
 * 2. Direct V-Scale grades (V0, V1, etc.)
 * 3. Font grades via DEFAULT_FONT_TO_V
 * 
 * Returns -1 if unmappable.
 */
function gradeToVScore(gradeRaw: string, mappings: GradeMapping[]): number {
  // First, try gym-specific mapping lookup
  for (const mapping of mappings) {
    if (mapping.label === gradeRaw) {
      return mappingToVScore(mapping);
    }
  }
  
  // Try direct V-Scale grade (e.g., "V5")
  const vIdx = getVScaleIndexFromUserLevel(gradeRaw);
  if (vIdx >= 0) return vIdx;
  
  // Try Font grade via canonical table
  const fontScore = fontGradeToVScore(gradeRaw);
  if (fontScore >= 0) return fontScore;
  
  return -1;
}

/**
 * Compute development zones for a session
 * 
 * Zone classification is USER-LEVEL-RELATIVE:
 * - Comfort: Clearly below user's level, low stress (v_score ≤ userLevel - 1.0)
 * - Growth: Drives adaptation, requires effort (userLevel - 1.0 < v_score ≤ userLevel + 1.0)
 * - Limit: Maximal effort / project attempts (v_score > userLevel + 1.5)
 * 
 * The userLevel is the computed User Level (canonical V-score from top 20 boulders).
 * This ensures zones reflect RELATIVE TRAINING EFFORT, not absolute grade counts.
 * 
 * IMPORTANT: If userLevel is not provided, we fall back to computing it from this session's data,
 * which is less accurate but ensures we always produce a result.
 * 
 * DEV-ONLY: Logs detailed debug information to help diagnose zone distribution.
 */
export function computeSessionZones(
  logs: BoulderLog[],
  mappings: GradeMapping[],
  userId: string,
  userLevel?: number // User Level V-score (from computeUserLevel or cache)
): { comfort_pct: number; growth_pct: number; limit_pct: number } {
  if (!logs.length) {
    return { comfort_pct: 0, growth_pct: 0, limit_pct: 0 };
  }

  // Normalize all logged boulders to V-scores
  const boulderScores: { grade: string; vScore: number; count: number }[] = [];
  let unmappedCount = 0;
  
  for (const log of logs) {
    const vScore = gradeToVScore(log.grade_raw, mappings);
    if (vScore >= 0) {
      boulderScores.push({ grade: log.grade_raw, vScore, count: log.count });
    } else {
      unmappedCount += log.count;
      if (import.meta.env.DEV) {
        console.debug(`[zones] Unmapped grade: "${log.grade_raw}"`);
      }
    }
  }

  if (boulderScores.length === 0) {
    if (import.meta.env.DEV) {
      console.debug(`[zones] No mapped boulders (${unmappedCount} unmapped)`);
    }
    return { comfort_pct: 0, growth_pct: 0, limit_pct: 0 };
  }

  // Use provided userLevel, or fall back to session max as approximation
  // The fallback uses the MAX score in this session, which approximates user ability
  let baseline = userLevel;
  if (baseline === undefined || baseline < 0) {
    // Fallback: use the MAX V-score from this session as user level approximation
    // This is less accurate than the true user level but ensures reasonable zones
    let maxScore = 0;
    for (const b of boulderScores) {
      if (b.vScore > maxScore) {
        maxScore = b.vScore;
      }
    }
    baseline = maxScore;
    
    if (import.meta.env.DEV) {
      console.debug(`[zones] No userLevel provided, using session max (V${maxScore}) as fallback`);
    }
  }

  // Define zone thresholds relative to User Level (canonical definition):
  // - Comfort: v_score ≤ userLevel - 1.0 (clearly easier, low stress)
  // - Growth: userLevel - 1.0 < v_score ≤ userLevel + 1.0 (training zone, ~40-50%)
  // - Limit: v_score > userLevel + 1.5 (project zone, should be small %)
  const comfortThreshold = baseline - 1.0;  // At or below = Comfort
  const limitThreshold = baseline + 1.5;     // Above = Limit
  // Between comfortThreshold (exclusive) and limitThreshold (inclusive) = Growth

  // Count boulders in each zone
  let comfort = 0;
  let growth = 0;
  let limit = 0;

  if (import.meta.env.DEV) {
    console.debug(`[zones] User Level: V${baseline.toFixed(2)}`);
    console.debug(`[zones] Thresholds: Comfort ≤ V${comfortThreshold.toFixed(1)}, Growth (${comfortThreshold.toFixed(1)}, ${limitThreshold.toFixed(1)}], Limit > ${limitThreshold.toFixed(1)}`);
  }

  for (const b of boulderScores) {
    let zone: string;
    if (b.vScore <= comfortThreshold) {
      comfort += b.count;
      zone = 'COMFORT';
    } else if (b.vScore > limitThreshold) {
      limit += b.count;
      zone = 'LIMIT';
    } else {
      growth += b.count;
      zone = 'GROWTH';
    }
    
    if (import.meta.env.DEV) {
      console.debug(`[zones] ${b.grade} → V${b.vScore.toFixed(1)} × ${b.count} → ${zone}`);
    }
  }

  const total = comfort + growth + limit;
  
  if (import.meta.env.DEV) {
    console.debug(`[zones] Distribution: Comfort=${comfort}, Growth=${growth}, Limit=${limit} (total=${total}, unmapped=${unmappedCount})`);
  }
  
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
 * Get max grade from logs using the canonical normalization pipeline.
 * Uses V-score as the common baseline to ensure correct ordering across grading systems.
 * 
 * This correctly handles:
 * - Font grades: 6c+ > 6c (+ variants are harder)
 * - V-Scale: V7 > V6
 * - Color/Numeric: Uses mappingToVScore for normalization
 */
export function getMaxGrade(logs: BoulderLog[], mappings: GradeMapping[]): string | null {
  if (!logs.length || !mappings.length) return null;
  
  // Build lookup using canonical V-score normalization
  const mappingScore = new Map<string, { vScore: number; label: string }>();
  mappings.forEach(m => {
    const vScore = mappingToVScore(m);
    if (vScore >= 0) {
      mappingScore.set(m.label, { vScore, label: m.label });
    }
  });

  let maxScore = -1;
  let maxGrade: string | null = null;

  logs.forEach(log => {
    if (log.count > 0) {
      const data = mappingScore.get(log.grade_raw);
      if (data && data.vScore > maxScore) {
        maxScore = data.vScore;
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

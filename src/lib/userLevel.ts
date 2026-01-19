/**
 * User Level Computation Module
 * 
 * Computes a user's climbing level from real ON-WALL session data using grade normalization.
 * 
 * ALGORITHM:
 * 1. For each boulder log, convert grade_raw to a normalized V-scale score using gym_grade_mappings
 * 2. Weight scores by send count
 * 3. Take the top 20 highest-difficulty boulders
 * 4. Average their scores to compute the user's level
 * 5. Display level in BOTH V-Scale and Font formats
 * 
 * NORMALIZATION PIPELINE (strict order):
 * a) If gym_grade_mappings provides approx_v_min/approx_v_max → compute V-score (use midpoint)
 * b) Else if gym_grade_mappings provides approx_font_min/approx_font_max → convert Font → V using DEFAULT_FONT_TO_V
 * c) Else → mark as "unmappable" (ignored for analytics, never crash)
 * 
 * SUPPORTED GRADING TYPES:
 * - font: Font grades (4, 5a, 6a+, 7a, etc.)
 * - v_scale: V-Scale grades (V0, V1, V2, etc.)
 * - colors: Color-based gym grades (Yellow, Green, Blue, etc.)
 * - numeric: Numeric gym grades (1, 2, 3, etc.)
 * 
 * All grading types are first-class inputs if they can be mapped via gym_grade_mappings.
 */

import type { Database } from '@/integrations/supabase/types';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];
type BoulderLog = Database['public']['Tables']['boulder_logs']['Row'];

// ============================================================================
// CANONICAL GRADE CONVERSION TABLES
// ============================================================================

/**
 * CANONICAL DEFAULT_FONT_TO_V MAPPING
 * 
 * This is the baseline reference for the entire analytics system.
 * Used by: User Level, Gym Difficulty Index, Development Zones
 * 
 * Each Font grade maps to exactly ONE V-score.
 * If a gym defines its own Font → V mapping, that takes precedence.
 */
export const DEFAULT_FONT_TO_V: Record<string, number> = {
  // Easy grades
  '4': 0,      // V0
  '4+': 0,     // V0
  '5': 1,      // V1
  '5+': 2,     // V2
  '5a': 1,     // V1
  '5b': 1,     // V1
  '5c': 2,     // V2
  // Intermediate grades
  '6a': 3,     // V3
  '6a+': 4,    // V4
  '6b': 5,     // V5
  '6b+': 5,    // V5
  '6c': 6,     // V6
  '6c+': 6,    // V6
  // Advanced grades
  '7a': 7,     // V7
  '7a+': 8,    // V8
  '7b': 9,     // V9
  '7b+': 10,   // V10
  '7c': 11,    // V11
  '7c+': 12,   // V12
  // Elite grades
  '8a': 13,    // V13
  '8a+': 14,   // V14
  '8b': 15,    // V15
  '8b+': 16,   // V16
  '8c': 17,    // V17
  '8c+': 17,   // V17
  '9a': 17,    // V17
};

/**
 * V-SCORE TO FONT GRADE MAPPING (inverse of DEFAULT_FONT_TO_V)
 * 
 * Used to display User Level in Font scale.
 * Maps V-score (rounded integer) to the most common Font equivalent.
 */
export const V_SCORE_TO_FONT: Record<number, string> = {
  0: '4',
  1: '5a',
  2: '5c',
  3: '6a',
  4: '6a+',
  5: '6b',
  6: '6c',
  7: '7a',
  8: '7a+',
  9: '7b',
  10: '7b+',
  11: '7c',
  12: '7c+',
  13: '8a',
  14: '8a+',
  15: '8b',
  16: '8b+',
  17: '8c',
};

// V-Scale grade order (internal normalization standard)
const V_SCALE_ORDER = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'];

// Default time window (in days) - 90 days (3 months)
export const DEFAULT_WINDOW_DAYS = 90;

// Minimum boulders required for level computation
export const MIN_BOULDERS_FOR_LEVEL = 10;

// Number of best (highest difficulty) boulders to consider for level
export const TOP_BOULDERS_COUNT = 20;

// ============================================================================
// GRADE CONVERSION FUNCTIONS
// ============================================================================

/**
 * Get V-scale index (0-17) from grade string (e.g., "V5" → 5)
 */
export function getVScaleIndex(grade: string | null): number {
  if (!grade) return -1;
  const idx = V_SCALE_ORDER.indexOf(grade);
  return idx >= 0 ? idx : -1;
}

/**
 * Convert Font grade string to V-score using the canonical DEFAULT_FONT_TO_V table.
 * Returns -1 if the grade is not in the table.
 */
export function fontGradeToVScore(fontGrade: string | null): number {
  if (!fontGrade) return -1;
  const normalized = fontGrade.toLowerCase().trim();
  
  // Try exact match first (case-insensitive)
  for (const [font, vScore] of Object.entries(DEFAULT_FONT_TO_V)) {
    if (font.toLowerCase() === normalized) {
      return vScore;
    }
  }
  
  return -1;
}

/**
 * Convert V-score (numeric) to V-grade string (e.g., 5 → "V5")
 * Rounds to nearest integer grade, clamps to valid range.
 */
export function vScoreToVGrade(score: number): string | null {
  if (score < 0) return null;
  const idx = Math.round(Math.max(0, Math.min(V_SCALE_ORDER.length - 1, score)));
  return V_SCALE_ORDER[idx];
}

/**
 * Convert V-score (numeric) to Font grade string using the canonical V_SCORE_TO_FONT table.
 * Rounds to nearest integer V-score.
 */
export function vScoreToFontGrade(score: number): string | null {
  if (score < 0) return null;
  const roundedScore = Math.round(Math.max(0, Math.min(17, score)));
  return V_SCORE_TO_FONT[roundedScore] ?? V_SCORE_TO_FONT[17];
}

// ============================================================================
// GRADE MAPPING NORMALIZATION
// ============================================================================

/**
 * Convert a grade mapping to a normalized V-scale score (0-17 range).
 * 
 * NORMALIZATION ORDER (strict):
 * a) If approx_v_min/approx_v_max are available → use midpoint
 * b) Else if approx_font_min/approx_font_max are available → convert via DEFAULT_FONT_TO_V
 * c) Else → return -1 (unmappable)
 * 
 * Returns -1 if no valid mapping exists.
 */
export function mappingToVScore(mapping: GradeMapping): number {
  // Strategy (a): Use V-scale bounds if available
  const vMin = getVScaleIndex(mapping.approx_v_min);
  const vMax = getVScaleIndex(mapping.approx_v_max);
  
  if (vMin >= 0 && vMax >= 0) {
    return (vMin + vMax) / 2;
  }
  if (vMin >= 0) return vMin;
  if (vMax >= 0) return vMax;
  
  // Strategy (b): Use Font grade bounds and convert via DEFAULT_FONT_TO_V
  const fontMin = fontGradeToVScore(mapping.approx_font_min);
  const fontMax = fontGradeToVScore(mapping.approx_font_max);
  
  if (fontMin >= 0 && fontMax >= 0) {
    return (fontMin + fontMax) / 2;
  }
  if (fontMin >= 0) return fontMin;
  if (fontMax >= 0) return fontMax;
  
  // Strategy (c): Unmappable
  return -1;
}

/**
 * Build a lookup map from grade_raw labels to V-scale scores.
 * Returns Map<label, vScore>.
 * 
 * Works for ALL grading types: font, v_scale, colors, numeric
 * 
 * IMPORTANT: This includes BOTH gym-specific mappings (colors, numeric labels)
 * AND direct Font/V-Scale grades from DEFAULT_FONT_TO_V for Font-graded sessions.
 * 
 * DEV-ONLY: Logs debug info about mappings processed and skipped.
 */
export function buildGradeLookup(mappings: GradeMapping[]): Map<string, number> {
  const lookup = new Map<string, number>();
  let skippedCount = 0;
  
  // First, add all gym-specific mappings (for colors/numeric grading)
  for (const mapping of mappings) {
    const vScore = mappingToVScore(mapping);
    if (vScore >= 0) {
      lookup.set(mapping.label, vScore);
    } else {
      skippedCount++;
      if (import.meta.env.DEV) {
        console.debug(`[userLevel] Skipped mapping "${mapping.label}" - no valid V/Font bounds`);
      }
    }
  }
  
  // Second, add canonical Font grades from DEFAULT_FONT_TO_V
  // This ensures Font-graded sessions (grade_raw like "6b+") are always mappable
  for (const [fontGrade, vScore] of Object.entries(DEFAULT_FONT_TO_V)) {
    if (!lookup.has(fontGrade)) {
      lookup.set(fontGrade, vScore);
    }
  }
  
  // Third, add V-Scale grades directly (V0, V1, V2, etc.)
  for (let i = 0; i < V_SCALE_ORDER.length; i++) {
    const vGrade = V_SCALE_ORDER[i];
    if (!lookup.has(vGrade)) {
      lookup.set(vGrade, i);
    }
  }
  
  if (import.meta.env.DEV) {
    console.debug(`[userLevel] Built grade lookup: ${lookup.size} total (${mappings.length} gym mappings, ${skippedCount} skipped)`);
  }
  
  return lookup;
}

/**
 * Extract normalized V-scores from boulder logs.
 * Returns an array of scores, expanded by count (one entry per send).
 */
export function extractScores(
  logs: Array<{ grade_raw: string; count: number }>,
  gradeLookup: Map<string, number>
): number[] {
  const scores: number[] = [];
  
  for (const log of logs) {
    const score = gradeLookup.get(log.grade_raw);
    if (score !== undefined && score >= 0) {
      // Expand by count - each send is an observation
      for (let i = 0; i < log.count; i++) {
        scores.push(score);
      }
    }
  }
  
  return scores;
}

/**
 * Calculate percentile from a sorted array of scores.
 * Uses linear interpolation for fractional percentiles.
 */
export function calculatePercentile(sortedScores: number[], percentile: number): number {
  if (sortedScores.length === 0) return -1;
  if (sortedScores.length === 1) return sortedScores[0];
  
  const clampedP = Math.max(0, Math.min(1, percentile));
  const index = clampedP * (sortedScores.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) return sortedScores[lower];
  return sortedScores[lower] * (1 - weight) + sortedScores[upper] * weight;
}

/**
 * Calculate max score from scores array.
 */
export function calculateMax(scores: number[]): number {
  if (scores.length === 0) return -1;
  return Math.max(...scores);
}

/**
 * Find the closest gym-local grade label for a given V-score.
 * Used for color/numeric grading systems display.
 */
export function vScoreToGymLabel(score: number, mappings: GradeMapping[]): string | null {
  if (score < 0 || mappings.length === 0) return null;
  
  let closestMapping: GradeMapping | null = null;
  let closestDistance = Infinity;
  
  for (const mapping of mappings) {
    const mapScore = mappingToVScore(mapping);
    if (mapScore >= 0) {
      const distance = Math.abs(mapScore - score);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestMapping = mapping;
      }
    }
  }
  
  return closestMapping?.label ?? null;
}

// ============================================================================
// USER LEVEL COMPUTATION RESULT
// ============================================================================

/**
 * User level computation result with dual format display.
 */
export interface UserLevelResult {
  /** Level score as V-scale number (0-17) - average of top N boulders */
  levelScore: number;
  /** Level formatted as V-Scale (e.g., "V7") */
  levelVGrade: string | null;
  /** Level formatted as Font (e.g., "7a") */
  levelFontGrade: string | null;
  /** Level formatted in preferred scale (for backward compatibility) */
  levelGrade: string | null;
  /** Max score in window as V-scale number (0-17) */
  maxScore: number;
  /** Max formatted as V-Scale */
  maxVGrade: string | null;
  /** Max formatted as Font */
  maxFontGrade: string | null;
  /** Max formatted in preferred scale */
  maxGrade: string | null;
  /** Total boulder sends in window (mapped successfully) */
  totalBoulders: number;
  /** Number of boulders used for level calculation (top N) */
  bouldersUsed: number;
  /** Whether enough data exists for reliable computation */
  hasData: boolean;
  /** Time window used (days) */
  windowDays: number;
  /** Whether mappings are missing (show CTA to configure) */
  missingMappings: boolean;
  /** Diagnostic info: total raw boulder logs found */
  rawLogsFound?: number;
  /** Diagnostic info: boulder logs that couldn't be mapped */
  unmappedLogs?: number;
  /** Diagnostic info: specific reason for no data */
  noDataReason?: 'no_sessions' | 'no_logs' | 'no_mappings' | 'insufficient_mapped';
}

/**
 * Grading system type for output formatting.
 */
export type GradeScale = 'font' | 'v_scale' | 'colors' | 'numeric';

/**
 * Convert score to grade string based on preferred scale.
 */
export function scoreToGrade(
  score: number,
  scale: GradeScale,
  gymMappings?: GradeMapping[]
): string | null {
  if (score < 0) return null;
  
  switch (scale) {
    case 'v_scale':
      return vScoreToVGrade(score);
    case 'font':
      return vScoreToFontGrade(score);
    case 'colors':
    case 'numeric':
      // For gym-specific scales, use the closest gym mapping
      if (gymMappings && gymMappings.length > 0) {
        return vScoreToGymLabel(score, gymMappings);
      }
      // Fallback to V-scale if no gym mappings
      return vScoreToVGrade(score);
    default:
      return vScoreToVGrade(score);
  }
}

// ============================================================================
// SESSION DATA TYPE
// ============================================================================

/**
 * Session data for level computation.
 */
export interface SessionData {
  id: string;
  date_start: string;
  session_type: 'on_wall' | 'off_wall';
  boulder_logs: Array<{ grade_raw: string; count: number }>;
}

// ============================================================================
// MAIN COMPUTATION FUNCTION
// ============================================================================

/**
 * Compute user climbing level from session history.
 * 
 * ALGORITHM:
 * 1. Collect all boulder logs from ON-WALL sessions within the time window (default 90 days)
 * 2. Normalize each grade to a V-scale score using gym_grade_mappings
 * 3. Expand by count (each log with count=N contributes N individual observations)
 * 4. Take the top 20 highest-difficulty boulders
 * 5. Average their scores to compute the user's level
 * 6. Require at least 10 boulders to compute a level
 * 7. Output level in BOTH V-Scale and Font formats
 * 
 * @param sessions - Array of sessions with boulder logs
 * @param allMappings - All grade mappings from user's gyms
 * @param preferredScale - User's preferred grading scale for display
 * @param primaryGymMappings - Mappings from user's primary/last-used gym (for color/numeric display)
 * @param windowDays - Time window in days (default 90)
 */
export function computeUserLevel(
  sessions: SessionData[],
  allMappings: GradeMapping[],
  preferredScale: GradeScale = 'v_scale',
  primaryGymMappings?: GradeMapping[],
  windowDays: number = DEFAULT_WINDOW_DAYS
): UserLevelResult {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  
  // Check if mappings exist at all
  const missingMappings = allMappings.length === 0;
  
  // Build grade lookup from all mappings + canonical Font/V-Scale grades
  const gradeLookup = buildGradeLookup(allMappings);
  
  // Filter to ON-WALL sessions only within time window
  const onWallSessions = sessions.filter(s => s.session_type === 'on_wall');
  
  // Diagnostic counters
  let rawLogsFound = 0;
  let unmappedLogs = 0;
  const unmappedGrades = new Set<string>();
  
  // Collect all scores from the window
  const allScores: number[] = [];
  
  for (const session of onWallSessions) {
    const sessionDate = new Date(session.date_start);
    
    if (sessionDate >= cutoffDate) {
      for (const log of session.boulder_logs || []) {
        rawLogsFound++;
        const score = gradeLookup.get(log.grade_raw);
        if (score !== undefined && score >= 0) {
          // Expand by count - each send is an observation
          for (let i = 0; i < log.count; i++) {
            allScores.push(score);
          }
        } else {
          unmappedLogs++;
          unmappedGrades.add(log.grade_raw);
          if (import.meta.env.DEV) {
            console.debug(`[userLevel] Excluded log "${log.grade_raw}" (count: ${log.count}) - no mapping found`);
          }
        }
      }
    }
  }
  
  const totalBoulders = allScores.length;
  
  // DEV-ONLY: Log summary
  if (import.meta.env.DEV) {
    console.debug(`[userLevel] Computation summary:`, {
      onWallSessions: onWallSessions.length,
      rawLogsFound,
      unmappedLogs,
      unmappedGrades: Array.from(unmappedGrades),
      totalBoulders,
      windowDays,
      cutoffDate: cutoffDate.toISOString(),
      gradeLookupSize: gradeLookup.size,
    });
  }
  
  // Determine specific reason for no data
  let noDataReason: UserLevelResult['noDataReason'] = undefined;
  if (totalBoulders < MIN_BOULDERS_FOR_LEVEL) {
    if (onWallSessions.length === 0) {
      noDataReason = 'no_sessions';
    } else if (rawLogsFound === 0) {
      noDataReason = 'no_logs';
    } else if (missingMappings && unmappedLogs > 0) {
      noDataReason = 'no_mappings';
    } else if (unmappedLogs > 0 && totalBoulders < MIN_BOULDERS_FOR_LEVEL) {
      noDataReason = 'insufficient_mapped';
    }
    
    return {
      levelScore: -1,
      levelVGrade: null,
      levelFontGrade: null,
      levelGrade: null,
      maxScore: -1,
      maxVGrade: null,
      maxFontGrade: null,
      maxGrade: null,
      totalBoulders,
      bouldersUsed: 0,
      hasData: false,
      windowDays,
      missingMappings,
      rawLogsFound,
      unmappedLogs,
      noDataReason,
    };
  }
  
  // Sort descending to get top boulders first
  const sortedDesc = [...allScores].sort((a, b) => b - a);
  
  // Take top N boulders (or all if fewer than N exist)
  const topBoulders = sortedDesc.slice(0, TOP_BOULDERS_COUNT);
  const bouldersUsed = topBoulders.length;
  
  // Calculate average of top boulders as the level
  const levelScore = topBoulders.reduce((sum, score) => sum + score, 0) / bouldersUsed;
  
  // Max is just the first element (highest)
  const maxScore = sortedDesc[0];
  
  // Convert to BOTH formats (always)
  const levelVGrade = vScoreToVGrade(levelScore);
  const levelFontGrade = vScoreToFontGrade(levelScore);
  const maxVGrade = vScoreToVGrade(maxScore);
  const maxFontGrade = vScoreToFontGrade(maxScore);
  
  // Also provide preferred scale format for backward compatibility
  const displayMappings = primaryGymMappings || allMappings;
  const levelGrade = scoreToGrade(levelScore, preferredScale, displayMappings);
  const maxGrade = scoreToGrade(maxScore, preferredScale, displayMappings);
  
  return {
    levelScore,
    levelVGrade,
    levelFontGrade,
    levelGrade,
    maxScore,
    maxVGrade,
    maxFontGrade,
    maxGrade,
    totalBoulders,
    bouldersUsed,
    hasData: true,
    windowDays,
    missingMappings: false,
    rawLogsFound,
    unmappedLogs,
  };
}

// ============================================================================
// DEPRECATED EXPORTS (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use fontGradeToVScore instead
 */
export function getFontIndex(grade: string | null): number {
  if (!grade) return -1;
  const fontOrder = ['4', '4+', '5', '5+', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a'];
  const idx = fontOrder.indexOf(grade);
  return idx >= 0 ? idx : -1;
}

/**
 * @deprecated Use fontGradeToVScore with the canonical table instead
 */
export function fontIndexToVScore(fontIndex: number): number {
  if (fontIndex < 0) return -1;
  return Math.max(0, (fontIndex - 2) / 2);
}

import { subDays } from 'date-fns';

/**
 * Pain-related insight generation logic
 * IMPORTANT: These functions only generate contextual insights.
 * They do NOT modify any analytics calculations (volume, zones, difficulty).
 */

export interface SessionWithPain {
  id: string;
  date_start: string;
  session_type: 'on_wall' | 'off_wall';
  pain_flag?: boolean | null;
  pain_level?: number | null;
  pain_area?: string | null;
  rpe?: number | null;
  boulder_logs?: { count: number }[];
  session_zone_summaries?: {
    limit_pct?: number | null;
  } | { limit_pct?: number | null }[];
}

export interface PainInsight {
  type: 'warning' | 'suggestion' | 'info';
  key: string;
  priority: number; // Higher = more important
}

/**
 * Thresholds for pain-related insights
 * Documented here for maintainability
 */
const THRESHOLDS = {
  // Days to look back for recent pain
  RECENT_PAIN_DAYS: 14,
  // Limit zone percentage considered "high intensity"
  HIGH_LIMIT_PCT: 25,
  // RPE considered "high effort"
  HIGH_RPE: 8,
  // Minimum OFF-WALL sessions in period for "balanced" recovery
  MIN_OFF_WALL_FOR_BALANCE: 2,
  // Days to look back for balance check
  BALANCE_CHECK_DAYS: 7,
};

/**
 * Check if a session has pain reported
 */
export function sessionHasPain(session: SessionWithPain): boolean {
  return session.pain_flag === true;
}

/**
 * Get sessions with pain in a time period
 */
export function getSessionsWithPain(
  sessions: SessionWithPain[],
  sinceDate?: Date
): SessionWithPain[] {
  const cutoff = sinceDate ?? subDays(new Date(), THRESHOLDS.RECENT_PAIN_DAYS);
  return sessions.filter(
    (s) => sessionHasPain(s) && new Date(s.date_start) >= cutoff
  );
}

/**
 * Generate pain-related training insights
 * Returns array of insight keys that should be displayed
 * 
 * Rules (additive, do not replace existing insights):
 * 1. Pain reported recently → suggest deload
 * 2. Pain + high limit zone % → suggest technique/lower grades
 * 3. Pain + low OFF-WALL → suggest prehab/recovery session
 */
export function generatePainInsights(
  onWallSessions: SessionWithPain[],
  offWallSessions: SessionWithPain[]
): PainInsight[] {
  const insights: PainInsight[] = [];
  const allSessions = [...onWallSessions, ...offWallSessions];
  
  // Check for recent pain
  const recentPainSessions = getSessionsWithPain(allSessions);
  if (recentPainSessions.length === 0) {
    return insights;
  }

  // Rule 1: Pain reported recently → suggest deload
  insights.push({
    type: 'warning',
    key: 'painRecentDeload',
    priority: 10,
  });

  // Check for high-intensity ON-WALL sessions with pain
  const onWallWithPain = recentPainSessions.filter(s => s.session_type === 'on_wall');
  const hasHighIntensityWithPain = onWallWithPain.some((s) => {
    // Check limit zone percentage
    const zoneSummary = Array.isArray(s.session_zone_summaries)
      ? s.session_zone_summaries[0]
      : s.session_zone_summaries;
    const limitPct = zoneSummary?.limit_pct ?? 0;
    const highLimit = limitPct >= THRESHOLDS.HIGH_LIMIT_PCT;
    
    // Check RPE
    const highRpe = (s.rpe ?? 0) >= THRESHOLDS.HIGH_RPE;
    
    return highLimit || highRpe;
  });

  // Rule 2: Pain + high intensity → suggest technique/lower grades
  if (hasHighIntensityWithPain) {
    insights.push({
      type: 'suggestion',
      key: 'painHighIntensity',
      priority: 8,
    });
  }

  // Rule 3: Check OFF-WALL balance
  const recentDate = subDays(new Date(), THRESHOLDS.BALANCE_CHECK_DAYS);
  const recentOffWall = offWallSessions.filter(
    (s) => new Date(s.date_start) >= recentDate
  );
  
  if (recentOffWall.length < THRESHOLDS.MIN_OFF_WALL_FOR_BALANCE) {
    insights.push({
      type: 'suggestion',
      key: 'painLowOffWall',
      priority: 6,
    });
  }

  // Sort by priority (highest first)
  return insights.sort((a, b) => b.priority - a.priority);
}

/**
 * Check if any sessions in the given array have pain
 * Used for overview callout visibility
 */
export function hasPainInPeriod(sessions: SessionWithPain[]): boolean {
  return sessions.some(sessionHasPain);
}

/**
 * Get pain summary for a specific session (for tooltips)
 */
export function getPainSummary(session: SessionWithPain): string | null {
  if (!sessionHasPain(session)) return null;
  
  const parts: string[] = [];
  
  if (session.pain_level) {
    parts.push(`Level ${session.pain_level}/5`);
  }
  
  if (session.pain_area) {
    parts.push(session.pain_area);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Pain reported';
}

/**
 * Check if a week contains sessions with pain
 * Used for weekly volume chart markers
 */
export function weekHasPain(
  sessions: SessionWithPain[],
  weekStart: Date,
  weekEnd: Date
): boolean {
  return sessions.some(
    (s) =>
      sessionHasPain(s) &&
      new Date(s.date_start) >= weekStart &&
      new Date(s.date_start) < weekEnd
  );
}

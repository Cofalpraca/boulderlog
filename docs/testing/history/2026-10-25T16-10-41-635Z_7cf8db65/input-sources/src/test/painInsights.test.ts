import { describe, it, expect } from 'vitest';
import {
  sessionHasPain,
  hasPainInPeriod,
  generatePainInsights,
  getPainSummary,
  weekHasPain,
  type SessionWithPain,
} from '@/lib/painInsights';

describe('Pain Insights', () => {
  const createSession = (overrides: Partial<SessionWithPain> = {}): SessionWithPain => ({
    id: 'test-session',
    date_start: new Date().toISOString(),
    session_type: 'on_wall',
    pain_flag: false,
    ...overrides,
  });

  describe('sessionHasPain', () => {
    it('returns false when pain_flag is false', () => {
      expect(sessionHasPain(createSession({ pain_flag: false }))).toBe(false);
    });

    it('returns true when pain_flag is true', () => {
      expect(sessionHasPain(createSession({ pain_flag: true }))).toBe(true);
    });

    it('returns false when pain_flag is null', () => {
      expect(sessionHasPain(createSession({ pain_flag: null }))).toBe(false);
    });
  });

  describe('hasPainInPeriod', () => {
    it('returns false for empty sessions', () => {
      expect(hasPainInPeriod([])).toBe(false);
    });

    it('returns false when no sessions have pain', () => {
      const sessions = [
        createSession({ pain_flag: false }),
        createSession({ pain_flag: false }),
      ];
      expect(hasPainInPeriod(sessions)).toBe(false);
    });

    it('returns true when at least one session has pain', () => {
      const sessions = [
        createSession({ pain_flag: false }),
        createSession({ pain_flag: true }),
      ];
      expect(hasPainInPeriod(sessions)).toBe(true);
    });
  });

  describe('generatePainInsights', () => {
    it('returns empty array when no pain sessions', () => {
      const onWall = [createSession({ pain_flag: false })];
      const offWall = [createSession({ session_type: 'off_wall', pain_flag: false })];
      expect(generatePainInsights(onWall, offWall)).toHaveLength(0);
    });

    it('returns deload insight when pain reported recently', () => {
      const onWall = [createSession({ pain_flag: true })];
      const offWall: SessionWithPain[] = [];
      const insights = generatePainInsights(onWall, offWall);
      expect(insights.some(i => i.key === 'painRecentDeload')).toBe(true);
    });

    it('returns low off-wall insight when pain + few off-wall sessions', () => {
      const onWall = [createSession({ pain_flag: true })];
      const offWall: SessionWithPain[] = [];
      const insights = generatePainInsights(onWall, offWall);
      expect(insights.some(i => i.key === 'painLowOffWall')).toBe(true);
    });

    it('returns high intensity insight when pain + high RPE', () => {
      const onWall = [createSession({ pain_flag: true, rpe: 9 })];
      const offWall: SessionWithPain[] = [];
      const insights = generatePainInsights(onWall, offWall);
      expect(insights.some(i => i.key === 'painHighIntensity')).toBe(true);
    });
  });

  describe('getPainSummary', () => {
    it('returns null when no pain', () => {
      expect(getPainSummary(createSession({ pain_flag: false }))).toBeNull();
    });

    it('returns "Pain reported" for pain without details', () => {
      expect(getPainSummary(createSession({ pain_flag: true }))).toBe('Pain reported');
    });

    it('includes level and area when provided', () => {
      const session = createSession({
        pain_flag: true,
        pain_level: 3,
        pain_area: 'fingers',
      });
      expect(getPainSummary(session)).toBe('Level 3/5, fingers');
    });
  });

  describe('weekHasPain', () => {
    it('returns false when no sessions in week', () => {
      expect(weekHasPain([], new Date('2025-01-13'), new Date('2025-01-20'))).toBe(false);
    });

    it('returns false when sessions in week have no pain', () => {
      const sessions = [
        createSession({ 
          pain_flag: false, 
          date_start: '2025-01-15T10:00:00Z' 
        }),
      ];
      expect(weekHasPain(sessions, new Date('2025-01-13'), new Date('2025-01-20'))).toBe(false);
    });

    it('returns true when at least one session in week has pain', () => {
      const sessions = [
        createSession({ 
          pain_flag: true, 
          date_start: '2025-01-15T10:00:00Z' 
        }),
      ];
      expect(weekHasPain(sessions, new Date('2025-01-13'), new Date('2025-01-20'))).toBe(true);
    });

    it('ignores sessions outside the week range', () => {
      const sessions = [
        createSession({ 
          pain_flag: true, 
          date_start: '2025-01-10T10:00:00Z' // Before week start
        }),
        createSession({ 
          pain_flag: true, 
          date_start: '2025-01-25T10:00:00Z' // After week end
        }),
      ];
      expect(weekHasPain(sessions, new Date('2025-01-13'), new Date('2025-01-20'))).toBe(false);
    });
  });
});

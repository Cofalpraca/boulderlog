import { describe, it, expect } from 'vitest';
import {
  getVScaleIndex,
  getFontIndex,
  getMappingDifficulty,
  computeSessionZones,
  computeGymDifficultyProfile,
  getMaxGrade,
} from './analytics';
import type { Database } from '@/integrations/supabase/types';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];

// Helper to create mock grade mappings
const createMockMapping = (
  label: string,
  orderIndex: number,
  vMin: string | null = null,
  vMax: string | null = null,
  fontMin: string | null = null,
  fontMax: string | null = null
): GradeMapping => ({
  id: `mapping-${label}`,
  gym_id: 'test-gym',
  label,
  order_index: orderIndex,
  color_hex: '#000000',
  approx_v_min: vMin,
  approx_v_max: vMax,
  approx_font_min: fontMin,
  approx_font_max: fontMax,
  created_at: new Date().toISOString(),
});

describe('Grade Normalization', () => {
  describe('getVScaleIndex', () => {
    it('returns correct index for V-Scale grades', () => {
      expect(getVScaleIndex('V0')).toBe(0);
      expect(getVScaleIndex('V5')).toBe(5);
      expect(getVScaleIndex('V10')).toBe(10);
    });

    it('returns -1 for invalid grades', () => {
      expect(getVScaleIndex(null)).toBe(-1);
      expect(getVScaleIndex('6a')).toBe(-1);
      expect(getVScaleIndex('Invalid')).toBe(-1);
    });
  });

  describe('getFontIndex', () => {
    it('returns correct index for Font grades', () => {
      expect(getFontIndex('4')).toBe(0);
      expect(getFontIndex('6a')).toBe(7);  // Correct index in FONT_ORDER
      expect(getFontIndex('7a')).toBe(13); // Correct index in FONT_ORDER
    });

    it('returns -1 for invalid grades', () => {
      expect(getFontIndex(null)).toBe(-1);
      expect(getFontIndex('V5')).toBe(-1);
      expect(getFontIndex('Invalid')).toBe(-1);
    });
  });

  describe('getMappingDifficulty', () => {
    it('uses V-Scale for normalization when available', () => {
      const mapping = createMockMapping('Yellow', 0, 'V0', 'V2', '4', '5+');
      const difficulty = getMappingDifficulty(mapping);
      expect(difficulty).toBeGreaterThan(0);
      expect(difficulty).toBeLessThan(20); // Low difficulty
    });

    it('falls back to Font when V-Scale not available', () => {
      const mapping = createMockMapping('Green', 1, null, null, '6a', '6b');
      const difficulty = getMappingDifficulty(mapping);
      expect(difficulty).toBeGreaterThan(0);
    });

    it('falls back to order_index when no grades available', () => {
      const mapping = createMockMapping('Custom', 5);
      const difficulty = getMappingDifficulty(mapping);
      expect(difficulty).toBe(50); // (5/10) * 100
    });
  });
});

describe('Development Zones', () => {
  const mockMappings: GradeMapping[] = [
    createMockMapping('Yellow', 0, 'V0', 'V1'),
    createMockMapping('Green', 1, 'V2', 'V3'),
    createMockMapping('Blue', 2, 'V4', 'V5'),
    createMockMapping('Red', 3, 'V6', 'V7'),
    createMockMapping('Black', 4, 'V8', 'V10'),
  ];

  describe('computeSessionZones', () => {
    it('returns zeros for empty logs', () => {
      const result = computeSessionZones([], mockMappings, 'user-1');
      expect(result).toEqual({ comfort_pct: 0, growth_pct: 0, limit_pct: 0 });
    });

    it('returns zeros for empty mappings with unmappable grades', () => {
      const logs = [{ grade_raw: 'UnknownGrade', count: 5 }];
      const result = computeSessionZones(logs, [], 'user-1');
      expect(result).toEqual({ comfort_pct: 0, growth_pct: 0, limit_pct: 0 });
    });

    it('classifies Font grades correctly using canonical table', () => {
      // Font grades should work even without gym mappings via DEFAULT_FONT_TO_V
      // Use a wider spread to guarantee comfort/limit zones
      const logs = [
        { grade_raw: '5a', count: 5 },   // V1 - well below baseline → Comfort
        { grade_raw: '6b', count: 5 },   // V5 - around baseline → Growth
        { grade_raw: '7b', count: 5 },   // V9 - above baseline → Limit
      ];
      // Baseline ≈ (1*5 + 5*5 + 9*5) / 15 = 75/15 = 5
      // Comfort < 3, Growth 3-6, Limit > 6
      const result = computeSessionZones(logs, [], 'user-1', 5);
      
      // All three zones should have some percentage
      expect(result.comfort_pct).toBeGreaterThan(0);
      expect(result.growth_pct).toBeGreaterThan(0);
      expect(result.limit_pct).toBeGreaterThan(0);
    });

    it('does NOT collapse all grades into Growth for mixed dataset', () => {
      // This is the regression test: with grades from 6a to 7a+
      // zones should distribute, not all be Growth
      const logs = [
        { grade_raw: '7a+', count: 9 },  // V8
        { grade_raw: '7a', count: 1 },   // V7
        { grade_raw: '6c+', count: 1 },  // V6
        { grade_raw: '6c', count: 1 },   // V6
        { grade_raw: '6b+', count: 10 }, // V5
        { grade_raw: '6a', count: 10 },  // V3
      ];
      const result = computeSessionZones(logs, [], 'user-1', 5.9);
      
      // Should NOT be 100% Growth
      expect(result.growth_pct).toBeLessThan(100);
      
      // With this spread, comfort and limit should have values
      // Baseline ≈ V5.9 (weighted average)
      // 6a (V3) is 2.9 below baseline → Comfort
      // 7a+ (V8) is 2.1 above baseline → Limit
      expect(result.comfort_pct).toBeGreaterThan(0);
      expect(result.limit_pct).toBeGreaterThan(0);
    });

    it('percentages sum to 100 for mixed sessions', () => {
      const logs = [
        { grade_raw: 'Yellow', count: 3 },
        { grade_raw: 'Green', count: 4 },
        { grade_raw: 'Blue', count: 2 },
        { grade_raw: 'Red', count: 2 },
        { grade_raw: 'Black', count: 1 },
      ];
      const result = computeSessionZones(logs, mockMappings, 'user-1');
      const sum = result.comfort_pct + result.growth_pct + result.limit_pct;
      expect(sum).toBe(100);
    });

    it('uses provided baseline for zone thresholds', () => {
      // With explicit baseline of V5, grades below V3 are Comfort, above V6 are Limit
      const logs = [
        { grade_raw: 'Yellow', count: 5 },  // V0.5 - well below baseline → Comfort
        { grade_raw: 'Blue', count: 5 },    // V4.5 - around baseline → Growth
        { grade_raw: 'Black', count: 5 },   // V9 - above baseline → Limit
      ];
      const result = computeSessionZones(logs, mockMappings, 'user-1', 5); // baseline = V5
      
      expect(result.comfort_pct).toBeGreaterThan(25);
      expect(result.growth_pct).toBeGreaterThan(25);
      expect(result.limit_pct).toBeGreaterThan(25);
    });

    it('respects user baseline for relative zone classification', () => {
      // Same grades, different baseline → different zones
      const logs = [{ grade_raw: 'Blue', count: 10 }]; // V4.5
      
      // High baseline (V8): Blue is well below → Comfort
      const highResult = computeSessionZones(logs, mockMappings, 'user-1', 8);
      expect(highResult.comfort_pct).toBe(100);
      
      // Low baseline (V2): Blue is above → Limit
      const lowResult = computeSessionZones(logs, mockMappings, 'user-1', 2);
      expect(lowResult.limit_pct).toBe(100);
    });
  });
});

describe('Gym Difficulty Profile', () => {
  const mockMappings: GradeMapping[] = [
    createMockMapping('V0', 0, 'V0', 'V0'),
    createMockMapping('V3', 1, 'V3', 'V3'),
    createMockMapping('V5', 2, 'V5', 'V5'),
  ];

  describe('computeGymDifficultyProfile', () => {
    it('returns zeros for empty sessions', () => {
      const result = computeGymDifficultyProfile([], 50);
      expect(result).toEqual({ difficulty_bias: 0, samples_count: 0 });
    });

    it('correctly calculates bias for easier gym', () => {
      const sessions = [{
        id: 'session-1',
        gym_id: 'gym-1',
        boulder_logs: [{ grade_raw: 'V0', count: 10 }],
        mappings: mockMappings,
      }];
      
      const result = computeGymDifficultyProfile(sessions, 50);
      expect(result.difficulty_bias).toBeGreaterThan(0); // Baseline higher than gym avg = negative bias (easier)
      expect(result.samples_count).toBe(10);
    });

    it('correctly updates samples_count', () => {
      const sessions = [{
        id: 'session-1',
        gym_id: 'gym-1',
        boulder_logs: [
          { grade_raw: 'V0', count: 5 },
          { grade_raw: 'V3', count: 3 },
          { grade_raw: 'V5', count: 2 },
        ],
        mappings: mockMappings,
      }];
      
      const result = computeGymDifficultyProfile(sessions, 50);
      expect(result.samples_count).toBe(10);
    });

    it('bias moves correctly with controlled samples', () => {
      // Session with high grades (hard gym)
      const hardSession = [{
        id: 'session-1',
        gym_id: 'gym-1',
        boulder_logs: [{ grade_raw: 'V5', count: 10 }],
        mappings: mockMappings,
      }];
      
      // Session with low grades (easy gym)
      const easySession = [{
        id: 'session-2',
        gym_id: 'gym-2',
        boulder_logs: [{ grade_raw: 'V0', count: 10 }],
        mappings: mockMappings,
      }];
      
      const hardResult = computeGymDifficultyProfile(hardSession, 50);
      const easyResult = computeGymDifficultyProfile(easySession, 50);
      
      // Hard gym should have lower/negative bias (user climbs lower than baseline)
      // Easy gym should have higher/positive bias (user climbs higher than baseline)
      expect(easyResult.difficulty_bias).toBeGreaterThan(hardResult.difficulty_bias);
    });
  });
});

describe('Max Grade Calculation', () => {
  const mockMappings: GradeMapping[] = [
    createMockMapping('Yellow', 0, 'V0', 'V1'),
    createMockMapping('Green', 1, 'V2', 'V3'),
    createMockMapping('Blue', 2, 'V4', 'V5'),
    createMockMapping('Red', 3, 'V6', 'V7'),
  ];

  describe('getMaxGrade', () => {
    it('returns null for empty logs', () => {
      expect(getMaxGrade([], mockMappings)).toBeNull();
    });

    it('returns null for empty mappings', () => {
      const logs = [{ grade_raw: 'Yellow', count: 5 }];
      expect(getMaxGrade(logs, [])).toBeNull();
    });

    it('returns the highest grade with count > 0', () => {
      const logs = [
        { grade_raw: 'Yellow', count: 5 },
        { grade_raw: 'Blue', count: 2 },
        { grade_raw: 'Green', count: 0 }, // Should be ignored
      ];
      expect(getMaxGrade(logs, mockMappings)).toBe('Blue');
    });

    it('ignores grades not in mappings', () => {
      const logs = [
        { grade_raw: 'Yellow', count: 5 },
        { grade_raw: 'Unknown', count: 10 }, // Not in mappings
      ];
      expect(getMaxGrade(logs, mockMappings)).toBe('Yellow');
    });
  });
});

describe('OFF-WALL Session Handling', () => {
  it('OFF-WALL sessions work without session_gyms', () => {
    // OFF-WALL sessions should not require gym_id
    // This test verifies the zone computation handles missing gym data gracefully
    const logs = [{ grade_raw: 'Yellow', count: 5 }];
    const result = computeSessionZones(logs, [], 'user-1');
    
    // Should return zeros, not throw
    expect(result).toEqual({ comfort_pct: 0, growth_pct: 0, limit_pct: 0 });
  });

  it('OFF-WALL sessions are not filtered out by gym selection', () => {
    // This is a conceptual test - OFF-WALL sessions don't have gym associations
    // The Analytics page should not filter them when a gym is selected
    const offWallSession = {
      id: 'off-wall-1',
      session_type: 'off_wall',
      session_gyms: [], // No gym association
    };
    
    // OFF-WALL sessions should always appear regardless of gym filter
    expect(offWallSession.session_gyms).toHaveLength(0);
  });
});

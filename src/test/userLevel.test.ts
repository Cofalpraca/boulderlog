import { describe, it, expect } from 'vitest';
import {
  getVScaleIndex,
  fontGradeToVScore,
  mappingToVScore,
  buildGradeLookup,
  extractScores,
  calculatePercentile,
  calculateMax,
  vScoreToVGrade,
  vScoreToFontGrade,
  vScoreToGymLabel,
  scoreToGrade,
  computeUserLevel,
  MIN_BOULDERS_FOR_LEVEL,
  TOP_BOULDERS_COUNT,
  DEFAULT_FONT_TO_V,
  V_SCORE_TO_FONT,
  type SessionData,
} from '@/lib/userLevel';
import type { Database } from '@/integrations/supabase/types';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];

// Helper to create mock grade mappings
function createMapping(
  label: string,
  vMin: string | null,
  vMax: string | null,
  orderIndex: number = 0,
  fontMin: string | null = null,
  fontMax: string | null = null
): GradeMapping {
  return {
    id: `map-${label}`,
    gym_id: 'gym-1',
    label,
    approx_v_min: vMin,
    approx_v_max: vMax,
    approx_font_min: fontMin,
    approx_font_max: fontMax,
    color_hex: null,
    order_index: orderIndex,
    created_at: new Date().toISOString(),
  };
}

// ============================================================================
// CANONICAL FONT → V-SCALE MAPPING TESTS
// ============================================================================

describe('DEFAULT_FONT_TO_V Canonical Mapping', () => {
  it('has mappings for all standard Font grades', () => {
    const requiredGrades = ['4', '4+', '5', '5+', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+'];
    for (const grade of requiredGrades) {
      expect(DEFAULT_FONT_TO_V[grade]).toBeDefined();
      expect(typeof DEFAULT_FONT_TO_V[grade]).toBe('number');
    }
  });

  it('maps Font grades to expected V-scores', () => {
    // Specific required mappings from spec
    expect(DEFAULT_FONT_TO_V['4']).toBe(0);      // V0
    expect(DEFAULT_FONT_TO_V['4+']).toBe(0);     // V0
    expect(DEFAULT_FONT_TO_V['5']).toBe(1);      // V1
    expect(DEFAULT_FONT_TO_V['5+']).toBe(2);     // V2
    expect(DEFAULT_FONT_TO_V['5a']).toBe(1);     // V1
    expect(DEFAULT_FONT_TO_V['5b']).toBe(1);     // V1
    expect(DEFAULT_FONT_TO_V['5c']).toBe(2);     // V2
    expect(DEFAULT_FONT_TO_V['6a']).toBe(3);     // V3
    expect(DEFAULT_FONT_TO_V['6a+']).toBe(4);    // V4
    expect(DEFAULT_FONT_TO_V['6b']).toBe(5);     // V5
    expect(DEFAULT_FONT_TO_V['6b+']).toBe(5);    // V5
    expect(DEFAULT_FONT_TO_V['6c']).toBe(6);     // V6
    expect(DEFAULT_FONT_TO_V['6c+']).toBe(6);    // V6
    expect(DEFAULT_FONT_TO_V['7a']).toBe(7);     // V7
    expect(DEFAULT_FONT_TO_V['7a+']).toBe(8);    // V8
    expect(DEFAULT_FONT_TO_V['7b']).toBe(9);     // V9
    expect(DEFAULT_FONT_TO_V['7b+']).toBe(10);   // V10
    expect(DEFAULT_FONT_TO_V['7c']).toBe(11);    // V11
    expect(DEFAULT_FONT_TO_V['7c+']).toBe(12);   // V12
    expect(DEFAULT_FONT_TO_V['8a']).toBe(13);    // V13
    expect(DEFAULT_FONT_TO_V['8a+']).toBe(14);   // V14
  });

  it('no Font grade resolves to null or undefined', () => {
    for (const [grade, vScore] of Object.entries(DEFAULT_FONT_TO_V)) {
      expect(vScore).not.toBeNull();
      expect(vScore).not.toBeUndefined();
      expect(typeof vScore).toBe('number');
      expect(vScore).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('V_SCORE_TO_FONT Inverse Mapping', () => {
  it('has mappings for V-scores 0 through 17', () => {
    for (let i = 0; i <= 17; i++) {
      expect(V_SCORE_TO_FONT[i]).toBeDefined();
      expect(typeof V_SCORE_TO_FONT[i]).toBe('string');
    }
  });

  it('maps V-scores to expected Font grades', () => {
    expect(V_SCORE_TO_FONT[0]).toBe('4');
    expect(V_SCORE_TO_FONT[1]).toBe('5a');
    expect(V_SCORE_TO_FONT[2]).toBe('5c');
    expect(V_SCORE_TO_FONT[3]).toBe('6a');
    expect(V_SCORE_TO_FONT[7]).toBe('7a');
  });
});

// ============================================================================
// FONT GRADE NORMALIZATION TESTS
// ============================================================================

describe('fontGradeToVScore', () => {
  it('converts Font grades to V-scores using canonical table', () => {
    expect(fontGradeToVScore('5a')).toBe(1);  // V1
    expect(fontGradeToVScore('5b')).toBe(1);  // V1
    expect(fontGradeToVScore('5c')).toBe(2);  // V2
    expect(fontGradeToVScore('6a')).toBe(3);  // V3
    expect(fontGradeToVScore('7a')).toBe(7);  // V7
  });

  it('is case-insensitive', () => {
    expect(fontGradeToVScore('6A')).toBe(3);
    expect(fontGradeToVScore('7A+')).toBe(8);
  });

  it('returns -1 for invalid grades', () => {
    expect(fontGradeToVScore(null)).toBe(-1);
    expect(fontGradeToVScore('')).toBe(-1);
    expect(fontGradeToVScore('invalid')).toBe(-1);
    expect(fontGradeToVScore('V5')).toBe(-1); // V-scale is not Font
  });

  it('handles all Font grades without returning null/undefined', () => {
    const fontGrades = Object.keys(DEFAULT_FONT_TO_V);
    for (const grade of fontGrades) {
      const result = fontGradeToVScore(grade);
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result).toBeGreaterThanOrEqual(0);
    }
  });
});

// ============================================================================
// V-SCALE INDEX TESTS
// ============================================================================

describe('V-Scale Index Conversion', () => {
  it('returns correct index for valid V grades', () => {
    expect(getVScaleIndex('V0')).toBe(0);
    expect(getVScaleIndex('V5')).toBe(5);
    expect(getVScaleIndex('V10')).toBe(10);
    expect(getVScaleIndex('V16')).toBe(16);
  });

  it('returns -1 for invalid grades', () => {
    expect(getVScaleIndex(null)).toBe(-1);
    expect(getVScaleIndex('')).toBe(-1);
    expect(getVScaleIndex('invalid')).toBe(-1);
    expect(getVScaleIndex('6a')).toBe(-1);
  });
});

// ============================================================================
// GRADE MAPPING NORMALIZATION TESTS
// ============================================================================

describe('Mapping to V-Score', () => {
  it('calculates midpoint of V-scale range', () => {
    const mapping = createMapping('Blue', 'V3', 'V5');
    expect(mappingToVScore(mapping)).toBe(4); // (3+5)/2
  });

  it('handles single-bound mappings', () => {
    const onlyMin = createMapping('Green', 'V2', null);
    expect(mappingToVScore(onlyMin)).toBe(2);

    const onlyMax = createMapping('Yellow', null, 'V4');
    expect(mappingToVScore(onlyMax)).toBe(4);
  });

  it('falls back to Font grades when V-scale bounds missing', () => {
    // Create a mapping with only Font bounds
    const fontMapping = createMapping('FontGrade', null, null, 0, '6a', '6b');
    
    // Should use Font fallback: (3 + 5) / 2 = 4
    const score = mappingToVScore(fontMapping);
    expect(score).toBe(4); // (6a=3 + 6b=5) / 2
  });

  it('handles Font-only single bound mappings', () => {
    const onlyFontMin = createMapping('FontMin', null, null, 0, '7a', null);
    expect(mappingToVScore(onlyFontMin)).toBe(7); // 7a = V7

    const onlyFontMax = createMapping('FontMax', null, null, 0, null, '6c');
    expect(mappingToVScore(onlyFontMax)).toBe(6); // 6c = V6
  });

  it('returns -1 for missing all bounds', () => {
    const noV = createMapping('None', null, null, 0, null, null);
    expect(mappingToVScore(noV)).toBe(-1);
  });

  it('prioritizes V-scale over Font when both present', () => {
    const bothMapping: GradeMapping = {
      id: 'map-both',
      gym_id: 'gym-1',
      label: 'Both',
      approx_v_min: 'V5',
      approx_v_max: 'V7',
      approx_font_min: '6a',
      approx_font_max: '6b',
      color_hex: null,
      order_index: 0,
      created_at: new Date().toISOString(),
    };
    
    expect(mappingToVScore(bothMapping)).toBe(6); // V-scale: (5+7)/2, not Font
  });
});

// ============================================================================
// BUILD GRADE LOOKUP TESTS
// ============================================================================

describe('Build Grade Lookup', () => {
  it('builds lookup map from mappings', () => {
    const mappings = [
      createMapping('Yellow', 'V0', 'V1'),
      createMapping('Green', 'V2', 'V3'),
      createMapping('Blue', 'V4', 'V5'),
    ];

    const lookup = buildGradeLookup(mappings);
    expect(lookup.get('Yellow')).toBe(0.5);
    expect(lookup.get('Green')).toBe(2.5);
    expect(lookup.get('Blue')).toBe(4.5);
  });

  it('includes Font-only mappings', () => {
    const mappings = [
      createMapping('FontOnly', null, null, 0, '7a', '7b'), // 7a=7, 7b=9 → midpoint=8
    ];

    const lookup = buildGradeLookup(mappings);
    expect(lookup.has('FontOnly')).toBe(true);
    expect(lookup.get('FontOnly')).toBe(8); // (7+9)/2
  });

  it('excludes mappings without any valid bounds', () => {
    const mappings = [
      createMapping('Red', null, null, 0, null, null),
      createMapping('Blue', 'V4', 'V5'),
    ];

    const lookup = buildGradeLookup(mappings);
    expect(lookup.has('Red')).toBe(false);
    expect(lookup.has('Blue')).toBe(true);
  });

  // CRITICAL: Test for the regression fix - direct Font grades must be mappable
  it('includes canonical Font grades directly (regression fix)', () => {
    // Even with just gym color mappings, Font grades should be directly lookupable
    const colorMappings = [
      createMapping('Yellow', 'V0', 'V1'),
      createMapping('Green', 'V2', 'V3'),
    ];

    const lookup = buildGradeLookup(colorMappings);
    
    // Font grades from DEFAULT_FONT_TO_V should be in the lookup
    expect(lookup.get('6a')).toBe(3);
    expect(lookup.get('6a+')).toBe(4);
    expect(lookup.get('6b')).toBe(5);
    expect(lookup.get('6b+')).toBe(5);
    expect(lookup.get('6c')).toBe(6);
    expect(lookup.get('6c+')).toBe(6);
    expect(lookup.get('7a')).toBe(7);
  });

  it('includes V-Scale grades directly', () => {
    const mappings: GradeMapping[] = [];

    const lookup = buildGradeLookup(mappings);
    
    // V-Scale grades should be in the lookup even with no mappings
    expect(lookup.get('V0')).toBe(0);
    expect(lookup.get('V1')).toBe(1);
    expect(lookup.get('V5')).toBe(5);
    expect(lookup.get('V10')).toBe(10);
  });

  it('gym mappings take priority over canonical grades', () => {
    // If a gym has a label "6a" with custom mapping, use that
    const customMappings = [
      createMapping('6a', 'V10', 'V12'), // Custom override for '6a' label
    ];

    const lookup = buildGradeLookup(customMappings);
    
    // The gym-specific mapping should take priority
    expect(lookup.get('6a')).toBe(11); // (10+12)/2, not 3 from DEFAULT_FONT_TO_V
  });
});

// ============================================================================
// EXTRACT SCORES TESTS
// ============================================================================

describe('Extract Scores', () => {
  it('extracts scores expanded by count', () => {
    const logs = [
      { grade_raw: 'Blue', count: 3 },
      { grade_raw: 'Green', count: 2 },
    ];
    const lookup = new Map([
      ['Blue', 4.5],
      ['Green', 2.5],
    ]);

    const scores = extractScores(logs, lookup);
    expect(scores).toHaveLength(5);
    expect(scores.filter(s => s === 4.5)).toHaveLength(3);
    expect(scores.filter(s => s === 2.5)).toHaveLength(2);
  });

  it('ignores grades not in lookup', () => {
    const logs = [
      { grade_raw: 'Unknown', count: 5 },
      { grade_raw: 'Blue', count: 2 },
    ];
    const lookup = new Map([['Blue', 4.5]]);

    const scores = extractScores(logs, lookup);
    expect(scores).toHaveLength(2);
  });
});

// ============================================================================
// PERCENTILE AND MAX CALCULATION TESTS
// ============================================================================

describe('Percentile Calculation', () => {
  it('calculates 75th percentile correctly', () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(calculatePercentile(sorted, 0.75)).toBe(6.25);
  });

  it('returns -1 for empty array', () => {
    expect(calculatePercentile([], 0.75)).toBe(-1);
  });

  it('returns single value for single-element array', () => {
    expect(calculatePercentile([5], 0.75)).toBe(5);
  });

  it('handles edge percentiles', () => {
    const sorted = [1, 2, 3, 4, 5];
    expect(calculatePercentile(sorted, 0)).toBe(1);
    expect(calculatePercentile(sorted, 1)).toBe(5);
  });
});

describe('Max Calculation', () => {
  it('returns max score', () => {
    expect(calculateMax([1, 5, 3, 8, 2])).toBe(8);
  });

  it('returns -1 for empty array', () => {
    expect(calculateMax([])).toBe(-1);
  });
});

// ============================================================================
// SCORE TO GRADE CONVERSION TESTS
// ============================================================================

describe('Score to Grade Conversion', () => {
  it('converts V-score to V-grade', () => {
    expect(vScoreToVGrade(0)).toBe('V0');
    expect(vScoreToVGrade(4.4)).toBe('V4');
    expect(vScoreToVGrade(4.6)).toBe('V5');
    expect(vScoreToVGrade(10)).toBe('V10');
  });

  it('clamps out-of-range scores', () => {
    expect(vScoreToVGrade(-1)).toBe(null);
    expect(vScoreToVGrade(20)).toBe('V17');
  });

  it('converts V-score to Font grade using canonical table', () => {
    expect(vScoreToFontGrade(0)).toBe('4');
    expect(vScoreToFontGrade(1)).toBe('5a');
    expect(vScoreToFontGrade(7)).toBe('7a');
    expect(vScoreToFontGrade(-1)).toBe(null);
  });

  it('converts V-score to gym label', () => {
    const mappings = [
      createMapping('Yellow', 'V0', 'V1'),
      createMapping('Blue', 'V4', 'V5'),
    ];

    expect(vScoreToGymLabel(0.5, mappings)).toBe('Yellow');
    expect(vScoreToGymLabel(4, mappings)).toBe('Blue');
  });
});

describe('Score to Grade by Scale', () => {
  const mappings = [
    createMapping('Yellow', 'V0', 'V1'),
    createMapping('Blue', 'V4', 'V5'),
  ];

  it('uses v_scale correctly', () => {
    expect(scoreToGrade(5, 'v_scale')).toBe('V5');
  });

  it('uses font correctly', () => {
    expect(scoreToGrade(5, 'font')).toBe('6b');
  });

  it('uses colors with gym mappings', () => {
    expect(scoreToGrade(4.5, 'colors', mappings)).toBe('Blue');
  });

  it('falls back to v_scale for colors without mappings', () => {
    expect(scoreToGrade(5, 'colors')).toBe('V5');
  });
});

// ============================================================================
// COMPUTE USER LEVEL TESTS
// ============================================================================

describe('Compute User Level', () => {
  const mappings = [
    createMapping('Yellow', 'V0', 'V1'),
    createMapping('Green', 'V2', 'V3'),
    createMapping('Blue', 'V4', 'V5'),
    createMapping('Purple', 'V6', 'V7'),
  ];

  const now = new Date();
  const recentDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const oldDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString();
  const veryOldDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString();

  it('computes level with dual format (V-Scale and Font)', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Blue', count: 10 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');

    expect(result.hasData).toBe(true);
    expect(result.levelVGrade).not.toBe(null);
    expect(result.levelFontGrade).not.toBe(null);
    expect(result.levelVGrade).toMatch(/^V\d+$/);
    expect(result.levelFontGrade).toMatch(/^\d+[abc]?\+?$/);
  });

  it('computes level from ON-WALL sessions with at least MIN_BOULDERS_FOR_LEVEL', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Blue', count: 5 },
          { grade_raw: 'Green', count: 3 },
        ],
      },
      {
        id: 's2',
        date_start: oldDate,
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Yellow', count: 4 },
          { grade_raw: 'Green', count: 2 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');

    expect(result.hasData).toBe(true);
    expect(result.totalBoulders).toBe(14);
    expect(result.levelScore).toBeGreaterThan(0);
    expect(result.levelGrade).not.toBe(null);
    expect(result.levelVGrade).not.toBe(null);
    expect(result.levelFontGrade).not.toBe(null);
  });

  it('excludes OFF-WALL sessions', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'off_wall',
        boulder_logs: [{ grade_raw: 'Blue', count: 15 }],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');

    expect(result.hasData).toBe(false);
    expect(result.totalBoulders).toBe(0);
  });

  it('excludes sessions outside 90-day window', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: veryOldDate,
        session_type: 'on_wall',
        boulder_logs: [{ grade_raw: 'Purple', count: 15 }],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');

    expect(result.hasData).toBe(false);
  });

  it('returns hasData=false when boulder count < MIN_BOULDERS_FOR_LEVEL', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'on_wall',
        boulder_logs: [{ grade_raw: 'Blue', count: MIN_BOULDERS_FOR_LEVEL - 1 }],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');

    expect(result.hasData).toBe(false);
    expect(result.totalBoulders).toBe(MIN_BOULDERS_FOR_LEVEL - 1);
    expect(result.levelGrade).toBe(null);
  });

  it('returns hasData=true when boulder count >= MIN_BOULDERS_FOR_LEVEL', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'on_wall',
        boulder_logs: [{ grade_raw: 'Blue', count: MIN_BOULDERS_FOR_LEVEL }],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');

    expect(result.hasData).toBe(true);
    expect(result.totalBoulders).toBe(MIN_BOULDERS_FOR_LEVEL);
    expect(result.levelGrade).not.toBe(null);
  });

  it('returns hasData=false for no data', () => {
    const result = computeUserLevel([], mappings, 'v_scale');

    expect(result.hasData).toBe(false);
    expect(result.levelGrade).toBe(null);
    expect(result.maxGrade).toBe(null);
  });

  it('handles missing mappings gracefully', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Unknown', count: 5 },
          { grade_raw: 'Blue', count: 10 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');

    // Only Blue is counted (10 sends)
    expect(result.totalBoulders).toBe(10);
    expect(result.hasData).toBe(true);
  });

  it('selects top N boulders by difficulty', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Yellow', count: 10 }, // V0.5, easiest
          { grade_raw: 'Green', count: 10 },  // V2.5, medium
          { grade_raw: 'Blue', count: 10 },   // V4.5, harder
          { grade_raw: 'Purple', count: 5 },  // V6.5, hardest
        ],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');

    expect(result.hasData).toBe(true);
    expect(result.totalBoulders).toBe(35);
    // Top 20 should be: 5 Purple (6.5) + 10 Blue (4.5) + 5 Green (2.5)
    expect(result.bouldersUsed).toBe(TOP_BOULDERS_COUNT);
    expect(result.levelScore).toBeCloseTo(4.5, 1);
    expect(result.maxScore).toBe(6.5);
  });

  it('uses all boulders when fewer than TOP_BOULDERS_COUNT exist', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Blue', count: 12 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');

    expect(result.hasData).toBe(true);
    expect(result.totalBoulders).toBe(12);
    expect(result.bouldersUsed).toBe(12);
    expect(result.levelScore).toBe(4.5);
  });

  it('formats grades according to preferred scale', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'on_wall',
        boulder_logs: [{ grade_raw: 'Blue', count: 15 }],
      },
    ];

    const vResult = computeUserLevel(sessions, mappings, 'v_scale');
    expect(vResult.levelGrade).toMatch(/^V\d+$/);

    const colorResult = computeUserLevel(sessions, mappings, 'colors', mappings);
    expect(colorResult.levelGrade).toBe('Blue');
  });

  it('sets missingMappings flag when no mappings provided', () => {
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: recentDate,
        session_type: 'on_wall',
        boulder_logs: [{ grade_raw: 'Blue', count: 15 }],
      },
    ];

    const result = computeUserLevel(sessions, [], 'v_scale');

    expect(result.missingMappings).toBe(true);
    expect(result.hasData).toBe(false);
  });
});

// ============================================================================
// FONT-ONLY GYM TESTS
// ============================================================================

describe('Font-Only Gym Support', () => {
  it('Font-only gyms always produce valid V-scores', () => {
    const fontOnlyMappings = [
      createMapping('Easy', null, null, 0, '5a', '5c'),
      createMapping('Medium', null, null, 1, '6a', '6b+'),
      createMapping('Hard', null, null, 2, '7a', '7b'),
    ];

    const lookup = buildGradeLookup(fontOnlyMappings);
    
    // Size includes gym mappings + canonical Font grades + V-scale grades
    expect(lookup.size).toBeGreaterThanOrEqual(3);
    expect(lookup.get('Easy')).toBeGreaterThanOrEqual(0);
    expect(lookup.get('Medium')).toBeGreaterThanOrEqual(0);
    expect(lookup.get('Hard')).toBeGreaterThanOrEqual(0);
  });

  it('computes User Level correctly for Font-only gym', () => {
    const fontOnlyMappings = [
      createMapping('Easy', null, null, 0, '5a', '5c'),   // V1.5
      createMapping('Medium', null, null, 1, '6a', '6b'), // V4
      createMapping('Hard', null, null, 2, '7a', '7b'),   // V8
    ];

    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: new Date().toISOString(),
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Medium', count: 10 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, fontOnlyMappings, 'font');

    expect(result.hasData).toBe(true);
    expect(result.totalBoulders).toBe(10);
    expect(result.levelVGrade).not.toBe(null);
    expect(result.levelFontGrade).not.toBe(null);
  });
});

// ============================================================================
// COLOR AND NUMERIC GRADE TESTS
// ============================================================================

describe('Color Grade Support', () => {
  it('color grades with mapping produce valid User Level', () => {
    const colorMappings = [
      createMapping('Yellow', 'V0', 'V2'),
      createMapping('Green', 'V3', 'V5'),
      createMapping('Blue', 'V6', 'V8'),
    ];

    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: new Date().toISOString(),
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Green', count: 12 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, colorMappings, 'colors', colorMappings);

    expect(result.hasData).toBe(true);
    expect(result.levelGrade).toBe('Green');
    expect(result.levelVGrade).toMatch(/^V\d+$/);
    expect(result.levelFontGrade).toMatch(/^\d+[abc]?\+?$/);
  });
});

describe('Numeric Grade Support', () => {
  it('numeric grades with mapping produce valid User Level', () => {
    const numericMappings = [
      createMapping('1', 'V0', 'V1'),
      createMapping('2', 'V2', 'V3'),
      createMapping('3', 'V4', 'V5'),
      createMapping('4', 'V6', 'V7'),
    ];

    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: new Date().toISOString(),
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: '3', count: 10 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, numericMappings, 'numeric', numericMappings);

    expect(result.hasData).toBe(true);
    expect(result.levelGrade).toBe('3');
    expect(result.levelVGrade).toMatch(/^V\d+$/);
    expect(result.levelFontGrade).toMatch(/^\d+[abc]?\+?$/);
  });
});

// ============================================================================
// MISSING MAPPINGS GRACEFUL HANDLING TESTS
// ============================================================================

describe('Missing Mappings Handling', () => {
  it('missing mappings do not crash analytics', () => {
    const partialMappings = [
      createMapping('Blue', 'V4', 'V6'),
    ];

    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: new Date().toISOString(),
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Unknown1', count: 5 },
          { grade_raw: 'Unknown2', count: 5 },
          { grade_raw: 'Blue', count: 10 },
        ],
      },
    ];

    // Should not throw
    expect(() => computeUserLevel(sessions, partialMappings, 'v_scale')).not.toThrow();
    
    const result = computeUserLevel(sessions, partialMappings, 'v_scale');
    expect(result.hasData).toBe(true);
    expect(result.totalBoulders).toBe(10); // Only Blue is counted
  });

  it('returns graceful result when all boulders are unmappable', () => {
    const mappings = [
      createMapping('Blue', 'V4', 'V6'),
    ];

    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: new Date().toISOString(),
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'Unknown', count: 20 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');
    expect(result.hasData).toBe(false);
    expect(result.totalBoulders).toBe(0);
    expect(result.levelVGrade).toBe(null);
    expect(result.levelFontGrade).toBe(null);
  });
});

// ============================================================================
// REGRESSION TEST: Font grades in grade_raw must compute correctly
// ============================================================================

describe('Font grades in grade_raw regression fix', () => {
  it('computes user level when grade_raw contains Font grades like 6b+', () => {
    // This is the exact regression scenario:
    // - User logs boulders with Font grades (6a+, 6b, 6b+, 6c+)
    // - Even if gym uses color mappings, the Font grades in boulder_logs should work
    const colorMappings = [
      createMapping('Yellow', 'V0', 'V1'),
      createMapping('Green', 'V2', 'V3'),
      createMapping('Blue', 'V4', 'V5'),
    ];

    // 20 boulders logged with Font grades (not color labels)
    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: new Date().toISOString(),
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: '6b+', count: 10 }, // Font grade, should map to V5
          { grade_raw: '6a+', count: 10 }, // Font grade, should map to V4
        ],
      },
    ];

    const result = computeUserLevel(sessions, colorMappings, 'v_scale');
    
    // MUST have data since 20 boulders are mapped
    expect(result.hasData).toBe(true);
    expect(result.totalBoulders).toBe(20);
    expect(result.bouldersUsed).toBe(20);
    expect(result.levelVGrade).not.toBe(null);
    expect(result.levelFontGrade).not.toBe(null);
  });

  it('computes user level with mixed Font grades (real-world scenario)', () => {
    const mappings: GradeMapping[] = [];

    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: new Date().toISOString(),
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: '6b', count: 5 },
          { grade_raw: '6b+', count: 5 },
          { grade_raw: '6a+', count: 5 },
          { grade_raw: '6c+', count: 5 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');
    
    expect(result.hasData).toBe(true);
    expect(result.totalBoulders).toBe(20);
    // 6b=V5, 6b+=V5, 6a+=V4, 6c+=V6 → average around V5
    expect(result.levelScore).toBeCloseTo(5); // (5*5 + 5*5 + 4*5 + 6*5) / 20 = 5
    expect(result.levelVGrade).toBe('V5');
  });

  it('computes user level with V-scale grades in grade_raw', () => {
    const mappings: GradeMapping[] = [];

    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: new Date().toISOString(),
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'V5', count: 10 },
          { grade_raw: 'V6', count: 10 },
        ],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');
    
    expect(result.hasData).toBe(true);
    expect(result.totalBoulders).toBe(20);
    expect(result.levelVGrade).toBe('V6'); // Top 20, sorted desc: 10×V6, 10×V5 → avg 5.5 → rounds to V6
  });

  it('provides diagnostic info when insufficient boulders are mapped', () => {
    const mappings: GradeMapping[] = [];

    const sessions: SessionData[] = [
      {
        id: 's1',
        date_start: new Date().toISOString(),
        session_type: 'on_wall',
        boulder_logs: [
          { grade_raw: 'UnknownGrade', count: 20 }, // Not mappable
          { grade_raw: '6a', count: 5 }, // Mappable but < 10
        ],
      },
    ];

    const result = computeUserLevel(sessions, mappings, 'v_scale');
    
    expect(result.hasData).toBe(false);
    expect(result.rawLogsFound).toBe(2); // 2 log entries
    expect(result.unmappedLogs).toBe(1); // 1 unmapped
    expect(result.totalBoulders).toBe(5); // Only 5 mapped
  });
});

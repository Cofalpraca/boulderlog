import { describe, it, expect } from 'vitest';
import { computeSessionZones } from '@/lib/analytics';
import type { Database } from '@/integrations/supabase/types';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];

// Helper to create a minimal grade mapping
function createMapping(label: string, vMin: string, vMax: string, fontMin?: string, fontMax?: string): GradeMapping {
  return {
    id: label,
    gym_id: 'test-gym',
    label,
    order_index: 0,
    color_hex: null,
    approx_v_min: vMin,
    approx_v_max: vMax,
    approx_font_min: fontMin || null,
    approx_font_max: fontMax || null,
    created_at: new Date().toISOString(),
  };
}

describe('computeSessionZones - User Level Relative Classification', () => {
  /**
   * Zone classification rules (canonical):
   * - Comfort: v_score ≤ userLevel - 1.0
   * - Growth: userLevel - 1.0 < v_score ≤ userLevel + 1.5
   * - Limit: v_score > userLevel + 1.5
   */

  describe('Basic zone distribution with explicit user level', () => {
    it('should classify grades below userLevel - 1 as Comfort', () => {
      const mappings = [
        createMapping('V3', 'V3', 'V3'),
        createMapping('V4', 'V4', 'V4'),
        createMapping('V5', 'V5', 'V5'),
        createMapping('V6', 'V6', 'V6'),
      ];
      
      // User level = V6 (6), so Comfort threshold = 5
      // V3 (3) and V4 (4) are ≤ 5 → Comfort
      // V5 (5) is ≤ 5 → Comfort
      // V6 (6) is in Growth range (5 < x ≤ 7.5)
      const logs = [
        { grade_raw: 'V3', count: 10 },
        { grade_raw: 'V6', count: 5 },
      ];
      
      const result = computeSessionZones(logs, mappings, 'test-user', 6);
      
      // V3 (10) → Comfort, V6 (5) → Growth
      expect(result.comfort_pct).toBe(67); // 10/15 ≈ 67%
      expect(result.growth_pct).toBe(33);  // 5/15 ≈ 33%
      expect(result.limit_pct).toBe(0);
    });

    it('should classify grades above userLevel + 1.5 as Limit', () => {
      const mappings = [
        createMapping('V5', 'V5', 'V5'),
        createMapping('V6', 'V6', 'V6'),
        createMapping('V8', 'V8', 'V8'),
      ];
      
      // User level = V6 (6), Limit threshold = 7.5
      // V5 (5) → Comfort (≤ 5)
      // V6 (6) → Growth (5 < x ≤ 7.5)
      // V8 (8) → Limit (> 7.5)
      const logs = [
        { grade_raw: 'V5', count: 3 },
        { grade_raw: 'V6', count: 5 },
        { grade_raw: 'V8', count: 2 },
      ];
      
      const result = computeSessionZones(logs, mappings, 'test-user', 6);
      
      expect(result.comfort_pct).toBe(30); // 3/10 = 30%
      expect(result.growth_pct).toBe(50);  // 5/10 = 50%
      expect(result.limit_pct).toBe(20);   // 2/10 = 20%
    });

    it('should have V7 in Growth when userLevel is V6 (within +1.5 threshold)', () => {
      const mappings = [
        createMapping('V7', 'V7', 'V7'),
      ];
      
      // User level = V6, Limit threshold = 7.5
      // V7 (7) ≤ 7.5 → Growth
      const logs = [{ grade_raw: 'V7', count: 10 }];
      
      const result = computeSessionZones(logs, mappings, 'test-user', 6);
      
      expect(result.comfort_pct).toBe(0);
      expect(result.growth_pct).toBe(100);
      expect(result.limit_pct).toBe(0);
    });
  });

  describe('Real-world example: User at 6c/V5-V6 level', () => {
    it('should produce balanced distribution for typical climbing session', () => {
      // User climbs at 6c level (~V6)
      const mappings = [
        createMapping('5a', 'V1', 'V1', '5a', '5a'),
        createMapping('5c', 'V2', 'V2', '5c', '5c'),
        createMapping('6a', 'V3', 'V3', '6a', '6a'),
        createMapping('6a+', 'V4', 'V4', '6a+', '6a+'),
        createMapping('6b', 'V5', 'V5', '6b', '6b'),
        createMapping('6b+', 'V5', 'V5', '6b+', '6b+'),
        createMapping('6c', 'V6', 'V6', '6c', '6c'),
        createMapping('6c+', 'V6', 'V6', '6c+', '6c+'),
        createMapping('7a', 'V7', 'V7', '7a', '7a'),
        createMapping('7a+', 'V8', 'V8', '7a+', '7a+'),
        createMapping('7b', 'V9', 'V9', '7b', '7b'),
      ];
      
      // Typical session: warmup on easier grades, main work around level, few projects
      // User Level = V6
      // Comfort: ≤ V5 (5a, 5c, 6a, 6a+, 6b, 6b+) 
      // Growth: V6-V7.5 (6c, 6c+, 7a)
      // Limit: > V7.5 (7a+, 7b)
      const logs = [
        { grade_raw: '5a', count: 2 },   // Warmup - Comfort
        { grade_raw: '5c', count: 2 },   // Warmup - Comfort
        { grade_raw: '6a', count: 3 },   // Easy - Comfort
        { grade_raw: '6a+', count: 5 },  // Easy - Comfort
        { grade_raw: '6b', count: 8 },   // At threshold - Comfort (V5 ≤ 5)
        { grade_raw: '6c', count: 10 },  // At level - Growth
        { grade_raw: '6c+', count: 6 },  // At level - Growth
        { grade_raw: '7a', count: 4 },   // Challenging - Growth
        { grade_raw: '7a+', count: 2 },  // Project - Limit
        { grade_raw: '7b', count: 1 },   // Max attempt - Limit
      ];
      
      const result = computeSessionZones(logs, mappings, 'test-user', 6);
      
      // Comfort: 2+2+3+5+8 = 20
      // Growth: 10+6+4 = 20
      // Limit: 2+1 = 3
      // Total: 43
      expect(result.comfort_pct).toBeGreaterThan(40); // Should be ~47%
      expect(result.growth_pct).toBeGreaterThan(40);  // Should be ~47%
      expect(result.limit_pct).toBeLessThan(10);      // Should be ~7%
    });
  });

  describe('Regression test: Original bug scenario', () => {
    it('should NOT classify 80%+ as Growth when many grades are below user level', () => {
      // Original bug: ~393 boulders, max 7b, user level ~6c
      // Result was: Comfort 6, Growth 309, Limit 78 (wrong!)
      
      const mappings = [
        createMapping('4', 'V0', 'V0'),
        createMapping('5', 'V1', 'V1'),
        createMapping('5+', 'V2', 'V2'),
        createMapping('5a', 'V1', 'V1'),
        createMapping('5b', 'V1', 'V1'),
        createMapping('5c', 'V2', 'V2'),
        createMapping('6a', 'V3', 'V3'),
        createMapping('6a+', 'V4', 'V4'),
        createMapping('6b', 'V5', 'V5'),
        createMapping('6b+', 'V5', 'V5'),
        createMapping('6c', 'V6', 'V6'),
        createMapping('6c+', 'V6', 'V6'),
        createMapping('7a', 'V7', 'V7'),
        createMapping('7a+', 'V8', 'V8'),
        createMapping('7b', 'V9', 'V9'),
      ];
      
      // Simulated distribution: many easy grades, fewer hard ones
      // User level = V6 (6c)
      const logs = [
        { grade_raw: '4', count: 10 },
        { grade_raw: '5', count: 20 },
        { grade_raw: '5+', count: 25 },
        { grade_raw: '5a', count: 30 },
        { grade_raw: '5b', count: 35 },
        { grade_raw: '5c', count: 40 },
        { grade_raw: '6a', count: 50 },
        { grade_raw: '6a+', count: 45 },
        { grade_raw: '6b', count: 40 },
        { grade_raw: '6b+', count: 30 },
        { grade_raw: '6c', count: 25 },
        { grade_raw: '6c+', count: 20 },
        { grade_raw: '7a', count: 15 },
        { grade_raw: '7a+', count: 6 },
        { grade_raw: '7b', count: 2 },
      ];
      
      const result = computeSessionZones(logs, mappings, 'test-user', 6);
      
      // With user level V6:
      // Comfort (≤ V5): V0-V5 grades = 10+20+25+30+35+40+50+45+40+30 = 325
      // Growth (V5 < x ≤ V7.5): V6-V7 = 25+20+15 = 60
      // Limit (> V7.5): V8+ = 6+2 = 8
      // Total = 393
      
      // Comfort should be dominant, NOT Growth
      expect(result.comfort_pct).toBeGreaterThan(70); // Should be ~83%
      expect(result.growth_pct).toBeLessThan(25);     // Should be ~15%
      expect(result.limit_pct).toBeLessThan(5);       // Should be ~2%
    });
  });

  describe('Sanity checks', () => {
    it('should be impossible for Growth > 70% with large diverse volume', () => {
      // A large dataset with many grades should have distributed zones
      const mappings = Array.from({ length: 10 }, (_, i) => 
        createMapping(`V${i}`, `V${i}`, `V${i}`)
      );
      
      // Even distribution across V0-V9
      const logs = mappings.map((m) => ({
        grade_raw: m.label,
        count: 10,
      }));
      
      // User level = V5
      const result = computeSessionZones(logs, mappings, 'test-user', 5);
      
      // Comfort: V0-V4 = 50
      // Growth: V5-V6 = 20  (V5 is at threshold edge, V6 ≤ 6.5)
      // Actually with V5 userLevel: Comfort ≤ V4, Growth V4 < x ≤ V6.5, Limit > V6.5
      // Comfort: V0-V4 = 50
      // Growth: V5-V6 = 20
      // Limit: V7-V9 = 30
      
      expect(result.growth_pct).toBeLessThan(70);
    });

    it('should have Comfort > 0 for users with diverse climbing history', () => {
      const mappings = [
        createMapping('V2', 'V2', 'V2'),
        createMapping('V5', 'V5', 'V5'),
        createMapping('V7', 'V7', 'V7'),
      ];
      
      // User level = V6
      // V2 and V5 should be Comfort
      const logs = [
        { grade_raw: 'V2', count: 5 },
        { grade_raw: 'V5', count: 10 },
        { grade_raw: 'V7', count: 3 },
      ];
      
      const result = computeSessionZones(logs, mappings, 'test-user', 6);
      
      expect(result.comfort_pct).toBeGreaterThan(0);
    });

    it('should have Limit < Growth in typical session', () => {
      const mappings = [
        createMapping('V4', 'V4', 'V4'),
        createMapping('V6', 'V6', 'V6'),
        createMapping('V8', 'V8', 'V8'),
      ];
      
      // Typical session: more volume at/near level, less at projects
      const logs = [
        { grade_raw: 'V4', count: 5 },  // Comfort
        { grade_raw: 'V6', count: 15 }, // Growth
        { grade_raw: 'V8', count: 3 },  // Limit
      ];
      
      const result = computeSessionZones(logs, mappings, 'test-user', 6);
      
      expect(result.limit_pct).toBeLessThan(result.growth_pct);
    });
  });

  describe('Edge cases', () => {
    it('should return all zeros for empty logs', () => {
      const mappings = [createMapping('V5', 'V5', 'V5')];
      const result = computeSessionZones([], mappings, 'test-user', 5);
      
      expect(result).toEqual({ comfort_pct: 0, growth_pct: 0, limit_pct: 0 });
    });

    it('should handle empty mappings with V-scale fallback', () => {
      // With empty mappings, gradeToVScore can still parse direct V-scale grades
      const mappings: GradeMapping[] = [];
      const logs = [{ grade_raw: 'V5', count: 10 }];
      
      // V5 is recognized by direct V-scale parsing even without mappings
      // With userLevel = 5, V5 is in Growth range
      const result = computeSessionZones(logs, mappings, 'test-user', 5);
      
      expect(result.growth_pct).toBe(100);
    });

    it('should use session max as fallback when userLevel not provided', () => {
      const mappings = [
        createMapping('V3', 'V3', 'V3'),
        createMapping('V6', 'V6', 'V6'),
      ];
      
      const logs = [
        { grade_raw: 'V3', count: 5 },
        { grade_raw: 'V6', count: 3 },
      ];
      
      // Without userLevel, should use V6 (max) as baseline
      const result = computeSessionZones(logs, mappings, 'test-user');
      
      // V3 is ≤ V5 (comfort threshold) → Comfort
      // V6 is in Growth range
      expect(result.comfort_pct).toBeGreaterThan(0);
      expect(result.growth_pct).toBeGreaterThan(0);
    });

    it('should handle all boulders at exact user level', () => {
      const mappings = [createMapping('V5', 'V5', 'V5')];
      const logs = [{ grade_raw: 'V5', count: 20 }];
      
      // User level = V5, all boulders at V5
      // V5 > 4 (comfort) and ≤ 6.5 (limit) → all Growth
      const result = computeSessionZones(logs, mappings, 'test-user', 5);
      
      expect(result.growth_pct).toBe(100);
    });
  });

  describe('Color/Numeric grading systems', () => {
    it('should work with color grades using V-scale mappings', () => {
      const mappings = [
        createMapping('Yellow', 'V0', 'V1'),
        createMapping('Green', 'V2', 'V3'),
        createMapping('Blue', 'V4', 'V5'),
        createMapping('Purple', 'V6', 'V7'),
        createMapping('Red', 'V8', 'V9'),
      ];
      
      // User climbs at Blue level (V4-V5 avg = V4.5)
      const logs = [
        { grade_raw: 'Yellow', count: 5 },  // V0.5 → Comfort
        { grade_raw: 'Green', count: 10 },  // V2.5 → Comfort
        { grade_raw: 'Blue', count: 8 },    // V4.5 → Growth
        { grade_raw: 'Purple', count: 3 },  // V6.5 → Limit
      ];
      
      // User level = V5
      // Comfort threshold = V4
      // Limit threshold = V6.5
      const result = computeSessionZones(logs, mappings, 'test-user', 5);
      
      // Yellow (V0.5), Green (V2.5) → Comfort (≤ V4)
      // Blue (V4.5) → Growth (V4 < x ≤ V6.5)
      // Purple (V6.5) → Growth (exactly at threshold)
      expect(result.comfort_pct).toBeGreaterThan(50);
    });

    it('should work with numeric grades', () => {
      const mappings = [
        createMapping('1', 'V0', 'V0'),
        createMapping('2', 'V1', 'V2'),
        createMapping('3', 'V3', 'V4'),
        createMapping('4', 'V5', 'V6'),
        createMapping('5', 'V7', 'V8'),
      ];
      
      const logs = [
        { grade_raw: '1', count: 5 },
        { grade_raw: '2', count: 10 },
        { grade_raw: '3', count: 8 },
        { grade_raw: '4', count: 6 },
        { grade_raw: '5', count: 2 },
      ];
      
      // User level = V5 (grade "4")
      const result = computeSessionZones(logs, mappings, 'test-user', 5);
      
      // Should have reasonable distribution
      expect(result.comfort_pct).toBeGreaterThan(0);
      expect(result.growth_pct).toBeGreaterThan(0);
    });
  });
});

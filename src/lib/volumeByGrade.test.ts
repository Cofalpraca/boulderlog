import { describe, it, expect } from 'vitest';
import { aggregateVolumeByGrade } from './volumeByGrade';
import type { Database } from '@/integrations/supabase/types';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];

// Helper to create mock grade mappings
const createMockMapping = (
  label: string,
  orderIndex: number,
  gymId: string = 'gym-1',
  colorHex: string = '#FACC15'
): GradeMapping => ({
  id: `mapping-${gymId}-${label}`,
  gym_id: gymId,
  label,
  order_index: orderIndex,
  color_hex: colorHex,
  approx_v_min: null,
  approx_v_max: null,
  approx_font_min: null,
  approx_font_max: null,
  created_at: new Date().toISOString(),
});

describe('aggregateVolumeByGrade', () => {
  describe('basic aggregation', () => {
    it('returns empty array for empty logs', () => {
      const mappings = [createMockMapping('Yellow', 0)];
      const result = aggregateVolumeByGrade([], mappings);
      expect(result).toEqual([]);
    });

    it('returns empty array for empty mappings', () => {
      const logs = [{ grade_raw: 'Yellow', count: 5 }];
      const result = aggregateVolumeByGrade(logs, []);
      expect(result).toEqual([]);
    });

    it('aggregates single grade correctly', () => {
      const logs = [{ grade_raw: 'Yellow', count: 5 }];
      const mappings = [createMockMapping('Yellow', 0, 'gym-1', '#FACC15')];
      
      const result = aggregateVolumeByGrade(logs, mappings);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        grade: 'Yellow',
        count: 5,
        color: '#FACC15',
      });
    });
  });

  describe('CRITICAL: duplicate prevention', () => {
    it('produces exactly ONE bar for Yellow with total sum when multiple logs have same grade', () => {
      // This is the regression test for the duplicate grade label bug
      const logs = [
        { grade_raw: 'Yellow', count: 2 },
        { grade_raw: 'Yellow', count: 1 },
        { grade_raw: 'Yellow', count: 3 },
      ];
      const mappings = [createMockMapping('Yellow', 0, 'gym-1', '#FACC15')];
      
      const result = aggregateVolumeByGrade(logs, mappings);
      
      // MUST have exactly ONE entry for Yellow
      expect(result).toHaveLength(1);
      expect(result[0].grade).toBe('Yellow');
      // Total count must be 2 + 1 + 3 = 6
      expect(result[0].count).toBe(6);
    });

    it('produces unique labels when multiple gyms have same grade name', () => {
      // This tests the "all gyms" scenario where gym-1 and gym-2 both have "Yellow"
      const logs = [
        { grade_raw: 'Yellow', count: 3 },
        { grade_raw: 'Yellow', count: 4 },
      ];
      
      // Two different gyms with the same grade label
      const mappings = [
        createMockMapping('Yellow', 0, 'gym-1', '#FACC15'),
        createMockMapping('Yellow', 0, 'gym-2', '#FFD700'), // Different gym, same label
      ];
      
      const result = aggregateVolumeByGrade(logs, mappings);
      
      // MUST have exactly ONE Yellow entry (not duplicated)
      const yellowEntries = result.filter(r => r.grade === 'Yellow');
      expect(yellowEntries).toHaveLength(1);
      // Total count should be 3 + 4 = 7
      expect(yellowEntries[0].count).toBe(7);
    });

    it('handles mixed grades from multiple gyms correctly', () => {
      const logs = [
        { grade_raw: 'Yellow', count: 2 },
        { grade_raw: 'Green', count: 3 },
        { grade_raw: 'Yellow', count: 1 },
        { grade_raw: 'Blue', count: 5 },
      ];
      
      const mappings = [
        createMockMapping('Yellow', 0, 'gym-1', '#FACC15'),
        createMockMapping('Green', 1, 'gym-1', '#22C55E'),
        createMockMapping('Blue', 2, 'gym-1', '#3B82F6'),
        createMockMapping('Yellow', 0, 'gym-2', '#FFD700'), // Duplicate label from gym-2
        createMockMapping('Green', 1, 'gym-2', '#10B981'),  // Duplicate label from gym-2
      ];
      
      const result = aggregateVolumeByGrade(logs, mappings);
      
      // Should have exactly 3 unique grades
      expect(result).toHaveLength(3);
      
      // Verify each grade appears exactly once with correct sum
      const yellowEntry = result.find(r => r.grade === 'Yellow');
      const greenEntry = result.find(r => r.grade === 'Green');
      const blueEntry = result.find(r => r.grade === 'Blue');
      
      expect(yellowEntry?.count).toBe(3); // 2 + 1
      expect(greenEntry?.count).toBe(3);
      expect(blueEntry?.count).toBe(5);
    });
  });

  describe('ordering', () => {
    it('orders results by order_index', () => {
      const logs = [
        { grade_raw: 'Blue', count: 1 },
        { grade_raw: 'Yellow', count: 2 },
        { grade_raw: 'Green', count: 3 },
      ];
      
      const mappings = [
        createMockMapping('Yellow', 0, 'gym-1'),
        createMockMapping('Green', 1, 'gym-1'),
        createMockMapping('Blue', 2, 'gym-1'),
      ];
      
      const result = aggregateVolumeByGrade(logs, mappings);
      
      expect(result.map(r => r.grade)).toEqual(['Yellow', 'Green', 'Blue']);
    });
  });

  describe('filtering', () => {
    it('excludes grades with zero count', () => {
      const logs = [
        { grade_raw: 'Yellow', count: 5 },
        { grade_raw: 'Green', count: 0 },
      ];
      
      const mappings = [
        createMockMapping('Yellow', 0),
        createMockMapping('Green', 1),
      ];
      
      const result = aggregateVolumeByGrade(logs, mappings);
      
      expect(result).toHaveLength(1);
      expect(result[0].grade).toBe('Yellow');
    });

    it('excludes grades not in mappings', () => {
      const logs = [
        { grade_raw: 'Yellow', count: 5 },
        { grade_raw: 'Unknown', count: 10 },
      ];
      
      const mappings = [createMockMapping('Yellow', 0)];
      
      const result = aggregateVolumeByGrade(logs, mappings);
      
      expect(result).toHaveLength(1);
      expect(result[0].grade).toBe('Yellow');
    });
  });
});

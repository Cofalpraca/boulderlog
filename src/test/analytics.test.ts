import { describe, it, expect } from 'vitest';
import { getMaxGrade, getVScaleIndex, getFontIndex } from '@/lib/analytics';
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

describe('getMaxGrade', () => {
  describe('Font grade ordering with + variants', () => {
    it('should correctly identify 6c+ > 6c', () => {
      const mappings: GradeMapping[] = [
        createMapping('6c', 'V6', 'V6', '6c', '6c'),
        createMapping('6c+', 'V6', 'V7', '6c+', '6c+'),
      ];
      
      const logs = [
        { grade_raw: '6c', count: 1 },
        { grade_raw: '6c+', count: 1 },
      ];
      
      expect(getMaxGrade(logs, mappings)).toBe('6c+');
    });
    
    it('should correctly identify 7a > 6c+', () => {
      const mappings: GradeMapping[] = [
        createMapping('6c+', 'V6', 'V7', '6c+', '6c+'),
        createMapping('7a', 'V7', 'V7', '7a', '7a'),
      ];
      
      const logs = [
        { grade_raw: '6c+', count: 1 },
        { grade_raw: '7a', count: 1 },
      ];
      
      expect(getMaxGrade(logs, mappings)).toBe('7a');
    });
    
    it('should correctly handle 6a+ > 6a', () => {
      const mappings: GradeMapping[] = [
        createMapping('6a', 'V3', 'V3', '6a', '6a'),
        createMapping('6a+', 'V4', 'V4', '6a+', '6a+'),
      ];
      
      const logs = [
        { grade_raw: '6a', count: 5 },
        { grade_raw: '6a+', count: 1 },
      ];
      
      expect(getMaxGrade(logs, mappings)).toBe('6a+');
    });
  });
  
  describe('V-Scale ordering', () => {
    it('should correctly identify V7 > V6', () => {
      const mappings: GradeMapping[] = [
        createMapping('V6', 'V6', 'V6'),
        createMapping('V7', 'V7', 'V7'),
      ];
      
      const logs = [
        { grade_raw: 'V6', count: 3 },
        { grade_raw: 'V7', count: 1 },
      ];
      
      expect(getMaxGrade(logs, mappings)).toBe('V7');
    });
    
    it('should correctly handle full V-scale range', () => {
      const mappings: GradeMapping[] = [
        createMapping('V0', 'V0', 'V0'),
        createMapping('V5', 'V5', 'V5'),
        createMapping('V10', 'V10', 'V10'),
      ];
      
      const logs = [
        { grade_raw: 'V0', count: 10 },
        { grade_raw: 'V5', count: 5 },
        { grade_raw: 'V10', count: 1 },
      ];
      
      expect(getMaxGrade(logs, mappings)).toBe('V10');
    });
  });
  
  describe('Color/Numeric grading', () => {
    it('should correctly identify max using V-scale normalization', () => {
      const mappings: GradeMapping[] = [
        createMapping('Yellow', 'V0', 'V1'),
        createMapping('Green', 'V2', 'V3'),
        createMapping('Blue', 'V4', 'V5'),
        createMapping('Red', 'V6', 'V7'),
      ];
      
      const logs = [
        { grade_raw: 'Yellow', count: 5 },
        { grade_raw: 'Green', count: 3 },
        { grade_raw: 'Blue', count: 2 },
      ];
      
      expect(getMaxGrade(logs, mappings)).toBe('Blue');
    });
    
    it('should use Font fallback when V-scale not available', () => {
      const mappings: GradeMapping[] = [
        createMapping('Easy', '', '', '5', '5+'),
        createMapping('Medium', '', '', '6a', '6b'),
        createMapping('Hard', '', '', '7a', '7a+'),
      ].map(m => ({ ...m, approx_v_min: null, approx_v_max: null }));
      
      const logs = [
        { grade_raw: 'Easy', count: 5 },
        { grade_raw: 'Medium', count: 3 },
        { grade_raw: 'Hard', count: 1 },
      ];
      
      expect(getMaxGrade(logs, mappings)).toBe('Hard');
    });
  });
  
  describe('Edge cases', () => {
    it('should return null for empty logs', () => {
      const mappings: GradeMapping[] = [createMapping('6a', 'V3', 'V3')];
      expect(getMaxGrade([], mappings)).toBeNull();
    });
    
    it('should return null for empty mappings', () => {
      const logs = [{ grade_raw: '6a', count: 1 }];
      expect(getMaxGrade(logs, [])).toBeNull();
    });
    
    it('should skip logs with count 0', () => {
      const mappings: GradeMapping[] = [
        createMapping('6a', 'V3', 'V3'),
        createMapping('7a', 'V7', 'V7'),
      ];
      
      const logs = [
        { grade_raw: '6a', count: 1 },
        { grade_raw: '7a', count: 0 },
      ];
      
      expect(getMaxGrade(logs, mappings)).toBe('6a');
    });
    
    it('should skip logs with unmapped grades', () => {
      const mappings: GradeMapping[] = [
        createMapping('6a', 'V3', 'V3'),
      ];
      
      const logs = [
        { grade_raw: '6a', count: 1 },
        { grade_raw: 'Unknown', count: 5 },
      ];
      
      expect(getMaxGrade(logs, mappings)).toBe('6a');
    });
  });
});

describe('Grade ordering functions', () => {
  describe('getVScaleIndex', () => {
    it('should return correct index for V-scale grades', () => {
      expect(getVScaleIndex('V0')).toBe(0);
      expect(getVScaleIndex('V5')).toBe(5);
      expect(getVScaleIndex('V10')).toBe(10);
      expect(getVScaleIndex('V17')).toBe(17);
    });
    
    it('should return -1 for invalid grades', () => {
      expect(getVScaleIndex(null)).toBe(-1);
      expect(getVScaleIndex('invalid')).toBe(-1);
    });
  });
  
  describe('getFontIndex', () => {
    it('should return correct order for Font grades with + variants', () => {
      const idx6c = getFontIndex('6c');
      const idx6cPlus = getFontIndex('6c+');
      const idx7a = getFontIndex('7a');
      
      // 6c+ should be between 6c and 7a
      expect(idx6cPlus).toBeGreaterThan(idx6c);
      expect(idx7a).toBeGreaterThan(idx6cPlus);
    });
    
    it('should return -1 for invalid grades', () => {
      expect(getFontIndex(null)).toBe(-1);
      expect(getFontIndex('invalid')).toBe(-1);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { analyzeGymMappingHealth, getMappingHealthSummary, type MappingHealthResult, type UnmappableGrade } from '@/lib/mappingHealth';

describe('Mapping Health Computation', () => {
  const mockGymId = 'gym-123';
  const mockGymName = 'Test Gym';

  describe('analyzeGymMappingHealth', () => {
    it('should return 100% normalizable when all grades have valid mappings', () => {
      const boulderLogs = [
        { grade_raw: 'Yellow', count: 5 },
        { grade_raw: 'Blue', count: 3 },
      ];
      const mappings = [
        { 
          id: '1', gym_id: mockGymId, label: 'Yellow', color_hex: '#FFFF00',
          approx_v_min: 'V0', approx_v_max: 'V2', approx_font_min: '4', approx_font_max: '5',
          order_index: 0, created_at: new Date().toISOString()
        },
        { 
          id: '2', gym_id: mockGymId, label: 'Blue', color_hex: '#0000FF',
          approx_v_min: 'V3', approx_v_max: 'V5', approx_font_min: '5+', approx_font_max: '6b',
          order_index: 1, created_at: new Date().toISOString()
        },
      ];

      const result = analyzeGymMappingHealth(mockGymId, mockGymName, boulderLogs, mappings);

      expect(result.normalizablePercent).toBe(100);
      expect(result.unmappableCount).toBe(0);
      expect(result.unmappableGrades).toHaveLength(0);
      expect(result.hasIssues).toBe(false);
    });

    it('should identify unmapped grades as missing_mapping', () => {
      const boulderLogs = [
        { grade_raw: 'Yellow', count: 5 },
        { grade_raw: 'Purple', count: 3 }, // Not mapped
      ];
      const mappings = [
        { 
          id: '1', gym_id: mockGymId, label: 'Yellow', color_hex: '#FFFF00',
          approx_v_min: 'V0', approx_v_max: 'V2', approx_font_min: '4', approx_font_max: '5',
          order_index: 0, created_at: new Date().toISOString()
        },
      ];

      const result = analyzeGymMappingHealth(mockGymId, mockGymName, boulderLogs, mappings);

      expect(result.normalizablePercent).toBe(63); // 5 out of 8
      expect(result.unmappableCount).toBe(3);
      expect(result.unmappableGrades).toHaveLength(1);
      expect(result.unmappableGrades[0].grade).toBe('Purple');
      expect(result.unmappableGrades[0].reason).toBe('missing_mapping');
      expect(result.hasIssues).toBe(true);
    });

    it('should handle empty boulder logs', () => {
      const boulderLogs: { grade_raw: string; count: number }[] = [];
      const mappings: any[] = [];

      const result = analyzeGymMappingHealth(mockGymId, mockGymName, boulderLogs, mappings);

      expect(result.totalLogs).toBe(0);
      expect(result.normalizablePercent).toBe(100); // No issues when no data
      expect(result.hasIssues).toBe(false);
    });

    it('should recognize standard Font grades without gym mapping', () => {
      const boulderLogs = [
        { grade_raw: '6a', count: 5 }, // Valid Font grade
        { grade_raw: '7b+', count: 3 }, // Valid Font grade
      ];
      const mappings: any[] = []; // No gym-specific mappings

      const result = analyzeGymMappingHealth(mockGymId, mockGymName, boulderLogs, mappings);

      expect(result.normalizablePercent).toBe(100);
      expect(result.hasIssues).toBe(false);
    });

    it('should recognize V-scale grades without gym mapping', () => {
      const boulderLogs = [
        { grade_raw: 'V4', count: 5 },
        { grade_raw: 'V7', count: 3 },
      ];
      const mappings: any[] = [];

      const result = analyzeGymMappingHealth(mockGymId, mockGymName, boulderLogs, mappings);

      expect(result.normalizablePercent).toBe(100);
      expect(result.hasIssues).toBe(false);
    });

    it('should sort unmappable grades by count descending', () => {
      const boulderLogs = [
        { grade_raw: 'A', count: 2 },
        { grade_raw: 'B', count: 10 },
        { grade_raw: 'C', count: 5 },
      ];
      const mappings: any[] = [];

      const result = analyzeGymMappingHealth(mockGymId, mockGymName, boulderLogs, mappings);

      expect(result.unmappableGrades[0].grade).toBe('B');
      expect(result.unmappableGrades[1].grade).toBe('C');
      expect(result.unmappableGrades[2].grade).toBe('A');
    });
  });

  describe('getMappingHealthSummary', () => {
    it('should aggregate results from multiple gyms', () => {
      const results: MappingHealthResult[] = [
        {
          gymId: 'gym-1',
          gymName: 'Gym 1',
          totalLogs: 10,
          normalizableCount: 8,
          unmappableCount: 2,
          normalizablePercent: 80,
          unmappableGrades: [{ grade: 'X', count: 2, reason: 'missing_mapping' as const }],
          hasIssues: true,
        },
        {
          gymId: 'gym-2',
          gymName: 'Gym 2',
          totalLogs: 10,
          normalizableCount: 10,
          unmappableCount: 0,
          normalizablePercent: 100,
          unmappableGrades: [],
          hasIssues: false,
        },
      ];

      const summary = getMappingHealthSummary(results);

      expect(summary.totalGyms).toBe(2);
      expect(summary.gymsWithIssues).toBe(1);
      expect(summary.overallNormalizablePercent).toBe(90); // 18 out of 20
      expect(summary.topUnmappableGrades).toHaveLength(1);
    });

    it('should return 100% when no results provided', () => {
      const summary = getMappingHealthSummary([]);

      expect(summary.totalGyms).toBe(0);
      expect(summary.gymsWithIssues).toBe(0);
      expect(summary.overallNormalizablePercent).toBe(100);
    });

    it('should combine unmappable grades across gyms', () => {
      const results: MappingHealthResult[] = [
        {
          gymId: 'gym-1',
          gymName: 'Gym 1',
          totalLogs: 10,
          normalizableCount: 5,
          unmappableCount: 5,
          normalizablePercent: 50,
          unmappableGrades: [
            { grade: 'X', count: 3, reason: 'missing_mapping' as const },
            { grade: 'Y', count: 2, reason: 'missing_mapping' as const },
          ],
          hasIssues: true,
        },
        {
          gymId: 'gym-2',
          gymName: 'Gym 2',
          totalLogs: 10,
          normalizableCount: 6,
          unmappableCount: 4,
          normalizablePercent: 60,
          unmappableGrades: [
            { grade: 'X', count: 4, reason: 'missing_mapping' as const }, // Same grade as gym-1
          ],
          hasIssues: true,
        },
      ];

      const summary = getMappingHealthSummary(results);

      // X should be combined: 3 + 4 = 7
      const gradeX = summary.topUnmappableGrades.find(g => g.grade === 'X');
      expect(gradeX?.count).toBe(7);
    });
  });
});

describe('Mapping Health Error Handling', () => {
  it('should handle empty array responses gracefully', () => {
    // This simulates what happens when Supabase returns []
    const result = analyzeGymMappingHealth('gym-1', 'Empty Gym', [], []);
    
    expect(result.totalLogs).toBe(0);
    expect(result.normalizablePercent).toBe(100);
    expect(result.hasIssues).toBe(false);
  });
});

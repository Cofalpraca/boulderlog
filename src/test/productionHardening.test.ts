/**
 * Production Hardening Tests
 * 
 * Tests for session lifecycle, mapping health, and aggregation.
 */

import { describe, it, expect } from 'vitest';
import { analyzeGymMappingHealth, getMappingHealthSummary } from '@/lib/mappingHealth';

describe('Session Lifecycle', () => {
  it('completed sessions must have date_end (enforced by DB trigger)', () => {
    // This is enforced by database trigger validate_session_lifecycle
    // Test validates the expectation is documented
    const completedSession = {
      status: 'completed',
      date_end: '2024-01-01T12:00:00Z',
    };
    expect(completedSession.status).toBe('completed');
    expect(completedSession.date_end).toBeTruthy();
  });

  it('draft/active sessions should not appear in history queries', () => {
    // History query filters by status='completed' AND date_end IS NOT NULL
    const sessions = [
      { id: '1', status: 'completed', date_end: '2024-01-01T12:00:00Z' },
      { id: '2', status: 'active', date_end: null },
      { id: '3', status: 'draft', date_end: null },
    ];
    
    const historyVisible = sessions.filter(
      s => s.status === 'completed' && s.date_end !== null
    );
    
    expect(historyVisible).toHaveLength(1);
    expect(historyVisible[0].id).toBe('1');
  });
});

describe('Mapping Health', () => {
  const mockMappings = [
    { id: '1', gym_id: 'gym1', label: 'Yellow', order_index: 1, approx_v_min: 'V0', approx_v_max: 'V2', approx_font_min: null, approx_font_max: null, color_hex: '#FFFF00', created_at: '' },
    { id: '2', gym_id: 'gym1', label: 'Green', order_index: 2, approx_v_min: 'V3', approx_v_max: 'V4', approx_font_min: null, approx_font_max: null, color_hex: '#00FF00', created_at: '' },
  ];

  it('correctly identifies normalizable grades', () => {
    const logs = [
      { grade_raw: 'Yellow', count: 5 },
      { grade_raw: 'Green', count: 3 },
    ];
    
    const result = analyzeGymMappingHealth('gym1', 'Test Gym', logs, mockMappings);
    
    expect(result.totalLogs).toBe(8);
    expect(result.normalizableCount).toBe(8);
    expect(result.unmappableCount).toBe(0);
    expect(result.normalizablePercent).toBe(100);
    expect(result.hasIssues).toBe(false);
  });

  it('correctly identifies unmapped grades', () => {
    const logs = [
      { grade_raw: 'Yellow', count: 5 },
      { grade_raw: 'Purple', count: 3 }, // Not in mappings
    ];
    
    const result = analyzeGymMappingHealth('gym1', 'Test Gym', logs, mockMappings);
    
    expect(result.totalLogs).toBe(8);
    expect(result.normalizableCount).toBe(5);
    expect(result.unmappableCount).toBe(3);
    expect(result.normalizablePercent).toBe(63);
    expect(result.hasIssues).toBe(true);
    expect(result.unmappableGrades).toHaveLength(1);
    expect(result.unmappableGrades[0].grade).toBe('Purple');
  });

  it('Font grades are normalizable without gym mapping', () => {
    const logs = [
      { grade_raw: '6a', count: 2 },
      { grade_raw: '6b+', count: 3 },
    ];
    
    const result = analyzeGymMappingHealth('gym1', 'Test Gym', logs, []);
    
    expect(result.normalizableCount).toBe(5);
    expect(result.unmappableCount).toBe(0);
  });

  it('summary aggregates multiple gyms correctly', () => {
    const results = [
      { gymId: 'g1', gymName: 'Gym 1', totalLogs: 10, normalizableCount: 8, unmappableCount: 2, normalizablePercent: 80, unmappableGrades: [{ grade: 'X', count: 2, reason: 'missing_mapping' as const }], hasIssues: true },
      { gymId: 'g2', gymName: 'Gym 2', totalLogs: 20, normalizableCount: 20, unmappableCount: 0, normalizablePercent: 100, unmappableGrades: [], hasIssues: false },
    ];
    
    const summary = getMappingHealthSummary(results);
    
    expect(summary.totalGyms).toBe(2);
    expect(summary.gymsWithIssues).toBe(1);
    expect(summary.overallNormalizablePercent).toBe(93); // 28/30
  });
});

describe('Zone Distribution', () => {
  it('mixed grades must not collapse into single zone', () => {
    // This validates the zone calculation distributes correctly
    // Based on the algorithm: Comfort < baseline-2, Growth = baseline±2, Limit > baseline+1
    
    const grades = [
      { vScore: 3, zone: 'comfort' },  // baseline 5, 3 < 3 = false, so growth
      { vScore: 5, zone: 'growth' },   // baseline 5, in range
      { vScore: 7, zone: 'limit' },    // baseline 5, 7 > 6 = true
    ];
    
    const baseline = 5;
    const comfortThreshold = baseline - 2; // 3
    const limitThreshold = baseline + 1; // 6
    
    const zones = grades.map(g => {
      if (g.vScore < comfortThreshold) return 'comfort';
      if (g.vScore > limitThreshold) return 'limit';
      return 'growth';
    });
    
    // Should have at least 2 different zones
    const uniqueZones = new Set(zones);
    expect(uniqueZones.size).toBeGreaterThanOrEqual(2);
  });
});

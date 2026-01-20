/**
 * Mapping Health Analysis
 * 
 * Analyzes grade mappings to determine normalization success rates
 * and provides actionable feedback for fixing issues.
 */

import type { Database } from '@/integrations/supabase/types';
import { mappingToVScore, DEFAULT_FONT_TO_V, getVScaleIndex } from './userLevel';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];
type BoulderLog = { grade_raw: string; count: number };

export interface MappingHealthResult {
  gymId: string;
  gymName: string;
  totalLogs: number;
  normalizableCount: number;
  unmappableCount: number;
  normalizablePercent: number;
  unmappableGrades: UnmappableGrade[];
  hasIssues: boolean;
}

export interface UnmappableGrade {
  grade: string;
  count: number;
  reason: 'missing_mapping' | 'missing_approx_values' | 'invalid_approx_values';
}

/**
 * Analyze mapping health for a single gym
 */
export function analyzeGymMappingHealth(
  gymId: string,
  gymName: string,
  boulderLogs: BoulderLog[],
  gradeMappings: GradeMapping[]
): MappingHealthResult {
  const gradeCountMap = new Map<string, number>();
  let totalLogs = 0;
  
  // Aggregate logs by grade
  for (const log of boulderLogs) {
    const current = gradeCountMap.get(log.grade_raw) || 0;
    gradeCountMap.set(log.grade_raw, current + log.count);
    totalLogs += log.count;
  }
  
  let normalizableCount = 0;
  const unmappableGrades: UnmappableGrade[] = [];
  
  for (const [grade, count] of gradeCountMap) {
    // Check if grade can be normalized
    const mapping = gradeMappings.find(m => m.label === grade);
    
    if (mapping) {
      // Has mapping, check if it has valid approx values
      const vScore = mappingToVScore(mapping);
      if (vScore >= 0) {
        normalizableCount += count;
      } else {
        unmappableGrades.push({
          grade,
          count,
          reason: 'missing_approx_values',
        });
      }
    } else {
      // No gym mapping, check if it's a valid Font or V-scale grade
      const fontScore = DEFAULT_FONT_TO_V[grade] ?? DEFAULT_FONT_TO_V[grade.toLowerCase()];
      const vScore = getVScaleIndex(grade);
      
      if (fontScore !== undefined || vScore >= 0) {
        normalizableCount += count;
      } else {
        unmappableGrades.push({
          grade,
          count,
          reason: 'missing_mapping',
        });
      }
    }
  }
  
  // Sort unmappable grades by count (descending)
  unmappableGrades.sort((a, b) => b.count - a.count);
  
  const unmappableCount = totalLogs - normalizableCount;
  const normalizablePercent = totalLogs > 0 
    ? Math.round((normalizableCount / totalLogs) * 100) 
    : 100;
  
  return {
    gymId,
    gymName,
    totalLogs,
    normalizableCount,
    unmappableCount,
    normalizablePercent,
    unmappableGrades,
    hasIssues: unmappableCount > 0,
  };
}

/**
 * Get aggregated mapping health summary
 */
export function getMappingHealthSummary(results: MappingHealthResult[]): {
  totalGyms: number;
  gymsWithIssues: number;
  overallNormalizablePercent: number;
  topUnmappableGrades: UnmappableGrade[];
} {
  const totalLogs = results.reduce((sum, r) => sum + r.totalLogs, 0);
  const totalNormalizable = results.reduce((sum, r) => sum + r.normalizableCount, 0);
  
  // Aggregate all unmappable grades
  const allUnmappable = new Map<string, UnmappableGrade>();
  for (const result of results) {
    for (const grade of result.unmappableGrades) {
      const existing = allUnmappable.get(grade.grade);
      if (existing) {
        existing.count += grade.count;
      } else {
        allUnmappable.set(grade.grade, { ...grade });
      }
    }
  }
  
  const topUnmappableGrades = Array.from(allUnmappable.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalGyms: results.length,
    gymsWithIssues: results.filter(r => r.hasIssues).length,
    overallNormalizablePercent: totalLogs > 0 
      ? Math.round((totalNormalizable / totalLogs) * 100) 
      : 100,
    topUnmappableGrades,
  };
}

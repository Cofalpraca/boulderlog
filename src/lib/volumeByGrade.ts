/**
 * Volume by Grade aggregation utilities
 * 
 * This module provides functions to aggregate boulder logs by grade for chart display.
 * The key invariant: output contains UNIQUE grade labels with summed counts.
 */

import type { Database } from '@/integrations/supabase/types';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];
type BoulderLog = { grade_raw: string; count: number };

export interface VolumeByGradeItem {
  grade: string;
  count: number;
  color: string;
}

/**
 * Aggregates boulder logs into volume-by-grade chart data.
 * 
 * Algorithm:
 * 1. AGGREGATE FIRST: Sum all boulder log counts by grade_raw (the stable key)
 * 2. JOIN SECOND: Look up display properties (color) from grade mappings
 * 3. DEDUPLICATE: Output unique grade labels with summed counts
 * 
 * This prevents duplication issues when:
 * - Multiple gyms have the same grade label (e.g., "Yellow")
 * - The join would otherwise multiply rows
 * 
 * @param boulderLogs - Array of boulder logs from sessions
 * @param gradeMappings - Array of grade mappings for color lookup
 * @returns Array of unique grade items with summed counts, ordered by mapping order
 */
export function aggregateVolumeByGrade(
  boulderLogs: BoulderLog[],
  gradeMappings: GradeMapping[]
): VolumeByGradeItem[] {
  if (!boulderLogs.length || !gradeMappings.length) {
    return [];
  }

  // Step 1: AGGREGATE FIRST - Sum counts by grade_raw
  const gradeCountMap = new Map<string, number>();
  boulderLogs.forEach(log => {
    const currentCount = gradeCountMap.get(log.grade_raw) || 0;
    gradeCountMap.set(log.grade_raw, currentCount + log.count);
  });

  // Step 2: Build unique grade labels with their display properties
  // Use a Map to ensure each label appears exactly once
  const uniqueGradeMap = new Map<string, { color: string; orderIndex: number }>();
  
  gradeMappings.forEach(mapping => {
    // Only add if we have logs for this grade AND it's not already added
    if (gradeCountMap.has(mapping.label) && !uniqueGradeMap.has(mapping.label)) {
      uniqueGradeMap.set(mapping.label, {
        color: mapping.color_hex || 'hsl(var(--primary))',
        orderIndex: mapping.order_index,
      });
    }
  });

  // Step 3: Build output array with unique grades
  const result: VolumeByGradeItem[] = [];
  uniqueGradeMap.forEach((props, label) => {
    const count = gradeCountMap.get(label) || 0;
    if (count > 0) {
      result.push({
        grade: label,
        count,
        color: props.color,
      });
    }
  });

  // Sort by order_index for consistent display
  result.sort((a, b) => {
    const aOrder = uniqueGradeMap.get(a.grade)?.orderIndex ?? 999;
    const bOrder = uniqueGradeMap.get(b.grade)?.orderIndex ?? 999;
    return aOrder - bOrder;
  });

  return result;
}

/**
 * Boulder History Import Parser
 * Parses human-friendly free-text format for quick manual entry after climbing
 * 
 * Format: DD.MM.YYYY, 2x6a, 3x6b, 1x6c+
 * or:     YYYY-MM-DD, 5x6a, 2x6b+
 */

export interface ParsedGradeEntry {
  count: number;
  grade_raw: string;
}

export interface ParsedSession {
  date: Date;
  grades: ParsedGradeEntry[];
  lineNumber: number;
  rawLine: string;
}

export interface ParseError {
  lineNumber: number;
  rawLine: string;
  error: string;
  errorKey: string; // i18n key
}

export interface ImportParseResult {
  sessions: ParsedSession[];
  errors: ParseError[];
  warnings: { lineNumber: number; message: string; messageKey: string }[];
}

/**
 * Parse a date string in either DD.MM.YYYY or YYYY-MM-DD format
 */
export function parseDate(dateStr: string): Date | null {
  const trimmed = dateStr.trim();
  
  // Try DD.MM.YYYY format
  const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const day = parseInt(dotMatch[1], 10);
    const month = parseInt(dotMatch[2], 10) - 1; // JS months are 0-indexed
    const year = parseInt(dotMatch[3], 10);
    const date = new Date(year, month, day, 12, 0, 0); // noon to avoid timezone issues
    
    // Validate the date is real
    if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
      return date;
    }
    return null;
  }
  
  // Try YYYY-MM-DD format
  const dashMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dashMatch) {
    const year = parseInt(dashMatch[1], 10);
    const month = parseInt(dashMatch[2], 10) - 1;
    const day = parseInt(dashMatch[3], 10);
    const date = new Date(year, month, day, 12, 0, 0);
    
    if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
      return date;
    }
    return null;
  }
  
  return null;
}

/**
 * Parse a grade token like "2x6a" or "3x7a+" or "4xBlue" or "5x3"
 */
export function parseGradeToken(token: string): ParsedGradeEntry | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  
  // Match pattern: {count}x{grade_raw}
  // count: 1 or more digits
  // x: literal 'x' or 'X'
  // grade_raw: any non-empty string (letters, numbers, +, -)
  const match = trimmed.match(/^(\d+)[xX](.+)$/);
  if (!match) return null;
  
  const count = parseInt(match[1], 10);
  const grade_raw = match[2].trim();
  
  if (count <= 0 || count > 100) return null; // Sanity check
  if (!grade_raw || grade_raw.length > 50) return null;
  
  return { count, grade_raw };
}

/**
 * Parse a single line of import text
 */
export function parseLine(line: string, lineNumber: number): ParsedSession | ParseError {
  const trimmed = line.trim();
  
  // Skip empty lines
  if (!trimmed) {
    return {
      lineNumber,
      rawLine: line,
      error: 'Empty line',
      errorKey: 'import.errors.emptyLine',
    };
  }
  
  // Split by comma and/or whitespace (flexible)
  // First try comma separation
  const parts = trimmed.split(/[,\s]+/).filter(p => p.length > 0);
  
  if (parts.length < 2) {
    return {
      lineNumber,
      rawLine: line,
      error: 'Line must contain date and at least one grade entry',
      errorKey: 'import.errors.insufficientData',
    };
  }
  
  // First part should be the date
  const date = parseDate(parts[0]);
  if (!date) {
    return {
      lineNumber,
      rawLine: line,
      error: `Invalid date format: ${parts[0]}. Use DD.MM.YYYY or YYYY-MM-DD`,
      errorKey: 'import.errors.invalidDate',
    };
  }
  
  // Remaining parts should be grade entries
  const grades: ParsedGradeEntry[] = [];
  const invalidTokens: string[] = [];
  
  for (let i = 1; i < parts.length; i++) {
    const entry = parseGradeToken(parts[i]);
    if (entry) {
      grades.push(entry);
    } else {
      invalidTokens.push(parts[i]);
    }
  }
  
  if (grades.length === 0) {
    return {
      lineNumber,
      rawLine: line,
      error: `No valid grade entries found. Invalid tokens: ${invalidTokens.join(', ')}`,
      errorKey: 'import.errors.noValidGrades',
    };
  }
  
  // If some tokens were invalid but we have valid ones, we'll proceed with a warning
  // The caller can handle this
  
  return {
    date,
    grades,
    lineNumber,
    rawLine: line,
  };
}

/**
 * Parse the entire import text
 */
export function parseImportText(text: string): ImportParseResult {
  const lines = text.split('\n');
  const sessions: ParsedSession[] = [];
  const errors: ParseError[] = [];
  const warnings: { lineNumber: number; message: string; messageKey: string }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Skip completely empty lines silently
    if (!line.trim()) continue;
    
    const result = parseLine(line, lineNumber);
    
    if ('error' in result) {
      errors.push(result);
    } else {
      sessions.push(result);
    }
  }
  
  return { sessions, errors, warnings };
}

/**
 * Check which grades in parsed sessions are unmapped for a given gym
 */
export function findUnmappedGrades(
  sessions: ParsedSession[],
  availableGrades: string[]
): { grade: string; count: number; sessions: number[] }[] {
  const gradeSet = new Set(availableGrades.map(g => g.toLowerCase()));
  const unmapped: Record<string, { count: number; sessions: Set<number> }> = {};
  
  for (const session of sessions) {
    for (const entry of session.grades) {
      const lower = entry.grade_raw.toLowerCase();
      if (!gradeSet.has(lower) && !gradeSet.has(entry.grade_raw)) {
        if (!unmapped[entry.grade_raw]) {
          unmapped[entry.grade_raw] = { count: 0, sessions: new Set() };
        }
        unmapped[entry.grade_raw].count += entry.count;
        unmapped[entry.grade_raw].sessions.add(session.lineNumber);
      }
    }
  }
  
  return Object.entries(unmapped)
    .map(([grade, data]) => ({
      grade,
      count: data.count,
      sessions: Array.from(data.sessions),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate import summary statistics
 */
export function calculateImportSummary(sessions: ParsedSession[]) {
  let totalBoulders = 0;
  const gradeBreakdown: Record<string, number> = {};
  
  for (const session of sessions) {
    for (const entry of session.grades) {
      totalBoulders += entry.count;
      gradeBreakdown[entry.grade_raw] = (gradeBreakdown[entry.grade_raw] || 0) + entry.count;
    }
  }
  
  return {
    sessionCount: sessions.length,
    totalBoulders,
    gradeBreakdown,
    dateRange: sessions.length > 0 ? {
      earliest: new Date(Math.min(...sessions.map(s => s.date.getTime()))),
      latest: new Date(Math.max(...sessions.map(s => s.date.getTime()))),
    } : null,
  };
}

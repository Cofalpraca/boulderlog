import { describe, it, expect } from 'vitest';
import { 
  parseDate, 
  parseGradeToken, 
  parseLine, 
  parseImportText,
  findUnmappedGrades,
  calculateImportSummary 
} from './importParser';

describe('parseDate', () => {
  it('should parse DD.MM.YYYY format', () => {
    const date = parseDate('10.01.2025');
    expect(date).not.toBeNull();
    expect(date?.getDate()).toBe(10);
    expect(date?.getMonth()).toBe(0); // January
    expect(date?.getFullYear()).toBe(2025);
  });

  it('should parse YYYY-MM-DD format', () => {
    const date = parseDate('2025-01-10');
    expect(date).not.toBeNull();
    expect(date?.getDate()).toBe(10);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getFullYear()).toBe(2025);
  });

  it('should handle single-digit day/month', () => {
    const date = parseDate('5.1.2025');
    expect(date).not.toBeNull();
    expect(date?.getDate()).toBe(5);
    expect(date?.getMonth()).toBe(0);
  });

  it('should reject invalid dates', () => {
    expect(parseDate('32.01.2025')).toBeNull(); // Invalid day
    expect(parseDate('10.13.2025')).toBeNull(); // Invalid month
    expect(parseDate('invalid')).toBeNull();
    expect(parseDate('10/01/2025')).toBeNull(); // Wrong separator
    expect(parseDate('')).toBeNull();
  });
});

describe('parseGradeToken', () => {
  it('should parse standard grade tokens', () => {
    expect(parseGradeToken('2x6a')).toEqual({ count: 2, grade_raw: '6a' });
    expect(parseGradeToken('3x7a+')).toEqual({ count: 3, grade_raw: '7a+' });
    expect(parseGradeToken('1x6c+')).toEqual({ count: 1, grade_raw: '6c+' });
  });

  it('should parse color grades', () => {
    expect(parseGradeToken('4xBlue')).toEqual({ count: 4, grade_raw: 'Blue' });
    expect(parseGradeToken('5xGreen')).toEqual({ count: 5, grade_raw: 'Green' });
  });

  it('should parse numeric grades', () => {
    expect(parseGradeToken('5x3')).toEqual({ count: 5, grade_raw: '3' });
    expect(parseGradeToken('2x9')).toEqual({ count: 2, grade_raw: '9' });
  });

  it('should handle uppercase X', () => {
    expect(parseGradeToken('2X6a')).toEqual({ count: 2, grade_raw: '6a' });
  });

  it('should reject invalid tokens', () => {
    expect(parseGradeToken('')).toBeNull();
    expect(parseGradeToken('6a')).toBeNull(); // Missing count
    expect(parseGradeToken('x6a')).toBeNull(); // Missing count
    expect(parseGradeToken('2x')).toBeNull(); // Missing grade
    expect(parseGradeToken('abc')).toBeNull();
  });
});

describe('parseLine', () => {
  it('should parse a valid line', () => {
    const result = parseLine('10.01.2025, 2x6a, 3x6b, 1x6c+', 1);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.date.getDate()).toBe(10);
      expect(result.grades).toHaveLength(3);
      expect(result.grades[0]).toEqual({ count: 2, grade_raw: '6a' });
      expect(result.grades[1]).toEqual({ count: 3, grade_raw: '6b' });
      expect(result.grades[2]).toEqual({ count: 1, grade_raw: '6c+' });
    }
  });

  it('should parse with space-only separation', () => {
    const result = parseLine('10.01.2025 2x6a 3x6b', 1);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.grades).toHaveLength(2);
    }
  });

  it('should parse YYYY-MM-DD format', () => {
    const result = parseLine('2025-01-12, 5x6a, 2x6b+', 1);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.date.getMonth()).toBe(0);
      expect(result.date.getDate()).toBe(12);
    }
  });

  it('should return error for invalid date', () => {
    const result = parseLine('invalid, 2x6a', 1);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.errorKey).toBe('import.errors.invalidDate');
    }
  });

  it('should return error for no grades', () => {
    const result = parseLine('10.01.2025', 1);
    expect('error' in result).toBe(true);
  });

  it('should return error for empty line', () => {
    const result = parseLine('', 1);
    expect('error' in result).toBe(true);
  });

  it('should skip invalid tokens but keep valid ones', () => {
    const result = parseLine('10.01.2025, 2x6a, invalid, 3x6b', 1);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.grades).toHaveLength(2);
    }
  });
});

describe('parseImportText', () => {
  it('should parse multiple lines', () => {
    const text = `10.01.2025, 2x6a, 3x6b, 1x6c+
12.01.2025, 5x6a, 2x6b+`;
    
    const result = parseImportText(text);
    expect(result.sessions).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it('should skip empty lines silently', () => {
    const text = `10.01.2025, 2x6a

12.01.2025, 5x6a`;
    
    const result = parseImportText(text);
    expect(result.sessions).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it('should collect errors for invalid lines', () => {
    const text = `10.01.2025, 2x6a
invalid line
12.01.2025, 5x6a`;
    
    const result = parseImportText(text);
    expect(result.sessions).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].lineNumber).toBe(2);
  });

  it('should handle lines with only date', () => {
    const text = `10.01.2025
12.01.2025, 5x6a`;
    
    const result = parseImportText(text);
    expect(result.sessions).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });
});

describe('findUnmappedGrades', () => {
  it('should find grades not in available list', () => {
    const sessions = [
      { date: new Date(), grades: [{ count: 2, grade_raw: '6a' }, { count: 1, grade_raw: '7b' }], lineNumber: 1, rawLine: '' },
      { date: new Date(), grades: [{ count: 3, grade_raw: '6a' }], lineNumber: 2, rawLine: '' },
    ];
    
    const result = findUnmappedGrades(sessions, ['6a', '6b', '6c']);
    expect(result).toHaveLength(1);
    expect(result[0].grade).toBe('7b');
    expect(result[0].count).toBe(1);
    expect(result[0].sessions).toContain(1);
  });

  it('should return empty for all mapped grades', () => {
    const sessions = [
      { date: new Date(), grades: [{ count: 2, grade_raw: '6a' }], lineNumber: 1, rawLine: '' },
    ];
    
    const result = findUnmappedGrades(sessions, ['6a', '6b']);
    expect(result).toHaveLength(0);
  });

  it('should be case-insensitive for matching', () => {
    const sessions = [
      { date: new Date(), grades: [{ count: 2, grade_raw: 'Blue' }], lineNumber: 1, rawLine: '' },
    ];
    
    const result = findUnmappedGrades(sessions, ['blue']);
    expect(result).toHaveLength(0);
  });
});

describe('calculateImportSummary', () => {
  it('should calculate correct totals', () => {
    const sessions = [
      { date: new Date('2025-01-10'), grades: [{ count: 2, grade_raw: '6a' }, { count: 3, grade_raw: '6b' }], lineNumber: 1, rawLine: '' },
      { date: new Date('2025-01-12'), grades: [{ count: 5, grade_raw: '6a' }], lineNumber: 2, rawLine: '' },
    ];
    
    const summary = calculateImportSummary(sessions);
    expect(summary.sessionCount).toBe(2);
    expect(summary.totalBoulders).toBe(10);
    expect(summary.gradeBreakdown['6a']).toBe(7);
    expect(summary.gradeBreakdown['6b']).toBe(3);
  });

  it('should handle empty sessions', () => {
    const summary = calculateImportSummary([]);
    expect(summary.sessionCount).toBe(0);
    expect(summary.totalBoulders).toBe(0);
    expect(summary.dateRange).toBeNull();
  });
});

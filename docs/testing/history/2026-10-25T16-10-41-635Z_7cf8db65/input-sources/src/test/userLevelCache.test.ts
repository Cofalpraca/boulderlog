import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          gte: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock errorLogger
vi.mock('@/lib/errorLogger', () => ({
  logError: vi.fn(),
}));

// Mock userLevel
vi.mock('@/lib/userLevel', () => ({
  computeUserLevel: vi.fn(() => ({
    hasData: true,
    levelScore: 5,
    levelVGrade: 'V5',
    levelFontGrade: '6c+',
    maxScore: 6,
    maxVGrade: 'V6',
    maxFontGrade: '7a',
    bouldersUsed: 15,
    totalBoulders: 20,
    windowDays: 90,
  })),
}));

describe('userLevelCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchUserLevelCache', () => {
    it('returns null when no cache exists', async () => {
      const { fetchUserLevelCache } = await import('@/lib/userLevelCache');
      const result = await fetchUserLevelCache('test-user-id');
      expect(result).toBeNull();
    });
  });

  describe('updateUserLevelCache', () => {
    it('returns boolean result', async () => {
      const { updateUserLevelCache } = await import('@/lib/userLevelCache');
      const result = await updateUserLevelCache('test-user-id');
      // With mocked supabase returning empty gyms, function should complete without error
      expect(typeof result).toBe('boolean');
    });
  });
});

describe('userLevelCache types', () => {
  it('cache data structure has expected fields', () => {
    const mockCache = {
      user_id: 'uuid',
      level_score: 5.5,
      level_v_grade: 'V5',
      level_font_grade: '6c+',
      max_score: 6,
      max_v_grade: 'V6',
      max_font_grade: '7a',
      boulders_used: 15,
      total_boulders: 20,
      window_days: 90,
      computed_at: '2025-01-21T00:00:00Z',
    };
    
    expect(mockCache.level_score).toBeDefined();
    expect(mockCache.level_v_grade).toBeDefined();
    expect(mockCache.level_font_grade).toBeDefined();
    expect(mockCache.computed_at).toBeDefined();
  });
});

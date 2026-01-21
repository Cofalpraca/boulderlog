import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, HelpCircle, AlertTriangle, Loader2, Settings } from 'lucide-react';
import { computeUserLevel, DEFAULT_WINDOW_DAYS, MIN_BOULDERS_FOR_LEVEL, TOP_BOULDERS_COUNT, type GradeScale } from '@/lib/userLevel';
import { fetchUserLevelCache, updateUserLevelCache } from '@/lib/userLevelCache';

interface UserLevelCardProps {
  userId: string;
}

export function UserLevelCard({ userId }: UserLevelCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // First, try to fetch from cache for instant display
  const { data: cachedLevel, isLoading: cacheLoading } = useQuery({
    queryKey: ['user_level_cache', userId],
    queryFn: () => fetchUserLevelCache(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all ON-WALL sessions from the window (90 days) - only if cache is stale or missing
  const cutoffDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - DEFAULT_WINDOW_DAYS);
    return d.toISOString();
  }, []);

  // Check if cache is fresh (less than 24 hours old)
  const cacheIsFresh = useMemo(() => {
    if (!cachedLevel?.computed_at) return false;
    const cacheAge = Date.now() - new Date(cachedLevel.computed_at).getTime();
    return cacheAge < 24 * 60 * 60 * 1000; // 24 hours
  }, [cachedLevel?.computed_at]);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['user_level_sessions', userId, cutoffDate],
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('id, date_start, session_type, boulder_logs(grade_raw, count)')
        .eq('user_id', userId)
        .eq('session_type', 'on_wall')
        .gte('date_start', cutoffDate)
        .order('date_start', { ascending: false });
      return data || [];
    },
    enabled: !!userId && !cacheIsFresh, // Skip if cache is fresh
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all gyms and their grade mappings
  const { data: gymsData, isLoading: gymsLoading } = useQuery({
    queryKey: ['user_level_gyms', userId],
    queryFn: async () => {
      const { data: gyms } = await supabase
        .from('gyms')
        .select('id, grading_type')
        .eq('user_id', userId);
      
      if (!gyms?.length) return { gyms: [], mappings: [], primaryGym: null };
      
      const { data: mappings } = await supabase
        .from('gym_grade_mappings')
        .select('*')
        .in('gym_id', gyms.map(g => g.id));
      
      const primaryGym = gyms[0];
      
      return { 
        gyms, 
        mappings: mappings || [], 
        primaryGym,
        primaryMappings: mappings?.filter(m => m.gym_id === primaryGym?.id) || []
      };
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });

  const preferredScale: GradeScale = useMemo(() => {
    if (!gymsData?.primaryGym) return 'v_scale';
    return gymsData.primaryGym.grading_type as GradeScale;
  }, [gymsData?.primaryGym]);

  // Use cached result if fresh, otherwise compute fresh
  const levelResult = useMemo(() => {
    // If cache is fresh, use cached values
    if (cacheIsFresh && cachedLevel) {
      return {
        hasData: cachedLevel.level_score !== null,
        levelScore: cachedLevel.level_score,
        levelVGrade: cachedLevel.level_v_grade,
        levelFontGrade: cachedLevel.level_font_grade,
        maxScore: cachedLevel.max_score,
        maxVGrade: cachedLevel.max_v_grade,
        maxFontGrade: cachedLevel.max_font_grade,
        bouldersUsed: cachedLevel.boulders_used,
        totalBoulders: cachedLevel.total_boulders,
        windowDays: cachedLevel.window_days,
        noDataReason: cachedLevel.level_score === null ? 'insufficient_mapped' : undefined,
        rawLogsFound: cachedLevel.total_boulders,
      };
    }

    // Fallback to fresh computation
    if (!sessions || !gymsData?.mappings) {
      return null;
    }

    const sessionData = sessions.map(s => ({
      id: s.id,
      date_start: s.date_start,
      session_type: s.session_type as 'on_wall' | 'off_wall',
      boulder_logs: s.boulder_logs || [],
    }));

    const result = computeUserLevel(
      sessionData,
      gymsData.mappings,
      preferredScale,
      gymsData.primaryMappings
    );

    // Update cache in background if we computed fresh
    if (result.hasData) {
      updateUserLevelCache(userId).catch(() => {});
    }

    return result;
  }, [cacheIsFresh, cachedLevel, sessions, gymsData?.mappings, gymsData?.primaryMappings, preferredScale, userId]);

  const isLoading = cacheLoading || (!cacheIsFresh && (sessionsLoading || gymsLoading));
  const hasMappings = (gymsData?.mappings?.length || 0) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="glass hover:border-primary/50 transition-all cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('dashboard.userLevel.title')}
              </span>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !hasMappings ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{t('dashboard.userLevel.setupMappings')}</span>
              </div>
            ) : !levelResult?.hasData ? (
              <div className="text-center py-2">
                <p className="text-lg font-medium text-muted-foreground">
                  {t('dashboard.userLevel.noData')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {levelResult?.noDataReason === 'insufficient_mapped' ? (
                    t('dashboard.userLevel.insufficientMapped', { 
                      mapped: levelResult.totalBoulders,
                      total: levelResult.rawLogsFound || 0,
                      min: MIN_BOULDERS_FOR_LEVEL 
                    })
                  ) : levelResult?.noDataReason === 'no_sessions' ? (
                    t('dashboard.userLevel.noSessions')
                  ) : levelResult?.noDataReason === 'no_logs' ? (
                    t('dashboard.userLevel.noLogs')
                  ) : (
                    t('dashboard.userLevel.addBoulders', { count: MIN_BOULDERS_FOR_LEVEL })
                  )}
                </p>
              </div>
            ) : (
              <div className="text-center py-2">
                {/* Dual format display: V-Scale and Font */}
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {levelResult.levelVGrade}
                    </p>
                    <p className="text-xs text-muted-foreground">V-Scale</p>
                  </div>
                  <span className="text-muted-foreground text-xl">/</span>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {levelResult.levelFontGrade}
                    </p>
                    <p className="text-xs text-muted-foreground">Font</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('dashboard.userLevel.basedOnBest', { 
                    top: levelResult.bouldersUsed, 
                    days: levelResult.windowDays,
                    min: MIN_BOULDERS_FOR_LEVEL
                  })}
                </p>
                {levelResult.maxVGrade && levelResult.maxVGrade !== levelResult.levelVGrade && (
                  <p className="text-xs text-accent mt-2">
                    {t('dashboard.userLevel.max')}: {levelResult.maxVGrade} / {levelResult.maxFontGrade}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dashboard.userLevel.explanation.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>{t('dashboard.userLevel.explanation.intro')}</p>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="font-medium text-foreground mb-1">
                {t('dashboard.userLevel.title')} ({levelResult?.levelVGrade || '--'} / {levelResult?.levelFontGrade || '--'})
              </p>
              <p>{t('dashboard.userLevel.explanation.algorithm', { 
                top: TOP_BOULDERS_COUNT, 
                days: DEFAULT_WINDOW_DAYS,
                min: MIN_BOULDERS_FOR_LEVEL
              })}</p>
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="font-medium text-foreground mb-1">
                {t('dashboard.userLevel.max')} ({levelResult?.maxVGrade || '--'} / {levelResult?.maxFontGrade || '--'})
              </p>
              <p>{t('dashboard.userLevel.explanation.max')}</p>
            </div>
          </div>

          <p>{t('dashboard.userLevel.explanation.normalization')}</p>
          
          <p className="text-xs italic">{t('dashboard.userLevel.explanation.dualFormat')}</p>
          
          {levelResult?.hasData && (
            <p className="text-xs border-t pt-3 border-border">
              {t('dashboard.userLevel.explanation.samples', { 
                used: levelResult.bouldersUsed,
                total: levelResult.totalBoulders
              })}
            </p>
          )}
          
          {!hasMappings && (
            <div className="border-t pt-3 border-border">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/mapping-health');
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('dashboard.userLevel.configureMappings')}
              </Button>
            </div>
          )}
          
          {hasMappings && levelResult?.noDataReason === 'insufficient_mapped' && (
            <div className="border-t pt-3 border-border">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/mapping-health');
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('mappingHealth.title')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

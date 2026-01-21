import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, AlertTriangle, CheckCircle2, Loader2, 
  MapPin, Wrench, TrendingUp, AlertCircle, RefreshCw, Plus, Play
} from 'lucide-react';
import { subDays } from 'date-fns';
import { analyzeGymMappingHealth, getMappingHealthSummary, type MappingHealthResult } from '@/lib/mappingHealth';
import type { Database } from '@/integrations/supabase/types';

type Gym = Database['public']['Tables']['gyms']['Row'];
type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];

export default function MappingHealth() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // IMPORTANT: this must be stable across renders (do NOT use new Date() inline)
  // otherwise React Query queryKey changes every render -> infinite loading.
  const cutoffDate = useMemo(() => subDays(new Date(), 90).toISOString(), []);

  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  
  // Fetch gyms
  const { 
    data: gyms, 
    isLoading: gymsLoading, 
    error: gymsError,
    refetch: refetchGyms
  } = useQuery({
    queryKey: ['mapping_health_gyms', user?.id],
    queryFn: async () => {
      console.debug('[MappingHealth] Fetching gyms for user:', user?.id);
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('user_id', user!.id);
      
      if (error) {
        console.error('[MappingHealth] Gyms query error:', error);
        throw error;
      }
      console.debug('[MappingHealth] Gyms fetched:', data?.length ?? 0);
      return data || [];
    },
    enabled: !!user,
  });
  
  // Fetch grade mappings for all gyms - runs even if no gyms (returns empty)
  const { 
    data: allMappings, 
    isLoading: mappingsLoading,
    error: mappingsError,
    refetch: refetchMappings
  } = useQuery({
    queryKey: ['mapping_health_mappings', user?.id, gyms?.map(g => g.id)],
    queryFn: async () => {
      if (!gyms?.length) {
        console.debug('[MappingHealth] No gyms, skipping mappings fetch');
        return [];
      }
      console.debug('[MappingHealth] Fetching mappings for gyms:', gyms.length);
      const { data, error } = await supabase
        .from('gym_grade_mappings')
        .select('*')
        .in('gym_id', gyms.map(g => g.id));
      
      if (error) {
        console.error('[MappingHealth] Mappings query error:', error);
        throw error;
      }
      console.debug('[MappingHealth] Mappings fetched:', data?.length ?? 0);
      return data || [];
    },
    enabled: !!user && gyms !== undefined, // Run once gyms query completes (even if empty)
  });
  
  // Fetch recent boulder logs (last 90 days)
  const { 
    data: recentSessions, 
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions
  } = useQuery({
    queryKey: ['mapping_health_sessions', user?.id, cutoffDate],
    queryFn: async () => {
      console.debug('[MappingHealth] Fetching sessions since:', cutoffDate);
      const { data, error } = await supabase
        .from('sessions')
        .select('id, session_gyms(gym_id), boulder_logs(grade_raw, count)')
        .eq('user_id', user!.id)
        .eq('session_type', 'on_wall')
        .gte('date_start', cutoffDate);
      
      if (error) {
        console.error('[MappingHealth] Sessions query error:', error);
        throw error;
      }
      console.debug('[MappingHealth] Sessions fetched:', data?.length ?? 0, 'with boulder_logs');
      return data || [];
    },
    enabled: !!user,
  });
  
  // Compute health results - split into gyms with data and without
  const healthResults: MappingHealthResult[] = [];
  const gymsWithoutData: Gym[] = [];
  
  // Only compute when all data is available (not loading, no errors)
  const dataReady = gyms !== undefined && allMappings !== undefined && recentSessions !== undefined;
  
  if (dataReady && gyms && allMappings && recentSessions) {
    console.debug('[MappingHealth] Computing health for', gyms.length, 'gyms');
    for (const gym of gyms) {
      // Get sessions for this gym
      const gymSessions = recentSessions.filter(s => 
        s.session_gyms?.some((sg: { gym_id: string }) => sg.gym_id === gym.id)
      );
      
      // Flatten boulder logs
      const boulderLogs = gymSessions.flatMap(s => 
        (s.boulder_logs || []).map((l: { grade_raw: string; count: number }) => ({
          grade_raw: l.grade_raw,
          count: l.count,
        }))
      );
      
      if (boulderLogs.length > 0) {
        const gymMappings = allMappings.filter(m => m.gym_id === gym.id);
        healthResults.push(
          analyzeGymMappingHealth(gym.id, gym.name, boulderLogs, gymMappings)
        );
      } else {
        // Track gyms without recent data
        gymsWithoutData.push(gym);
      }
    }
  }
  
  const totalGyms = gyms?.length ?? 0;
  const gymsWithData = healthResults.length;
  
  const summary = getMappingHealthSummary(healthResults);
  const isLoading = gymsLoading || mappingsLoading || sessionsLoading;
  const hasError = gymsError || mappingsError || sessionsError;

  useEffect(() => {
    // Hard guarantee: never hang indefinitely on a spinner.
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }

    setLoadingTimedOut(false);
    const timeout = window.setTimeout(() => {
      console.error('[MappingHealth] Loading timed out (>15s). Showing retry UI.');
      setLoadingTimedOut(true);
    }, 15000);

    return () => window.clearTimeout(timeout);
  }, [isLoading]);
  
  const handleRetry = () => {
    refetchGyms();
    refetchMappings();
    refetchSessions();
  };

  // Determine empty state type
  const getEmptyStateType = (): 'no-gyms' | 'no-sessions' | 'no-data' | null => {
    if (!dataReady) return null;
    if (!gyms?.length) return 'no-gyms';
    if (!recentSessions?.length) return 'no-sessions';
    if (healthResults.length === 0) return 'no-data';
    return null;
  };

  const emptyStateType = !isLoading && !hasError ? getEmptyStateType() : null;
  
  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold">{t('mappingHealth.title', 'Mapping Health')}</h1>
          </div>
        </div>
      </header>
      
      <main className="container px-4 py-4 space-y-4">
         {/* Error State (query error OR timeout) */}
         {(hasError || loadingTimedOut) && (
          <Card className="glass text-center py-8">
            <CardContent>
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-muted-foreground mb-2">
                {t('common.errorLoadingData', 'Error loading data')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                 {loadingTimedOut
                   ? t('mappingHealth.loadingTimeout', 'This is taking longer than expected. Please retry.')
                   : t('mappingHealth.errorMessage', 'Could not fetch mapping health data. Please try again.')}
              </p>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('common.retry', 'Retry')}
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Loading State - with timeout protection via query config */}
         {isLoading && !hasError && !loadingTimedOut && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t('common.loading', 'Loading...')}
            </p>
          </div>
        )}
        
        {/* Empty State: No Gyms */}
        {emptyStateType === 'no-gyms' && (
          <Card className="glass text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {t('mappingHealth.noGyms', 'No gyms configured yet')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('mappingHealth.addGymFirst', 'Add a gym to start tracking your climbing sessions.')}
              </p>
              <Link to="/gyms">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('gyms.addGym', 'Add Gym')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        {/* Empty State: No Sessions */}
        {emptyStateType === 'no-sessions' && (
          <Card className="glass text-center py-12">
            <CardContent>
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {t('mappingHealth.noData', 'No climbing data in the last 90 days')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('mappingHealth.startSession', 'Start a bouldering session to see mapping health.')}
              </p>
              <Link to="/session/new?type=on_wall">
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  {t('mappingHealth.startSessionBtn', 'Start Session')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        {/* Empty State: No Data (has gyms & sessions but no boulder logs in those sessions) */}
        {emptyStateType === 'no-data' && (
          <Card className="glass text-center py-12">
            <CardContent>
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {t('mappingHealth.noBouldersLogged', 'No boulders logged in recent sessions')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('mappingHealth.logBoulders', 'Log some boulders during your sessions to see mapping health.')}
              </p>
              <Link to="/session/new?type=on_wall">
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  {t('mappingHealth.startSessionBtn', 'Start Session')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        {/* Main Content: Health Results */}
        {!isLoading && !hasError && (healthResults.length > 0 || gymsWithoutData.length > 0) && (
          <>
            {/* Summary Header */}
            {totalGyms > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('mappingHealth.summaryHeader', 'Analyzing {{active}} of {{total}} gyms with recent data', {
                  active: gymsWithData,
                  total: totalGyms,
                })}
              </p>
            )}
            
            {/* Summary Card - only show if there's data to analyze */}
            {healthResults.length > 0 && (
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {summary.overallNormalizablePercent >= 90 ? (
                      <CheckCircle2 className="h-5 w-5 text-zone-comfort" />
                    ) : summary.overallNormalizablePercent >= 70 ? (
                      <AlertCircle className="h-5 w-5 text-zone-growth" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    {t('mappingHealth.overallHealth', 'Overall Health')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Progress value={summary.overallNormalizablePercent} className="flex-1" />
                    <span className="text-sm font-medium w-12 text-right">
                      {summary.overallNormalizablePercent}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {summary.gymsWithIssues === 0 
                      ? t('mappingHealth.allGood', 'All grades are normalizable. Analytics will be accurate.')
                      : t('mappingHealth.issuesFound', '{{count}} gym(s) have mapping issues that may affect analytics.', { count: summary.gymsWithIssues })
                    }
                  </p>
                  
                  {summary.topUnmappableGrades.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        {t('mappingHealth.topUnmapped', 'Top unmapped grades:')}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {summary.topUnmappableGrades.slice(0, 3).map(g => (
                          <Badge key={g.grade} variant="secondary" className="text-xs">
                            {g.grade} ({g.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Per-Gym Cards with data */}
            {healthResults.length > 0 && (
              <div className="space-y-3">
                {healthResults.map(result => (
                  <Card key={result.gymId} className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate">{result.gymName}</span>
                            {result.hasIssues ? (
                              <Badge variant="destructive" className="text-xs shrink-0">
                                {t('mappingHealth.issues', 'Issues')}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs shrink-0 bg-zone-comfort/20 text-zone-comfort">
                                {t('mappingHealth.healthy', 'Healthy')}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Progress value={result.normalizablePercent} className="flex-1 h-2" />
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {result.normalizablePercent}%
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            {t('mappingHealth.stats', '{{total}} boulders: {{good}} normalizable, {{bad}} unmapped', {
                              total: result.totalLogs,
                              good: result.normalizableCount,
                              bad: result.unmappableCount,
                            })}
                          </p>
                          
                          {result.unmappableGrades.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">
                                {t('mappingHealth.unmappedGrades', 'Unmapped:')}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {result.unmappableGrades.slice(0, 4).map(g => (
                                  <Badge key={g.grade} variant="outline" className="text-xs">
                                    {g.grade}
                                  </Badge>
                                ))}
                                {result.unmappableGrades.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{result.unmappableGrades.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Link to={`/gyms/${result.gymId}/mappings`}>
                          <Button variant="outline" size="sm" className="shrink-0">
                            <Wrench className="h-4 w-4 mr-1" />
                            {t('mappingHealth.fix', 'Fix')}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Gyms without recent data section */}
            {gymsWithoutData.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('mappingHealth.gymsWithoutData', 'Gyms without recent data')}
                </h3>
                {gymsWithoutData.map(gym => (
                  <Card key={gym.id} className="glass border-dashed opacity-70">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">{gym.name}</span>
                          {gym.city && (
                            <span className="text-xs text-muted-foreground truncate">
                              · {gym.city}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {t('mappingHealth.noRecentDataDesc', 'No climbing data in last 90 days')}
                          </span>
                          <Link to={`/session/new?type=on_wall&gym=${gym.id}`}>
                            <Button variant="ghost" size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              {t('mappingHealth.startSessionAtGym', 'Start Session')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

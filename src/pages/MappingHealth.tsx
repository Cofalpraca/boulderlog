import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, AlertTriangle, CheckCircle2, Loader2, 
  MapPin, Wrench, TrendingUp, AlertCircle
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
  
  const cutoffDate = subDays(new Date(), 90).toISOString();
  
  // Fetch gyms
  const { data: gyms, isLoading: gymsLoading } = useQuery({
    queryKey: ['mapping_health_gyms', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('gyms')
        .select('*')
        .eq('user_id', user!.id);
      return data || [];
    },
    enabled: !!user,
  });
  
  // Fetch grade mappings for all gyms
  const { data: allMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['mapping_health_mappings', user?.id, gyms?.map(g => g.id)],
    queryFn: async () => {
      if (!gyms?.length) return [];
      const { data } = await supabase
        .from('gym_grade_mappings')
        .select('*')
        .in('gym_id', gyms.map(g => g.id));
      return data || [];
    },
    enabled: !!gyms?.length,
  });
  
  // Fetch recent boulder logs (last 90 days)
  const { data: recentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['mapping_health_sessions', user?.id, cutoffDate],
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('id, session_gyms(gym_id), boulder_logs(grade_raw, count)')
        .eq('user_id', user!.id)
        .eq('session_type', 'on_wall')
        .gte('date_start', cutoffDate);
      return data || [];
    },
    enabled: !!user,
  });
  
  // Compute health results
  const healthResults: MappingHealthResult[] = [];
  
  if (gyms && allMappings && recentSessions) {
    for (const gym of gyms) {
      // Get sessions for this gym
      const gymSessions = recentSessions.filter(s => 
        s.session_gyms?.some(sg => sg.gym_id === gym.id)
      );
      
      // Flatten boulder logs
      const boulderLogs = gymSessions.flatMap(s => 
        (s.boulder_logs || []).map(l => ({
          grade_raw: l.grade_raw,
          count: l.count,
        }))
      );
      
      if (boulderLogs.length > 0) {
        const gymMappings = allMappings.filter(m => m.gym_id === gym.id);
        healthResults.push(
          analyzeGymMappingHealth(gym.id, gym.name, boulderLogs, gymMappings)
        );
      }
    }
  }
  
  const summary = getMappingHealthSummary(healthResults);
  const isLoading = gymsLoading || mappingsLoading || sessionsLoading;
  
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
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : healthResults.length === 0 ? (
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
                  {t('mappingHealth.startSessionBtn', 'Start Session')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Card */}
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
            
            {/* Per-Gym Cards */}
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
          </>
        )}
      </main>
    </div>
  );
}

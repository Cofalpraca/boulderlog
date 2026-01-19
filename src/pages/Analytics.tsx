import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ChevronLeft, BarChart3, TrendingUp, Mountain, Target, Loader2, 
  Calendar, Activity, Dumbbell, RefreshCw, ArrowUpDown, Scale, Info, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { format, subDays, startOfWeek } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { getMappingDifficulty, getMaxGrade, computeGymDifficultyProfile, computeSessionZones } from '@/lib/analytics';
import { aggregateVolumeByGrade } from '@/lib/volumeByGrade';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];

const ZONE_COLORS = {
  comfort: 'hsl(142, 76%, 46%)',
  growth: 'hsl(47, 95%, 53%)',
  limit: 'hsl(0, 84%, 60%)',
};

export default function Analytics() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGymId, setSelectedGymId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<'both' | 'on_wall' | 'off_wall'>('both');
  const [activeTab, setActiveTab] = useState<'overview' | 'gyms' | 'correlation'>('overview');
  
  // Locale for date formatting
  const dateLocale = i18n.language === 'pl' ? pl : enUS;

  // Fetch gyms
  const { data: gyms } = useQuery({
    queryKey: ['gyms', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('gyms').select('*').eq('user_id', user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch all grade mappings
  const { data: allGradeMappings } = useQuery({
    queryKey: ['all_gym_grade_mappings', user?.id],
    queryFn: async () => {
      const gymIds = gyms?.map(g => g.id) || [];
      if (gymIds.length === 0) return [];
      const { data } = await supabase.from('gym_grade_mappings').select('*').in('gym_id', gymIds).order('order_index');
      return data || [];
    },
    enabled: !!gyms?.length,
  });

  // Fetch ON-WALL sessions
  const { data: onWallSessions, isLoading: onWallLoading } = useQuery({
    queryKey: ['sessions_on_wall', user?.id, timeRange],
    queryFn: async () => {
      let dateFilter = new Date(0);
      if (timeRange === '7d') dateFilter = subDays(new Date(), 7);
      else if (timeRange === '30d') dateFilter = subDays(new Date(), 30);
      else if (timeRange === '90d') dateFilter = subDays(new Date(), 90);

      const { data } = await supabase
        .from('sessions')
        .select('*, session_gyms(gym_id), boulder_logs(*), session_zone_summaries(*)')
        .eq('user_id', user!.id)
        .eq('session_type', 'on_wall')
        .gte('date_start', dateFilter.toISOString())
        .order('date_start', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch OFF-WALL sessions
  const { data: offWallSessions, isLoading: offWallLoading } = useQuery({
    queryKey: ['sessions_off_wall', user?.id, timeRange],
    queryFn: async () => {
      let dateFilter = new Date(0);
      if (timeRange === '7d') dateFilter = subDays(new Date(), 7);
      else if (timeRange === '30d') dateFilter = subDays(new Date(), 30);
      else if (timeRange === '90d') dateFilter = subDays(new Date(), 90);

      const { data } = await supabase
        .from('sessions')
        .select('*, session_items(*, session_sets(*))')
        .eq('user_id', user!.id)
        .eq('session_type', 'off_wall')
        .gte('date_start', dateFilter.toISOString())
        .order('date_start', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Compute gym difficulty profiles dynamically from filtered sessions
  // This ensures ALL gyms with at least 1 boulder in the time range are shown
  const computedDifficultyProfiles = (() => {
    if (!onWallSessions?.length || !allGradeMappings?.length || !gyms?.length) return [];

    // Step 1: Group sessions by gym and aggregate difficulty data
    const gymData = new Map<string, { totalDifficulty: number; sampleCount: number; gymName: string }>();

    for (const session of onWallSessions) {
      // Get gym for this session
      const gymId = session.session_gyms?.[0]?.gym_id;
      if (!gymId || !session.date_end) continue; // Skip sessions without gym or not ended

      const gym = gyms.find(g => g.id === gymId);
      if (!gym) continue;

      // Get mappings for this gym
      const mappings = allGradeMappings.filter(m => m.gym_id === gymId);
      if (!mappings.length) continue;

      // Create mapping difficulty lookup
      const mappingDifficulty = new Map<string, number>();
      mappings.forEach(m => {
        mappingDifficulty.set(m.label, getMappingDifficulty(m));
      });

      // Aggregate boulder logs for this session
      for (const log of session.boulder_logs || []) {
        const difficulty = mappingDifficulty.get(log.grade_raw);
        if (difficulty !== undefined && log.count > 0) {
          const existing = gymData.get(gymId) || { totalDifficulty: 0, sampleCount: 0, gymName: gym.name };
          existing.totalDifficulty += difficulty * log.count;
          existing.sampleCount += log.count;
          gymData.set(gymId, existing);
        }
      }
    }

    if (gymData.size === 0) return [];

    // Step 2: Calculate user's baseline (average difficulty across all gyms)
    let totalAllDifficulty = 0;
    let totalAllSamples = 0;
    gymData.forEach(data => {
      totalAllDifficulty += data.totalDifficulty;
      totalAllSamples += data.sampleCount;
    });
    const userBaseline = totalAllSamples > 0 ? totalAllDifficulty / totalAllSamples : 0;

    // Step 3: Calculate difficulty bias for each gym
    const profiles: Array<{
      id: string;
      gym_id: string;
      difficulty_bias: number;
      samples_count: number;
      gyms: { name: string } | null;
    }> = [];

    gymData.forEach((data, gymId) => {
      const avgDifficulty = data.sampleCount > 0 ? data.totalDifficulty / data.sampleCount : 0;
      const bias = Number((userBaseline - avgDifficulty).toFixed(2));

      profiles.push({
        id: gymId,
        gym_id: gymId,
        difficulty_bias: bias,
        samples_count: data.sampleCount,
        gyms: { name: data.gymName },
      });
    });

    // Sort by sample count (descending) for better visibility
    return profiles.sort((a, b) => (b.samples_count || 0) - (a.samples_count || 0));
  })();

  // Recompute zone summaries
  const recomputeZoneSummaries = useMutation({
    mutationFn: async () => {
      if (!user || !onWallSessions?.length || !allGradeMappings?.length) return;
      let updated = 0;
      for (const session of onWallSessions) {
        const gymId = session.session_gyms?.[0]?.gym_id;
        if (!gymId || !session.date_end) continue;
        const mappings = allGradeMappings.filter(m => m.gym_id === gymId);
        if (!mappings.length) continue;
        const logs = (session.boulder_logs || []).map(l => ({ grade_raw: l.grade_raw, count: l.count }));
        if (!logs.length) continue;
        const zones = computeSessionZones(logs, mappings, user.id);
        await supabase.from('session_zone_summaries').upsert({ session_id: session.id, comfort_pct: zones.comfort_pct, growth_pct: zones.growth_pct, limit_pct: zones.limit_pct }, { onConflict: 'session_id' });
        updated++;
      }
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['sessions_on_wall'] });
      toast({ title: t('common.success'), description: `Recomputed zones for ${updated || 0} sessions` });
    },
  });

  // Filter sessions by selected gym (only ON-WALL)
  const filteredOnWallSessions = selectedGymId === 'all' 
    ? onWallSessions 
    : onWallSessions?.filter(s => s.session_gyms?.some(sg => sg.gym_id === selectedGymId));

  const gradeMappings = selectedGymId === 'all' ? allGradeMappings : allGradeMappings?.filter(m => m.gym_id === selectedGymId);

  // Stats
  const totalOnWallSessions = filteredOnWallSessions?.length || 0;
  const totalOffWallSessions = offWallSessions?.length || 0;
  const totalBoulders = filteredOnWallSessions?.reduce((sum, s) => sum + (s.boulder_logs?.reduce((bSum, log) => bSum + log.count, 0) || 0), 0) || 0;

  // Aggregate zone data
  const aggregateZones = filteredOnWallSessions?.reduce((acc, s) => {
    const zone = s.session_zone_summaries;
    if (zone && typeof zone === 'object' && !Array.isArray(zone)) {
      const sessionBoulders = s.boulder_logs?.reduce((sum, l) => sum + l.count, 0) || 1;
      acc.comfort += ((zone as any).comfort_pct || 0) * sessionBoulders / 100;
      acc.growth += ((zone as any).growth_pct || 0) * sessionBoulders / 100;
      acc.limit += ((zone as any).limit_pct || 0) * sessionBoulders / 100;
      acc.total += sessionBoulders;
    } else if (Array.isArray(zone) && zone[0]) {
      const z = zone[0];
      const sessionBoulders = s.boulder_logs?.reduce((sum, l) => sum + l.count, 0) || 1;
      acc.comfort += (z.comfort_pct || 0) * sessionBoulders / 100;
      acc.growth += (z.growth_pct || 0) * sessionBoulders / 100;
      acc.limit += (z.limit_pct || 0) * sessionBoulders / 100;
      acc.total += sessionBoulders;
    }
    return acc;
  }, { comfort: 0, growth: 0, limit: 0, total: 0 });

  const zoneData = aggregateZones && aggregateZones.total > 0 ? [
    { name: t('analytics.comfort'), value: Math.round(aggregateZones.comfort), color: ZONE_COLORS.comfort },
    { name: t('analytics.growth'), value: Math.round(aggregateZones.growth), color: ZONE_COLORS.growth },
    { name: t('analytics.limit'), value: Math.round(aggregateZones.limit), color: ZONE_COLORS.limit },
  ] : [];

  // Volume by grade - use dedicated aggregation function to prevent duplicates
  // The aggregateVolumeByGrade function:
  // 1. AGGREGATES FIRST: Sums counts by grade_raw before any join
  // 2. JOINS SECOND: Maps to grade mappings for color lookup
  // 3. DEDUPLICATES: Ensures each grade label appears exactly once
  const allBoulderLogs = filteredOnWallSessions?.flatMap(s => s.boulder_logs || []) || [];
  const volumeByGrade = aggregateVolumeByGrade(
    allBoulderLogs.map(log => ({ grade_raw: log.grade_raw, count: log.count })),
    gradeMappings || []
  );

  // Weekly trend - scope aware with locale-aware dates
  const weeklyData: { week: string; boulders: number; onWall: number; offWall: number; sets: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const ws = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
    const we = new Date(ws); we.setDate(we.getDate() + 7);
    const weekOnWall = filteredOnWallSessions?.filter(s => { const d = new Date(s.date_start); return d >= ws && d < we; }) || [];
    const weekOffWall = offWallSessions?.filter(s => { const d = new Date(s.date_start); return d >= ws && d < we; }) || [];
    weeklyData.unshift({
      week: format(ws, 'd MMM', { locale: dateLocale }),
      onWall: weekOnWall.length,
      offWall: weekOffWall.length,
      boulders: weekOnWall.reduce((sum, s) => sum + (s.boulder_logs?.reduce((bSum, l) => bSum + l.count, 0) || 0), 0),
      sets: weekOffWall.reduce((sum, s) => sum + (s.session_items?.reduce((iSum, item) => iSum + (item.session_sets?.length || 0), 0) || 0), 0),
    });
  }

  const allLogs = filteredOnWallSessions?.flatMap(s => s.boulder_logs || []) || [];
  const maxGrade = gradeMappings?.length ? getMaxGrade(allLogs.map(l => ({ grade_raw: l.grade_raw, count: l.count })), gradeMappings) : null;

  const isLoading = onWallLoading || offWallLoading;

  // Show gym filter note when applicable (not on Balance tab)
  const showGymFilterNote = sessionTypeFilter !== 'off_wall' && activeTab !== 'correlation';

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ChevronLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1"><h1 className="font-bold">{t('analytics.title')}</h1></div>
          <Button variant="ghost" size="icon" onClick={() => recomputeZoneSummaries.mutate()} disabled={recomputeZoneSummaries.isPending}>
            <RefreshCw className={`h-4 w-4 ${recomputeZoneSummaries.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-4 space-y-4">
        {/* Filters - Show all filters only on Overview tab */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Select value={sessionTypeFilter} onValueChange={(v) => setSessionTypeFilter(v as typeof sessionTypeFilter)}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">{t('filters.both')}</SelectItem>
                  <SelectItem value="on_wall">{t('filters.onWallOnly')}</SelectItem>
                  <SelectItem value="off_wall">{t('filters.offWallOnly')}</SelectItem>
                </SelectContent>
              </Select>
              {sessionTypeFilter !== 'off_wall' && (
                <Select value={selectedGymId} onValueChange={setSelectedGymId}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder={t('analytics.allGyms')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('analytics.allGyms')}</SelectItem>
                    {gyms?.map(gym => <SelectItem key={gym.id} value={gym.id}>{gym.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">{t('analytics.days7')}</SelectItem>
                  <SelectItem value="30d">{t('analytics.days30')}</SelectItem>
                  <SelectItem value="90d">{t('analytics.days90')}</SelectItem>
                  <SelectItem value="all">{t('analytics.allTime')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showGymFilterNote && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />{t('analytics.gymFilterNote')}
              </p>
            )}
          </div>
        )}

        {/* Time range filter only for Gyms and Balance tabs */}
        {(activeTab === 'gyms' || activeTab === 'correlation') && (
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t('analytics.days7')}</SelectItem>
                <SelectItem value="30d">{t('analytics.days30')}</SelectItem>
                <SelectItem value="90d">{t('analytics.days90')}</SelectItem>
                <SelectItem value="all">{t('analytics.allTime')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className={`grid ${sessionTypeFilter === 'off_wall' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="overview">{t('analytics.overview')}</TabsTrigger>
            {sessionTypeFilter !== 'off_wall' && (
              <TabsTrigger value="gyms">{t('analytics.gyms')}</TabsTrigger>
            )}
            <TabsTrigger value="correlation">{t('analytics.balance')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Stats */}
            <div className={`grid gap-2 ${sessionTypeFilter === 'off_wall' ? 'grid-cols-1' : sessionTypeFilter === 'on_wall' ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {sessionTypeFilter !== 'off_wall' && (
                <Card className="glass"><CardContent className="p-3 text-center"><Mountain className="h-4 w-4 mx-auto mb-1 text-session-on-wall" /><p className="text-xl font-bold">{totalOnWallSessions}</p><p className="text-[10px] text-muted-foreground">{t('analytics.onWall')}</p></CardContent></Card>
              )}
              {sessionTypeFilter !== 'on_wall' && (
                <Card className={`glass ${sessionTypeFilter === 'off_wall' ? 'col-span-1' : ''}`}><CardContent className="p-3 text-center"><Dumbbell className="h-4 w-4 mx-auto mb-1 text-session-off-wall" /><p className="text-xl font-bold">{totalOffWallSessions}</p><p className="text-[10px] text-muted-foreground">{t('analytics.offWall')}</p></CardContent></Card>
              )}
              {sessionTypeFilter !== 'off_wall' && (
                <>
                  <Card className="glass"><CardContent className="p-3 text-center"><Activity className="h-4 w-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{totalBoulders}</p><p className="text-[10px] text-muted-foreground">{t('dashboard.boulders')}</p></CardContent></Card>
                  <Card className="glass"><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{maxGrade || '--'}</p><p className="text-[10px] text-muted-foreground">{t('analytics.max')}</p></CardContent></Card>
                </>
              )}
            </div>

            {/* Development Zones - ON-WALL only */}
            {sessionTypeFilter !== 'off_wall' && (
              <Card className="glass">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" />{t('analytics.developmentZones')}</CardTitle>
                    <Popover>
                      <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></PopoverTrigger>
                      <PopoverContent side="left" align="start" className="max-w-xs p-3">
                        <p className="font-medium mb-2">{t('analytics.zonesExplanation.title')}</p>
                        <p className="text-xs mb-2">{t('analytics.zonesExplanation.intro')}</p>
                        <ul className="text-xs space-y-1 list-disc pl-4">
                          <li><span className="text-zone-comfort font-medium">{t('analytics.comfort')}</span>: {t('analytics.zonesExplanation.comfort').replace('Comfort: ', '')}</li>
                          <li><span className="text-zone-growth font-medium">{t('analytics.growth')}</span>: {t('analytics.zonesExplanation.growth').replace('Growth: ', '')}</li>
                          <li><span className="text-zone-limit font-medium">{t('analytics.limit')}</span>: {t('analytics.zonesExplanation.limit').replace('Limit: ', '')}</li>
                        </ul>
                        <p className="text-xs mt-2 text-muted-foreground">{t('analytics.zonesExplanation.updated')}</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                <CardContent>
                  {zoneData.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <div className="w-28 h-28">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart><Pie data={zoneData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2}>{zoneData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie></PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-1">
                        {zoneData.map((zone) => (
                          <div key={zone.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                            <span className="text-sm flex-1">{zone.name}</span>
                            <span className="font-mono text-sm">{zone.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm mb-2">{t('analytics.noSessionData')}</p>
                      <p className="text-xs text-muted-foreground">{t('analytics.completeOnWallCta')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Weekly Volume - scope aware */}
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />{t('analytics.weeklyVolume')}</CardTitle></CardHeader>
              <CardContent>
                {weeklyData.some(w => w.boulders > 0 || w.sets > 0) ? (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} labelStyle={{ color: 'hsl(var(--popover-foreground))' }} itemStyle={{ color: 'hsl(var(--popover-foreground))' }} cursor={{ fill: 'hsl(var(--primary) / 0.15)' }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {sessionTypeFilter !== 'off_wall' && <Bar dataKey="boulders" name={t('dashboard.boulders')} fill="hsl(24 95% 58%)" radius={[2, 2, 0, 0]} />}
                        {sessionTypeFilter !== 'on_wall' && <Bar dataKey="sets" name={t('analytics.sets')} fill="hsl(174 72% 55%)" radius={[2, 2, 0, 0]} />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-center text-muted-foreground py-4 text-sm">{t('analytics.noDataPeriod')}</p>}
              </CardContent>
            </Card>

            {/* Volume by Grade - ON-WALL only, improved layout */}
            {sessionTypeFilter !== 'off_wall' && volumeByGrade.length > 0 && (
              <Card className="glass">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ArrowUpDown className="h-4 w-4 text-primary" />{t('analytics.volumeByGrade')}</CardTitle></CardHeader>
                <CardContent>
                  <div className={`${volumeByGrade.length > 8 ? 'max-h-72 overflow-y-auto' : ''}`} style={{ minHeight: Math.min(volumeByGrade.length * 32 + 20, 300) }}>
                    <ResponsiveContainer width="100%" height={Math.max(volumeByGrade.length * 32, 150)}>
                      <BarChart data={volumeByGrade} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                        <YAxis type="category" dataKey="grade" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} width={50} interval={0} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} 
                          labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 600 }}
                          itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                          cursor={{ fill: 'hsl(var(--primary) / 0.15)' }}
                          formatter={(value) => [value, t('analytics.count')]} 
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>{volumeByGrade.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gyms" className="space-y-4 mt-4">
            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4 text-primary" />{t('analytics.gymDifficultyIndex')}</CardTitle>
                  <Popover>
                    <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></PopoverTrigger>
                    <PopoverContent side="left" align="start" className="max-w-xs p-3">
                      <p className="font-medium mb-2">{t('analytics.difficultyExplanation.title')}</p>
                      <ul className="text-xs space-y-1 list-disc pl-4">
                        <li>{t('analytics.difficultyExplanation.baseline')}</li>
                        <li>{t('analytics.difficultyExplanation.bias')}</li>
                        <li>{t('analytics.difficultyExplanation.positive')}</li>
                        <li>{t('analytics.difficultyExplanation.negative')}</li>
                      </ul>
                      <p className="text-xs mt-2 text-muted-foreground">{t('analytics.difficultyExplanation.samples')}</p>
                    </PopoverContent>
                  </Popover>
                </div>
                <CardDescription className="text-xs">{t('analytics.gymDifficultyDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {computedDifficultyProfiles && computedDifficultyProfiles.length > 0 ? (
                  <>
                    {computedDifficultyProfiles.map(profile => (
                      <div key={profile.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{profile.gyms?.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{profile.samples_count} {t('analytics.boulderSamples')}</p>
                        </div>
                        <div className={`ml-3 px-2.5 py-1 rounded-full text-sm font-mono ${(profile.difficulty_bias || 0) > 0 ? 'bg-zone-limit/20 text-zone-limit' : (profile.difficulty_bias || 0) < 0 ? 'bg-zone-comfort/20 text-zone-comfort' : 'bg-muted text-muted-foreground'}`}>
                          {(profile.difficulty_bias || 0) > 0 ? '+' : ''}{(profile.difficulty_bias || 0).toFixed(1)}
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground text-center pt-2"><span className="text-zone-limit">+</span> {t('analytics.harderThanAvg')} • <span className="text-zone-comfort">-</span> {t('analytics.easierThanAvg')}</p>
                  </>
                ) : <p className="text-center text-muted-foreground py-4 text-sm">{t('analytics.completeSessionsMultipleGyms')}</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4 mt-4">
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />{t('analytics.trainingBalance')}</CardTitle></CardHeader>
              <CardContent>
                {weeklyData.some(w => w.onWall > 0 || w.offWall > 0) ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="onWall" name={t('analytics.onWall')} stroke="hsl(24 95% 58%)" strokeWidth={2} />
                        <Line type="monotone" dataKey="offWall" name={t('analytics.offWall')} stroke="hsl(174 72% 55%)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-center text-muted-foreground py-4 text-sm">{t('analytics.noDataPeriod')}</p>}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-base">{t('analytics.trainingInsights')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {totalOnWallSessions > 0 || totalOffWallSessions > 0 ? (
                  <div className="mt-2 p-3 rounded-lg bg-secondary/50 text-sm">
                    {totalOffWallSessions === 0 && totalOnWallSessions > 0 ? (
                      <p className="text-zone-limit">⚠️ {t('analytics.considerStrength')}</p>
                    ) : totalOnWallSessions === 0 && totalOffWallSessions > 0 ? (
                      <p className="text-muted-foreground">📈 {t('analytics.considerClimbing')}</p>
                    ) : (
                      <p className="text-zone-comfort">✅ {t('analytics.greatBalance')}</p>
                    )}
                  </div>
                ) : <p className="text-center text-muted-foreground py-4 text-sm">{t('analytics.noDataPeriod')}</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

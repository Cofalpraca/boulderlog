import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dumbbell, BarChart3, MapPin, Calendar, LogOut, Plus, TrendingUp, Loader2, History, Settings, User, Mountain } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { startOfWeek, format } from 'date-fns';
import { getMaxGrade } from '@/lib/analytics';
import { PendingSyncCard } from '@/components/PendingSyncCard';
import logo from '@/assets/logo-user.png';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  // Fetch this week's ON-WALL sessions
  const { data: onWallSessions, isLoading: onWallLoading } = useQuery({
    queryKey: ['dashboard_on_wall', user?.id, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, boulder_logs(*), session_gyms(gym_id)')
        .eq('user_id', user!.id)
        .eq('session_type', 'on_wall')
        .gte('date_start', weekStart.toISOString());
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch this week's OFF-WALL sessions
  const { data: offWallSessions, isLoading: offWallLoading } = useQuery({
    queryKey: ['dashboard_off_wall', user?.id, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', user!.id)
        .eq('session_type', 'off_wall')
        .gte('date_start', weekStart.toISOString());
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch grade mappings for max grade calculation
  const { data: gradeMappings } = useQuery({
    queryKey: ['dashboard_mappings', user?.id],
    queryFn: async () => {
      const { data: gyms } = await supabase
        .from('gyms')
        .select('id')
        .eq('user_id', user!.id);
      
      if (!gyms?.length) return [];
      
      const { data } = await supabase
        .from('gym_grade_mappings')
        .select('*')
        .in('gym_id', gyms.map(g => g.id));
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Calculate stats
  const totalSessions = (onWallSessions?.length || 0) + (offWallSessions?.length || 0);
  const totalBoulders = onWallSessions?.reduce((sum, s) => 
    sum + (s.boulder_logs?.reduce((bSum, l) => bSum + l.count, 0) || 0), 0
  ) || 0;

  // Get max grade this week
  const allLogs = onWallSessions?.flatMap(s => s.boulder_logs || []) || [];
  const maxGrade = gradeMappings?.length 
    ? getMaxGrade(allLogs.map(l => ({ grade_raw: l.grade_raw, count: l.count })), gradeMappings)
    : null;

  const isLoading = onWallLoading || offWallLoading;

  const quickActions = [
    { icon: Mountain, label: t('dashboard.boulderingSession'), href: '/session/new?type=on_wall', color: 'bg-session-on-wall' },
    { icon: Dumbbell, label: t('dashboard.strengthSession'), href: '/session/new?type=off_wall', color: 'bg-session-off-wall' },
  ];

  const navItems = [
    { icon: History, label: t('dashboard.sessionHistory'), href: '/history', description: t('dashboard.sessionHistoryDesc') },
    { icon: BarChart3, label: t('dashboard.progressAnalytics'), href: '/analytics', description: t('dashboard.progressAnalyticsDesc') },
    { icon: MapPin, label: t('dashboard.gymManagement'), href: '/gyms', description: t('dashboard.gymManagementDesc') },
    { icon: Calendar, label: t('dashboard.weeklyPlan'), href: '/plan', description: t('dashboard.weeklyPlanDesc') },
    { icon: Dumbbell, label: t('dashboard.exerciseLibrary'), href: '/exercises', description: t('dashboard.exerciseLibraryDesc') },
  ];

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Climber';

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="BoulderLog" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="font-bold text-lg">BoulderLog</h1>
              <p className="text-xs text-muted-foreground">{t('dashboard.trainingAnalytics')}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                {t('settings.title')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t('auth.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Welcome */}
        <section className="animate-slide-up">
          <h2 className="text-2xl font-bold mb-1">
            {t('dashboard.welcomeBack', { name: displayName })}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('dashboard.weekOf', { date: format(weekStart, 'MMM d') })}
          </p>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('dashboard.quickStart')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Card className="glass hover:border-primary/50 transition-all group cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-sm">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Pending Sync */}
        <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <PendingSyncCard />
        </section>

        {/* Stats Preview */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card className="glass overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('dashboard.thisWeek')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{totalSessions}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.sessions')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zone-growth">{totalBoulders}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.boulders')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{maxGrade || '--'}</p>
                    <p className="text-xs text-muted-foreground">{t('analytics.max')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity Quick View */}
        {onWallSessions && onWallSessions.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">{t('dashboard.recentSessions')}</h3>
              <Link to="/history" className="text-xs text-primary hover:underline">{t('dashboard.viewAll')}</Link>
            </div>
            <div className="space-y-2">
              {onWallSessions.slice(0, 2).map((session) => {
                const boulders = session.boulder_logs?.reduce((sum, l) => sum + l.count, 0) || 0;
                return (
                  <Card key={session.id} className="glass">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-session-on-wall/20 flex items-center justify-center">
                        <Mountain className="h-5 w-5 text-session-on-wall" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{t('dashboard.boulderingSession')}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.date_start), 'EEE, MMM d')} • {boulders} {t('dashboard.boulders').toLowerCase()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Navigation */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('dashboard.explore')}</h3>
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href}>
                <Card className="glass hover:border-primary/50 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* FAB */}
      <Link
        to="/session/new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-elevation-3 flex items-center justify-center glow-primary animate-pulse-glow"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </Link>
    </div>
  );
}

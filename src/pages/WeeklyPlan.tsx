import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, ChevronRight, Calendar, Mountain, Dumbbell, Plus, 
  Loader2, Trash2, FileText, Play, MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';

type SessionType = Database['public']['Enums']['session_type'];
type Template = Database['public']['Tables']['templates']['Row'];
type PlannedSession = Database['public']['Tables']['planned_sessions']['Row'] & {
  templates?: Template | null;
};
type Gym = Database['public']['Tables']['gyms']['Row'];

export default function WeeklyPlan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<SessionType>('on_wall');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  // Localized days
  const DAYS_OF_WEEK = [
    t('common.monday', 'Monday'),
    t('common.tuesday', 'Tuesday'),
    t('common.wednesday', 'Wednesday'),
    t('common.thursday', 'Thursday'),
    t('common.friday', 'Friday'),
    t('common.saturday', 'Saturday'),
    t('common.sunday', 'Sunday')
  ];
  const SHORT_DAYS = [
    t('common.mon', 'Mon'),
    t('common.tue', 'Tue'),
    t('common.wed', 'Wed'),
    t('common.thu', 'Thu'),
    t('common.fri', 'Fri'),
    t('common.sat', 'Sat'),
    t('common.sun', 'Sun')
  ];

  // Fetch or create weekly plan
  const { data: weeklyPlan, isLoading: planLoading } = useQuery({
    queryKey: ['weekly_plan', user?.id, weekStartStr],
    queryFn: async () => {
      // Try to find existing plan
      const { data: existing } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', user!.id)
        .eq('week_start', weekStartStr)
        .maybeSingle();
      
      if (existing) return existing;
      
      // Create new plan for this week
      const { data: newPlan, error } = await supabase
        .from('weekly_plans')
        .insert({ user_id: user!.id, week_start: weekStartStr })
        .select()
        .single();
      
      if (error) throw error;
      return newPlan;
    },
    enabled: !!user,
  });

  // Fetch planned sessions for this week
  const { data: plannedSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['planned_sessions', weeklyPlan?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('planned_sessions')
        .select('*, templates(*)')
        .eq('weekly_plan_id', weeklyPlan!.id)
        .order('day_of_week');
      return (data || []) as PlannedSession[];
    },
    enabled: !!weeklyPlan,
  });

  // Fetch templates - include BOTH user templates AND system templates
  const { data: templates } = useQuery({
    queryKey: ['templates', user?.id],
    queryFn: async () => {
      // Fetch user templates
      const { data: userTemplates } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user!.id)
        .order('template_type')
        .order('name');
      
      // Fetch system templates (is_system = true)
      const { data: systemTemplates } = await supabase
        .from('templates')
        .select('*')
        .eq('is_system', true)
        .order('template_type')
        .order('name');
      
      // Combine and deduplicate
      const combined = [...(userTemplates || []), ...(systemTemplates || [])];
      return combined;
    },
    enabled: !!user,
  });

  // Fetch gyms for ON-WALL session selection
  const { data: gyms } = useQuery({
    queryKey: ['gyms', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('gyms')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');
      return (data || []) as Gym[];
    },
    enabled: !!user,
  });

  const addPlannedSession = useMutation({
    mutationFn: async () => {
      if (!weeklyPlan) return;
      
      // Store gym in notes for ON-WALL sessions (no schema change)
      let notesWithGym = sessionNotes || null;
      if (selectedType === 'on_wall' && selectedGymId && gyms) {
        const gym = gyms.find(g => g.id === selectedGymId);
        if (gym) {
          notesWithGym = `[Gym: ${gym.name}]${sessionNotes ? ' ' + sessionNotes : ''}`;
        }
      }
      
      const { error } = await supabase.from('planned_sessions').insert({
        weekly_plan_id: weeklyPlan.id,
        day_of_week: selectedDay,
        session_type: selectedType,
        template_id: selectedTemplateId || null,
        notes: notesWithGym,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned_sessions', weeklyPlan?.id] });
      setAddDialogOpen(false);
      setSelectedTemplateId(null);
      setSelectedGymId(null);
      setSessionNotes('');
      toast({ title: t('plan.sessionPlanned') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: String(error), variant: 'destructive' });
    },
  });

  const deletePlannedSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('planned_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planned_sessions', weeklyPlan?.id] });
      toast({ title: t('plan.sessionRemoved') });
    },
  });

  const startSession = async (planned: PlannedSession) => {
    if (!user) return;
    
    // Extract gym from notes if present
    const gymMatch = planned.notes?.match(/^\[Gym: (.+?)\]/);
    const gymName = gymMatch ? gymMatch[1] : null;
    const selectedGym = gymName ? gyms?.find(g => g.name === gymName) : null;
    
    // Create actual session
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        session_type: planned.session_type,
        subtype: planned.templates?.subtype || null,
        date_start: new Date().toISOString(),
      })
      .select('id')
      .single();
    
    if (error || !session) {
      toast({ title: t('common.error'), description: error?.message || 'Failed to create session', variant: 'destructive' });
      return;
    }
    
    // Link gym if ON-WALL session has a gym
    if (planned.session_type === 'on_wall' && selectedGym) {
      await supabase.from('session_gyms').insert({
        session_id: session.id,
        gym_id: selectedGym.id,
      });
    }
    
    // Navigate to appropriate session page
    if (planned.session_type === 'on_wall') {
      navigate(`/session/${session.id}/boulders`);
    } else {
      navigate(`/session/${session.id}/strength`);
    }
  };

  const goToPreviousWeek = () => setWeekStart(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setWeekStart(prev => addWeeks(prev, 1));
  const goToCurrentWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const getSessionsForDay = (dayIndex: number) => 
    plannedSessions?.filter(s => s.day_of_week === dayIndex) || [];

  const isToday = (dayIndex: number) => 
    isSameDay(addDays(weekStart, dayIndex), new Date());

  const filteredTemplates = templates?.filter(t => t.template_type === selectedType) || [];

  const isLoading = planLoading || sessionsLoading;

  // Extract gym name from notes if present
  const extractGymFromNotes = (notes: string | null): { gym: string | null; cleanNotes: string | null } => {
    if (!notes) return { gym: null, cleanNotes: null };
    const match = notes.match(/^\[Gym: (.+?)\]\s*/);
    if (match) {
      return {
        gym: match[1],
        cleanNotes: notes.replace(match[0], '').trim() || null
      };
    }
    return { gym: null, cleanNotes: notes };
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold">{t('plan.title')}</h1>
          </div>
          <Link to="/templates">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              {t('common.templates')}
            </Button>
          </Link>
        </div>
      </header>

      <main className="container px-4 py-4 space-y-4">
        {/* Week Navigation */}
        <Card className="glass">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <p className="font-semibold">
                  {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                </p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={goToCurrentWeek}>
                  {t('plan.goToCurrent')}
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Days Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const daySessions = getSessionsForDay(dayIndex);
              const dayDate = addDays(weekStart, dayIndex);
              const today = isToday(dayIndex);
              
              return (
                <Card 
                  key={day} 
                  className={`glass overflow-hidden transition-all ${today ? 'ring-2 ring-primary/50' : ''}`}
                >
                  <CardHeader className="py-2 px-4 flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${today ? 'text-primary' : ''}`}>
                        {SHORT_DAYS[dayIndex]}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(dayDate, 'd')}
                      </span>
                      {today && (
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                          {t('common.today')}
                        </span>
                      )}
                    </div>
                    <Dialog open={addDialogOpen && selectedDay === dayIndex} onOpenChange={(open) => {
                      setAddDialogOpen(open);
                      if (open) {
                        setSelectedDay(dayIndex);
                        setSelectedGymId(null);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass">
                        <DialogHeader>
                          <DialogTitle>{t('plan.planSession')} - {day}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label>{t('plan.sessionType')}</Label>
                            <Select value={selectedType} onValueChange={(v) => {
                              setSelectedType(v as SessionType);
                              setSelectedTemplateId(null);
                              setSelectedGymId(null);
                            }}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="on_wall">
                                  <div className="flex items-center gap-2">
                                    <Mountain className="h-4 w-4" />
                                    {t('dashboard.boulderingSession')} (ON-WALL)
                                  </div>
                                </SelectItem>
                                <SelectItem value="off_wall">
                                  <div className="flex items-center gap-2">
                                    <Dumbbell className="h-4 w-4" />
                                    {t('dashboard.strengthSession')} (OFF-WALL)
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Gym selection - only for ON-WALL */}
                          {selectedType === 'on_wall' && gyms && gyms.length > 0 && (
                            <div className="space-y-2">
                              <Label>{t('plan.selectGym')}</Label>
                              <Select 
                                value={selectedGymId || 'none'} 
                                onValueChange={(v) => setSelectedGymId(v === 'none' ? null : v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t('plan.noGym')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">{t('plan.noGym')}</SelectItem>
                                  {gyms.map(g => (
                                    <SelectItem key={g.id} value={g.id}>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        {g.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                {t('plan.gymRecommended')}
                              </p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>{t('plan.template')}</Label>
                            <Select 
                              value={selectedTemplateId || 'none'} 
                              onValueChange={(v) => setSelectedTemplateId(v === 'none' ? null : v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('plan.noTemplate')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">{t('plan.noTemplate')}</SelectItem>
                                {filteredTemplates.map(t => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {filteredTemplates.length === 0 && (
                              <p className="text-xs text-muted-foreground">
                                {t('plan.noTemplatesYet', { type: selectedType === 'on_wall' ? 'bouldering' : 'strength' })}{' '}
                                <Link to="/templates" className="text-primary underline">{t('plan.createOne')}</Link>
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>{t('plan.notesOptional')}</Label>
                            <Textarea
                              placeholder={t('plan.focusAreas')}
                              value={sessionNotes}
                              onChange={(e) => setSessionNotes(e.target.value)}
                            />
                          </div>

                          <Button 
                            className="w-full" 
                            onClick={() => addPlannedSession.mutate()}
                            disabled={addPlannedSession.isPending}
                          >
                            {addPlannedSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('common.addToPlan')}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  
                  {daySessions.length > 0 && (
                    <CardContent className="pt-0 pb-3 px-4 space-y-2">
                      {daySessions.map((session) => {
                        const { gym, cleanNotes } = extractGymFromNotes(session.notes);
                        return (
                          <div 
                            key={session.id}
                            className={`flex items-center gap-3 p-2 rounded-lg ${
                              session.session_type === 'on_wall' ? 'bg-session-on-wall/10' : 'bg-session-off-wall/10'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              session.session_type === 'on_wall' ? 'bg-session-on-wall' : 'bg-session-off-wall'
                            }`}>
                              {session.session_type === 'on_wall' ? (
                                <Mountain className="h-4 w-4 text-primary-foreground" />
                              ) : (
                                <Dumbbell className="h-4 w-4 text-primary-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {session.templates?.name || (session.session_type === 'on_wall' ? t('dashboard.boulderingSession') : t('dashboard.strengthSession'))}
                              </p>
                              {gym && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {gym}
                                </p>
                              )}
                              {cleanNotes && (
                                <p className="text-xs text-muted-foreground truncate">{cleanNotes}</p>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="shrink-0"
                              onClick={() => startSession(session)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="shrink-0 h-8 w-8"
                              onClick={() => deletePlannedSession.mutate(session.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
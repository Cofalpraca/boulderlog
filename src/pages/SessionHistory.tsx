import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  ChevronLeft, Mountain, Dumbbell, Loader2, Calendar, Clock, 
  Target, MessageSquare, AlertTriangle, ChevronRight, Hand, Trash2, Pencil, X, Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subDays, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';

type SessionType = Database['public']['Enums']['session_type'];

interface SessionWithDetails {
  id: string;
  session_type: SessionType;
  subtype: string | null;
  date_start: string;
  date_end: string | null;
  rpe: number | null;
  finger_fatigue: number | null;
  pain_flag: boolean | null;
  notes: string | null;
  session_gyms?: { gym_id: string; gyms?: { name: string } | null }[];
  boulder_logs?: {
    grade_raw: string;
    grade_type: string;
    count: number;
    tags: string[] | null;
    notes: string | null;
  }[];
  session_zone_summaries?: {
    comfort_pct: number | null;
    growth_pct: number | null;
    limit_pct: number | null;
  }[];
  session_items?: {
    id: string;
    exercises?: { name: string; category: string } | null;
    session_sets?: {
      set_no: number;
      reps: number | null;
      duration_sec: number | null;
      weight_kg: number | null;
      rpe: number | null;
    }[];
  }[];
}

const ZONE_COLORS = {
  comfort: 'bg-zone-comfort',
  growth: 'bg-zone-growth',
  limit: 'bg-zone-limit',
};

export default function SessionHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [sessionType, setSessionType] = useState<'all' | SessionType>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    notes: '',
    rpe: 5,
    finger_fatigue: 5,
    pain_flag: false,
  });

  // Fetch sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['session_history', user?.id, sessionType, timeRange],
    queryFn: async () => {
      let dateFilter = new Date(0);
      if (timeRange === '7d') dateFilter = subDays(new Date(), 7);
      else if (timeRange === '30d') dateFilter = subDays(new Date(), 30);
      else if (timeRange === '90d') dateFilter = subDays(new Date(), 90);

      let query = supabase
        .from('sessions')
        .select(`
          *,
          session_gyms(gym_id, gyms(name)),
          boulder_logs(*),
          session_zone_summaries(*),
          session_items(*, exercises(name, category), session_sets(*))
        `)
        .eq('user_id', user!.id)
        .gte('date_start', dateFilter.toISOString())
        .not('date_end', 'is', null)
        .order('date_start', { ascending: false });

      if (sessionType !== 'all') {
        query = query.eq('session_type', sessionType);
      }

      const { data } = await query;
      return (data || []) as unknown as SessionWithDetails[];
    },
    enabled: !!user,
  });

  // Delete session mutation
  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      // Delete related records first (cascade should handle this, but being explicit)
      await supabase.from('boulder_logs').delete().eq('session_id', sessionId);
      await supabase.from('session_zone_summaries').delete().eq('session_id', sessionId);
      await supabase.from('session_gyms').delete().eq('session_id', sessionId);
      
      // Delete session items and their sets
      const { data: items } = await supabase
        .from('session_items')
        .select('id')
        .eq('session_id', sessionId);
      
      if (items?.length) {
        await supabase
          .from('session_sets')
          .delete()
          .in('session_item_id', items.map(i => i.id));
        await supabase.from('session_items').delete().eq('session_id', sessionId);
      }
      
      // Finally delete the session
      const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session_history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_on_wall'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_off_wall'] });
      setSelectedSession(null);
      toast.success(t('history.sessionDeleted'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  // Update session mutation
  const updateSession = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: Partial<Database['public']['Tables']['sessions']['Update']> }) => {
      const { error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session_history'] });
      setIsEditing(false);
      toast.success(t('history.sessionUpdated'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  const handleEditClick = () => {
    if (selectedSession) {
      setEditForm({
        notes: selectedSession.notes || '',
        rpe: selectedSession.rpe || 5,
        finger_fatigue: selectedSession.finger_fatigue || 5,
        pain_flag: selectedSession.pain_flag || false,
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedSession) {
      updateSession.mutate({
        sessionId: selectedSession.id,
        updates: {
          notes: editForm.notes || null,
          rpe: editForm.rpe,
          finger_fatigue: editForm.finger_fatigue,
          pain_flag: editForm.pain_flag,
        },
      });
    }
  };

  const handleCloseSheet = () => {
    setSelectedSession(null);
    setIsEditing(false);
  };

  const getSessionDuration = (session: SessionWithDetails) => {
    if (!session.date_end) return null;
    const mins = differenceInMinutes(new Date(session.date_end), new Date(session.date_start));
    if (mins < 60) return `${mins}${t('session.minutes')}`;
    return `${Math.floor(mins / 60)}h ${mins % 60}${t('session.minutes')}`;
  };

  const getBoulderCount = (session: SessionWithDetails) => {
    return session.boulder_logs?.reduce((sum, l) => sum + l.count, 0) || 0;
  };

  const getSetCount = (session: SessionWithDetails) => {
    return session.session_items?.reduce((sum, item) => 
      sum + (item.session_sets?.length || 0), 0
    ) || 0;
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
            <h1 className="font-bold">{t('history.title')}</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <Select value={sessionType} onValueChange={(v) => setSessionType(v as typeof sessionType)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('history.allSessions')}</SelectItem>
              <SelectItem value="on_wall">
                <div className="flex items-center gap-2">
                  <Mountain className="h-4 w-4" />
                  {t('analytics.onWall')}
                </div>
              </SelectItem>
              <SelectItem value="off_wall">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  {t('analytics.offWall')}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('analytics.days7')}</SelectItem>
              <SelectItem value="30d">{t('analytics.days30')}</SelectItem>
              <SelectItem value="90d">{t('analytics.days90')}</SelectItem>
              <SelectItem value="all">{t('analytics.allTime')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions?.length === 0 ? (
          <Card className="glass text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('history.noSessions')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('history.completedSession')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions?.map((session) => (
              <Card 
                key={session.id} 
                className="glass cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => setSelectedSession(session)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      session.session_type === 'on_wall' ? 'bg-session-on-wall' : 'bg-session-off-wall'
                    }`}>
                      {session.session_type === 'on_wall' ? (
                        <Mountain className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <Dumbbell className="h-5 w-5 text-primary-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {session.session_type === 'on_wall' ? t('dashboard.boulderingSession') : t('dashboard.strengthSession')}
                        </p>
                        {session.pain_flag && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                        <span>{format(new Date(session.date_start), 'EEE, MMM d')}</span>
                        {getSessionDuration(session) && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getSessionDuration(session)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {session.session_type === 'on_wall' && session.session_gyms?.[0]?.gyms && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {session.session_gyms[0].gyms.name}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {session.session_type === 'on_wall' ? (
                        <div>
                          <p className="font-bold text-lg text-primary">{getBoulderCount(session)}</p>
                          <p className="text-xs text-muted-foreground">{t('dashboard.boulders').toLowerCase()}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-lg text-primary">{getSetCount(session)}</p>
                          <p className="text-xs text-muted-foreground">{t('analytics.sets').toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
                  </div>

                  {/* Zone indicators for ON-WALL */}
                  {session.session_type === 'on_wall' && session.session_zone_summaries?.[0] && (
                    <div className="flex gap-1 mt-3">
                      <div 
                        className="h-1.5 rounded-full bg-zone-comfort"
                        style={{ width: `${session.session_zone_summaries[0].comfort_pct || 0}%` }}
                      />
                      <div 
                        className="h-1.5 rounded-full bg-zone-growth"
                        style={{ width: `${session.session_zone_summaries[0].growth_pct || 0}%` }}
                      />
                      <div 
                        className="h-1.5 rounded-full bg-zone-limit"
                        style={{ width: `${session.session_zone_summaries[0].limit_pct || 0}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Session Detail Sheet */}
      <Sheet open={!!selectedSession} onOpenChange={handleCloseSheet}>
        <SheetContent side="bottom" className="glass h-[85vh] overflow-y-auto">
          {selectedSession && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    {selectedSession.session_type === 'on_wall' ? (
                      <Mountain className="h-5 w-5 text-session-on-wall" />
                    ) : (
                      <Dumbbell className="h-5 w-5 text-session-off-wall" />
                    )}
                    {selectedSession.session_type === 'on_wall' ? t('session.bouldering') : t('session.strength')}
                  </SheetTitle>
                  
                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleEditClick}>
                        <Pencil className="h-4 w-4 mr-1" />
                        {t('common.edit')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t('common.delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('history.deleteSession')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('history.deleteSessionDesc')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteSession.mutate(selectedSession.id)}
                              disabled={deleteSession.isPending}
                            >
                              {deleteSession.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : null}
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-1" />
                        {t('common.cancel')}
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit} disabled={updateSession.isPending}>
                        {updateSession.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        {t('common.save')}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetHeader>
              
              <div className="space-y-6">
                {/* Session Info */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(selectedSession.date_start), 'EEEE, MMMM d, yyyy')}
                  </div>
                  {getSessionDuration(selectedSession) && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {getSessionDuration(selectedSession)}
                    </div>
                  )}
                </div>

                {/* Gym Info (ON-WALL only) */}
                {selectedSession.session_type === 'on_wall' && selectedSession.session_gyms?.[0]?.gyms && (
                  <Badge variant="secondary">
                    {selectedSession.session_gyms[0].gyms.name}
                  </Badge>
                )}

                {/* Edit Form or View Mode */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('session.notes')}</Label>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder={t('session.addNotes')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('session.rpe')}: {editForm.rpe}</Label>
                      <Slider
                        value={[editForm.rpe]}
                        onValueChange={([v]) => setEditForm(f => ({ ...f, rpe: v }))}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('session.fingerFatigue')}: {editForm.finger_fatigue}</Label>
                      <Slider
                        value={[editForm.finger_fatigue]}
                        onValueChange={([v]) => setEditForm(f => ({ ...f, finger_fatigue: v }))}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>{t('session.painFlag')}</Label>
                      <Switch
                        checked={editForm.pain_flag}
                        onCheckedChange={(v) => setEditForm(f => ({ ...f, pain_flag: v }))}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                      {selectedSession.session_type === 'on_wall' ? (
                        <>
                          <Card className="p-3 text-center bg-secondary/50">
                            <p className="text-2xl font-bold text-primary">{getBoulderCount(selectedSession)}</p>
                            <p className="text-xs text-muted-foreground">{t('dashboard.boulders')}</p>
                          </Card>
                          <Card className="p-3 text-center bg-secondary/50">
                            <p className="text-2xl font-bold">{selectedSession.rpe || '-'}</p>
                            <p className="text-xs text-muted-foreground">RPE</p>
                          </Card>
                          <Card className="p-3 text-center bg-secondary/50">
                            <p className="text-2xl font-bold">{selectedSession.finger_fatigue || '-'}</p>
                            <p className="text-xs text-muted-foreground">{t('session.fingerFatigue')}</p>
                          </Card>
                        </>
                      ) : (
                        <>
                          <Card className="p-3 text-center bg-secondary/50">
                            <p className="text-2xl font-bold text-primary">{getSetCount(selectedSession)}</p>
                            <p className="text-xs text-muted-foreground">{t('analytics.sets')}</p>
                          </Card>
                          <Card className="p-3 text-center bg-secondary/50">
                            <p className="text-2xl font-bold">{selectedSession.rpe || '-'}</p>
                            <p className="text-xs text-muted-foreground">RPE</p>
                          </Card>
                          <Card className="p-3 text-center bg-secondary/50">
                            <p className="text-2xl font-bold">{selectedSession.session_items?.length || 0}</p>
                            <p className="text-xs text-muted-foreground">{t('dashboard.exercises', 'Exercises')}</p>
                          </Card>
                        </>
                      )}
                    </div>

                    {/* Zone Summary (ON-WALL only) */}
                    {selectedSession.session_type === 'on_wall' && selectedSession.session_zone_summaries?.[0] && (
                      <Card className="p-4 bg-secondary/50">
                        <h4 className="font-medium mb-3">{t('analytics.developmentZones')}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-zone-comfort" />
                            <span className="flex-1 text-sm">{t('analytics.comfort')}</span>
                            <span className="font-medium">{selectedSession.session_zone_summaries[0].comfort_pct?.toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-zone-growth" />
                            <span className="flex-1 text-sm">{t('analytics.growth')}</span>
                            <span className="font-medium">{selectedSession.session_zone_summaries[0].growth_pct?.toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-zone-limit" />
                            <span className="flex-1 text-sm">{t('analytics.limit')}</span>
                            <span className="font-medium">{selectedSession.session_zone_summaries[0].limit_pct?.toFixed(0)}%</span>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Notes */}
                    {selectedSession.notes && (
                      <Card className="p-4 bg-secondary/50">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{selectedSession.notes}</p>
                        </div>
                      </Card>
                    )}

                    {/* Boulder Logs (ON-WALL) */}
                    {selectedSession.session_type === 'on_wall' && selectedSession.boulder_logs && selectedSession.boulder_logs.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">{t('dashboard.boulders')}</h4>
                        <div className="space-y-2">
                          {selectedSession.boulder_logs.map((log, i) => (
                            <Card key={i} className="p-3 bg-secondary/50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{log.grade_raw}</span>
                                  {log.tags && log.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {log.tags.map((tag, j) => (
                                        <Badge key={j} variant="outline" className="text-xs">{tag}</Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Badge variant="secondary">×{log.count}</Badge>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exercise Items (OFF-WALL) */}
                    {selectedSession.session_type === 'off_wall' && selectedSession.session_items && selectedSession.session_items.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">{t('dashboard.exercises', 'Exercises')}</h4>
                        <div className="space-y-2">
                          {selectedSession.session_items.map((item) => (
                            <Card key={item.id} className="p-3 bg-secondary/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{item.exercises?.name || 'Exercise'}</span>
                                <Badge variant="outline">{item.session_sets?.length || 0} {t('analytics.sets').toLowerCase()}</Badge>
                              </div>
                              {item.session_sets && item.session_sets.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                                  <span>{t('common.set', 'Set')}</span>
                                  <span>{t('common.reps', 'Reps')}</span>
                                  <span>{t('common.weight', 'Weight')}</span>
                                  <span>RPE</span>
                                  {item.session_sets.map((set) => (
                                    <>
                                      <span key={`${set.set_no}-no`} className="text-foreground">{set.set_no}</span>
                                      <span key={`${set.set_no}-reps`} className="text-foreground">{set.reps || '-'}</span>
                                      <span key={`${set.set_no}-weight`} className="text-foreground">{set.weight_kg ? `${set.weight_kg}kg` : '-'}</span>
                                      <span key={`${set.set_no}-rpe`} className="text-foreground">{set.rpe || '-'}</span>
                                    </>
                                  ))}
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineStorage, generateTempId } from '@/hooks/useOfflineStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  ChevronLeft, Dumbbell, Plus, Minus, Timer, Save, X, Loader2, 
  CheckCircle2, Trash2, GripVertical, Hand, Zap, CircleDot, Sparkles, WifiOff, Settings2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Exercise = Database['public']['Tables']['exercises']['Row'];
type Protocol = Database['public']['Tables']['protocols']['Row'];
type ExerciseCategory = Database['public']['Enums']['exercise_category'];
type SessionItem = Database['public']['Tables']['session_items']['Row'];
type SessionSet = Database['public']['Tables']['session_sets']['Row'];

interface ProtocolParams {
  work_duration_sec?: number;
  rest_duration_sec?: number;
  sets?: number;
  hold_sec?: number;
  notes?: string;
}

interface LocalSessionItem {
  id?: string;
  exercise_id: string;
  exercise: Exercise;
  protocol_id?: string;
  protocol?: Protocol;
  order_index: number;
  sets: LocalSet[];
}

interface LocalSet {
  id?: string;
  set_no: number;
  reps: number | null;
  duration_sec: number | null;
  weight_kg: number | null;
  rpe: number | null;
  completed: boolean;
}

const CATEGORY_ICONS: Record<ExerciseCategory, React.ReactNode> = {
  fingers: <Hand className="h-4 w-4" />,
  strength: <Dumbbell className="h-4 w-4" />,
  core: <CircleDot className="h-4 w-4" />,
  mobility: <Sparkles className="h-4 w-4" />,
};

const getCategoryLabel = (category: ExerciseCategory, t: (key: string) => string) => ({
  fingers: t('exercises.categories.fingers'),
  strength: t('exercises.categories.strength'),
  core: t('exercises.categories.core'),
  mobility: t('exercises.categories.mobility'),
}[category]);

export default function StrengthSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { isOnline, cacheData, getCachedData, updateSessionOffline, saveSessionItemsOffline, saveSessionSetsOffline } = useOfflineStorage();
  
  const isOfflineSession = sessionId?.startsWith('offline-');
  const offlineTempId = isOfflineSession ? sessionId.replace('offline-', '') : null;
  
  const [sessionItems, setSessionItems] = useState<LocalSessionItem[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [rpe, setRpe] = useState<number>(5);
  const [fingerFatigue, setFingerFatigue] = useState<number>(5);
  const [painFlag, setPainFlag] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startTime] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('fingers');
  const [cachedExercises, setCachedExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);

  const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
    fingers: t('exercises.categories.fingers'),
    strength: t('exercises.categories.strength'),
    core: t('exercises.categories.core'),
    mobility: t('exercises.categories.mobility'),
  };

  // Fetch session (only for online sessions)
  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId!)
        .maybeSingle();
      return data;
    },
    enabled: !!sessionId && !isOfflineSession,
  });

  // Fetch exercises
  const { data: exercises } = useQuery({
    queryKey: ['exercises', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .or(`is_system.eq.true,user_id.eq.${user!.id}`)
        .order('category')
        .order('name');
      return data || [];
    },
    enabled: !!user && isOnline,
  });

  // Cache exercises for offline use
  useEffect(() => {
    if (exercises?.length && isOnline && user) {
      cacheData(`exercises_${user.id}`, exercises);
    }
  }, [exercises, user?.id, isOnline, cacheData]);

  // Load cached exercises when offline
  useEffect(() => {
    if (!isOnline && user) {
      getCachedData<Exercise[]>(`exercises_${user.id}`).then((cached) => {
        if (cached) setCachedExercises(cached);
      });
    }
  }, [isOnline, user, getCachedData]);

  const availableExercises = isOnline ? exercises : cachedExercises;

  // Fetch protocols
  const { data: protocols } = useQuery({
    queryKey: ['protocols', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('protocols')
        .select('*')
        .or(`is_system.eq.true,user_id.eq.${user!.id}`)
        .order('name');
      return data || [];
    },
    enabled: !!user && isOnline,
  });

  // Fetch existing session items (only for online sessions)
  const { data: existingItems } = useQuery({
    queryKey: ['session_items', sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('session_items')
        .select('*, exercises(*), session_sets(*)')
        .eq('session_id', sessionId!)
        .order('order_index');
      return data || [];
    },
    enabled: !!sessionId && !isOfflineSession,
  });

  // Initialize from existing data
  useEffect(() => {
    if (existingItems?.length) {
      const items: LocalSessionItem[] = existingItems.map(item => ({
        id: item.id,
        exercise_id: item.exercise_id!,
        exercise: item.exercises as Exercise,
        order_index: item.order_index,
        sets: (item.session_sets as SessionSet[] || []).map(s => ({
          id: s.id,
          set_no: s.set_no,
          reps: s.reps,
          duration_sec: s.duration_sec,
          weight_kg: s.weight_kg,
          rpe: s.rpe,
          completed: true,
        })).sort((a, b) => a.set_no - b.set_no),
      }));
      setSessionItems(items);
    }
  }, [existingItems]);

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSelectedProtocol(null);
    setProtocolDialogOpen(true);
    setExerciseDialogOpen(false);
  };

  const addExerciseWithProtocol = () => {
    if (!selectedExercise) return;
    
    const params = selectedProtocol?.params_json as ProtocolParams | null;
    const defaultSets = params?.sets || 1;
    
    const newItem: LocalSessionItem = {
      exercise_id: selectedExercise.id,
      exercise: selectedExercise,
      protocol_id: selectedProtocol?.id,
      protocol: selectedProtocol || undefined,
      order_index: sessionItems.length,
      sets: Array.from({ length: defaultSets }, (_, i) => ({
        set_no: i + 1,
        reps: null,
        duration_sec: params?.work_duration_sec || params?.hold_sec || null,
        weight_kg: null,
        rpe: null,
        completed: false,
      })),
    };
    setSessionItems(prev => [...prev, newItem]);
    setProtocolDialogOpen(false);
    setSelectedExercise(null);
    setSelectedProtocol(null);
  };

  const skipProtocol = () => {
    if (!selectedExercise) return;
    
    const newItem: LocalSessionItem = {
      exercise_id: selectedExercise.id,
      exercise: selectedExercise,
      order_index: sessionItems.length,
      sets: [{ set_no: 1, reps: null, duration_sec: null, weight_kg: null, rpe: null, completed: false }],
    };
    setSessionItems(prev => [...prev, newItem]);
    setProtocolDialogOpen(false);
    setSelectedExercise(null);
  };

  const removeExercise = (index: number) => {
    setSessionItems(prev => prev.filter((_, i) => i !== index));
  };

  const addSet = (itemIndex: number) => {
    setSessionItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item;
      const nextSetNo = item.sets.length + 1;
      return {
        ...item,
        sets: [...item.sets, { set_no: nextSetNo, reps: null, duration_sec: null, weight_kg: null, rpe: null, completed: false }],
      };
    }));
  };

  const removeSet = (itemIndex: number, setIndex: number) => {
    setSessionItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item;
      const newSets = item.sets.filter((_, si) => si !== setIndex).map((s, idx) => ({ ...s, set_no: idx + 1 }));
      return { ...item, sets: newSets };
    }));
  };

  const updateSet = (itemIndex: number, setIndex: number, field: keyof LocalSet, value: number | null | boolean) => {
    setSessionItems(prev => prev.map((item, i) => {
      if (i !== itemIndex) return item;
      return {
        ...item,
        sets: item.sets.map((s, si) => si === setIndex ? { ...s, [field]: value } : s),
      };
    }));
  };

  const toggleSetComplete = (itemIndex: number, setIndex: number) => {
    updateSet(itemIndex, setIndex, 'completed', !sessionItems[itemIndex].sets[setIndex].completed);
  };

  const elapsedMinutes = Math.floor((Date.now() - startTime.getTime()) / 60000);
  const totalSets = sessionItems.reduce((sum, item) => sum + item.sets.filter(s => s.completed).length, 0);

  const endSession = async () => {
    if (!user) return;
    setSaving(true);

    try {
      if (isOfflineSession && offlineTempId) {
        // Offline: Save to IndexedDB
        const itemsToSave = sessionItems.map((item, idx) => ({
          id: generateTempId(),
          exercise_id: item.exercise_id,
          exercise_name: item.exercise.name,
          exercise_category: item.exercise.category,
          order_index: idx,
        }));
        
        await saveSessionItemsOffline(offlineTempId, itemsToSave);
        
        for (let i = 0; i < sessionItems.length; i++) {
          const item = sessionItems[i];
          const setsToSave = item.sets.filter(s => s.completed).map(s => ({
            id: generateTempId(),
            set_no: s.set_no,
            reps: s.reps,
            duration_sec: s.duration_sec,
            weight_kg: s.weight_kg,
            rpe: s.rpe,
          }));
          await saveSessionSetsOffline(itemsToSave[i].id, setsToSave);
        }
        
        await updateSessionOffline(offlineTempId, {
          date_end: new Date().toISOString(),
          notes: sessionNotes || undefined,
          rpe,
          finger_fatigue: fingerFatigue,
          pain_flag: painFlag,
        });
        
        toast({ 
          title: 'Session saved offline!', 
          description: 'Will sync when back online' 
        });
        navigate('/');
      } else if (sessionId) {
        // Online: Save to Supabase
        await supabase.from('session_items').delete().eq('session_id', sessionId);
        
        for (let i = 0; i < sessionItems.length; i++) {
          const item = sessionItems[i];
          const { data: insertedItem, error: itemError } = await supabase
            .from('session_items')
            .insert({
              session_id: sessionId,
              exercise_id: item.exercise_id,
              order_index: i,
            })
            .select('id')
            .single();
          
          if (itemError || !insertedItem) continue;

          const setsToInsert = item.sets
            .filter(s => s.completed)
            .map(s => ({
              session_item_id: insertedItem.id,
              set_no: s.set_no,
              reps: s.reps,
              duration_sec: s.duration_sec,
              weight_kg: s.weight_kg,
              rpe: s.rpe,
            }));
          
          if (setsToInsert.length > 0) {
            await supabase.from('session_sets').insert(setsToInsert);
          }
        }

        await supabase.from('sessions').update({
          date_end: new Date().toISOString(),
          notes: sessionNotes || null,
          rpe,
          finger_fatigue: fingerFatigue,
          pain_flag: painFlag,
        }).eq('id', sessionId);

        await queryClient.invalidateQueries({ queryKey: ['sessions'] });
        toast({ 
          title: 'Session saved!', 
          description: `${totalSets} sets completed across ${sessionItems.length} exercises` 
        });
        navigate('/analytics');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to save session', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelSession = async () => {
    if (confirm('Discard this session?')) {
      if (!isOfflineSession && sessionId) {
        await supabase.from('sessions').delete().eq('id', sessionId);
      }
      navigate('/');
    }
  };

  const exercisesByCategory = availableExercises?.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {} as Record<ExerciseCategory, Exercise[]>) || {};

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={cancelSession}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm">{t('session.strength')}</h1>
              {isOfflineSession && (
                <span className="text-xs text-amber-500 flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  {t('session.offline')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Timer className="h-3 w-3" />
              {elapsedMinutes} {t('session.minutes')}
              <span className="mx-1">•</span>
              <Dumbbell className="h-3 w-3" />
              {totalSets} {t('analytics.sets')}
            </div>
          </div>
          <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-session-off-wall hover:bg-session-off-wall/90">
                <Save className="mr-2 h-4 w-4" />
                {t('session.end')}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-w-md">
              <DialogHeader>
                <DialogTitle>{t('session.endSession')}</DialogTitle>
              </DialogHeader>
              <EndSessionForm
                sessionNotes={sessionNotes}
                setSessionNotes={setSessionNotes}
                rpe={rpe}
                setRpe={setRpe}
                fingerFatigue={fingerFatigue}
                setFingerFatigue={setFingerFatigue}
                painFlag={painFlag}
                setPainFlag={setPainFlag}
                totalSets={totalSets}
                exerciseCount={sessionItems.length}
                elapsedMinutes={elapsedMinutes}
                onSave={endSession}
                saving={saving}
                t={t}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Exercise List */}
      <main className="container px-4 py-4 space-y-4">
        {sessionItems.length === 0 ? (
          <Card className="glass text-center py-12">
            <CardContent>
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{t('session.noExercisesYet')}</p>
              <Button onClick={() => setExerciseDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('session.addExercise')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          sessionItems.map((item, itemIndex) => (
            <Card key={itemIndex} className="glass overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-session-off-wall/20 flex items-center justify-center`}>
                    {CATEGORY_ICONS[item.exercise.category]}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{item.exercise.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[item.exercise.category]}</p>
                      {item.protocol && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary flex items-center gap-1">
                          <Settings2 className="h-3 w-3" />
                          {item.protocol.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeExercise(itemIndex)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {/* Sets */}
                {item.sets.map((set, setIndex) => (
                  <SetRow
                    key={setIndex}
                    set={set}
                    exercise={item.exercise}
                    t={t}
                    onUpdate={(field, value) => updateSet(itemIndex, setIndex, field, value)}
                    onToggleComplete={() => toggleSetComplete(itemIndex, setIndex)}
                    onRemove={() => removeSet(itemIndex, setIndex)}
                    canRemove={item.sets.length > 1}
                  />
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => addSet(itemIndex)}
                >
                  <Plus className="mr-2 h-3 w-3" />
                  {t('session.addSet')}
                </Button>
              </CardContent>
            </Card>
          ))
        )}

        {/* Add Exercise FAB */}
        {sessionItems.length > 0 && (
          <Button 
            className="w-full bg-session-off-wall hover:bg-session-off-wall/90"
            onClick={() => setExerciseDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('session.addExercise')}
          </Button>
        )}
      </main>

      {/* Exercise Selection Dialog */}
      <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
        <DialogContent className="glass max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('session.selectExercise')}</DialogTitle>
          </DialogHeader>
          
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ExerciseCategory)} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-4 shrink-0">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(CATEGORY_LABELS).map(([key]) => (
              <TabsContent key={key} value={key} className="flex-1 overflow-y-auto mt-4">
                <div className="space-y-2">
                  {exercisesByCategory[key as ExerciseCategory]?.map((exercise) => (
                    <Card 
                      key={exercise.id}
                      className="cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => handleExerciseSelect(exercise)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          {CATEGORY_ICONS[exercise.category]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{exercise.name}</p>
                          {exercise.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{exercise.description}</p>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Protocol Selection Dialog */}
      <Dialog open={protocolDialogOpen} onOpenChange={setProtocolDialogOpen}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              {t('session.selectProtocol')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedExercise && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-session-off-wall/20 flex items-center justify-center">
                  {CATEGORY_ICONS[selectedExercise.category]}
                </div>
                <div>
                  <p className="font-medium">{selectedExercise.name}</p>
                  <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[selectedExercise.category]}</p>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {protocols?.map((protocol) => {
                  const params = protocol.params_json as ProtocolParams | null;
                  const isSelected = selectedProtocol?.id === protocol.id;
                  return (
                    <Card 
                      key={protocol.id}
                      className={`cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                      onClick={() => setSelectedProtocol(isSelected ? null : protocol)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                          <Settings2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{protocol.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {params?.work_duration_sec && params?.rest_duration_sec 
                              ? `${params.work_duration_sec}/${params.rest_duration_sec}` 
                              : params?.hold_sec 
                                ? `${params.hold_sec}s hold`
                                : ''}
                            {params?.sets ? ` • ${params.sets} sets` : ''}
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </CardContent>
                    </Card>
                  );
                })}
                
                {(!protocols || protocols.length === 0) && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No protocols available
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={skipProtocol}>
                  Skip
                </Button>
                <Button 
                  className="flex-1 bg-session-off-wall hover:bg-session-off-wall/90" 
                  onClick={addExerciseWithProtocol}
                >
                  {selectedProtocol ? 'Add with Protocol' : 'Add Exercise'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SetRow({
  set,
  exercise,
  t,
  onUpdate,
  onToggleComplete,
  onRemove,
  canRemove,
}: {
  set: LocalSet;
  exercise: Exercise;
  t: (key: string) => string;
  onUpdate: (field: keyof LocalSet, value: number | null | boolean) => void;
  onToggleComplete: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const isFingerExercise = exercise.category === 'fingers';
  const isIsometric = exercise.exercise_type === 'isometric';
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg transition-all ${set.completed ? 'bg-primary/10' : 'bg-secondary/50'}`}>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 shrink-0 ${set.completed ? 'text-primary' : 'text-muted-foreground'}`}
        onClick={onToggleComplete}
      >
        {set.completed ? <CheckCircle2 className="h-5 w-5" /> : <CircleDot className="h-5 w-5" />}
      </Button>
      
      <span className="text-xs font-mono text-muted-foreground w-6">#{set.set_no}</span>
      
      {/* Reps or Duration - with clear labels */}
      {isIsometric ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            placeholder={t('session.secPlaceholder')}
            value={set.duration_sec ?? ''}
            onChange={(e) => onUpdate('duration_sec', e.target.value ? Number(e.target.value) : null)}
            className="h-8 w-16 text-center text-sm"
          />
          <span className="text-xs text-muted-foreground shrink-0">s</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            placeholder={t('session.repsPlaceholder')}
            value={set.reps ?? ''}
            onChange={(e) => onUpdate('reps', e.target.value ? Number(e.target.value) : null)}
            className="h-8 w-16 text-center text-sm"
          />
          <span className="text-xs text-muted-foreground shrink-0">×</span>
        </div>
      )}
      
      {/* Weight - with clear label */}
      <div className="flex items-center gap-1">
        <Input
          type="number"
          placeholder={t('session.weightPlaceholder')}
          value={set.weight_kg ?? ''}
          onChange={(e) => onUpdate('weight_kg', e.target.value ? Number(e.target.value) : null)}
          className="h-8 w-14 text-center text-sm"
          step="0.5"
        />
        <span className="text-xs text-muted-foreground shrink-0">kg</span>
      </div>
      
      {/* RPE - with clear label */}
      <div className="flex items-center gap-1">
        <Input
          type="number"
          placeholder={t('session.rpePlaceholder')}
          value={set.rpe ?? ''}
          onChange={(e) => onUpdate('rpe', e.target.value ? Number(e.target.value) : null)}
          className="h-8 w-14 text-center text-sm"
          min={1}
          max={10}
        />
      </div>
      
      {canRemove && (
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onRemove}>
          <Minus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

function EndSessionForm({
  sessionNotes,
  setSessionNotes,
  rpe,
  setRpe,
  fingerFatigue,
  setFingerFatigue,
  painFlag,
  setPainFlag,
  totalSets,
  exerciseCount,
  elapsedMinutes,
  onSave,
  saving,
  t,
}: {
  sessionNotes: string;
  setSessionNotes: (v: string) => void;
  rpe: number;
  setRpe: (v: number) => void;
  fingerFatigue: number;
  setFingerFatigue: (v: number) => void;
  painFlag: boolean;
  setPainFlag: (v: boolean) => void;
  totalSets: number;
  exerciseCount: number;
  elapsedMinutes: number;
  onSave: () => void;
  saving: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
        <CheckCircle2 className="h-8 w-8 text-session-off-wall" />
        <div>
          <p className="font-semibold">{totalSets} {t('analytics.sets')} • {exerciseCount} {t('common.exercises')}</p>
          <p className="text-sm text-muted-foreground">{elapsedMinutes} {t('session.minutes')}</p>
        </div>
      </div>

      {/* RPE */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>{t('session.sessionRpe')}</Label>
          <span className="font-mono text-primary">{rpe}/10</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('session.rpeDescription')}
        </p>
        <Slider
          value={[rpe]}
          onValueChange={([v]) => setRpe(v)}
          min={1}
          max={10}
          step={1}
        />
      </div>

      {/* Finger Fatigue */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>{t('session.fingerFatigue')}</Label>
          <span className="font-mono text-primary">{fingerFatigue}/10</span>
        </div>
        <Slider
          value={[fingerFatigue]}
          onValueChange={([v]) => setFingerFatigue(v)}
          min={1}
          max={10}
          step={1}
        />
      </div>

      {/* Pain Flag */}
      <div className="flex items-center justify-between">
        <Label>{t('session.anyPain')}</Label>
        <Button
          variant={painFlag ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => setPainFlag(!painFlag)}
        >
          {painFlag ? t('common.yes') : t('common.no')}
        </Button>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>{t('session.notes')}</Label>
        <Textarea
          placeholder={t('session.howDidItGo')}
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
        />
      </div>

      {/* Save Button */}
      <Button className="w-full" onClick={onSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {t('session.saveSession')}
      </Button>
    </div>
  );
}

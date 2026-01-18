import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Dumbbell, Plus, Loader2, Trash2, Search, Hand, CircleDot, Sparkles, User, Globe, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';

type Exercise = Database['public']['Tables']['exercises']['Row'];
type ExerciseCategory = Database['public']['Enums']['exercise_category'];

const CATEGORY_ICONS: Record<ExerciseCategory, React.ReactNode> = {
  fingers: <Hand className="h-4 w-4" />,
  strength: <Dumbbell className="h-4 w-4" />,
  core: <CircleDot className="h-4 w-4" />,
  mobility: <Sparkles className="h-4 w-4" />
};

const EXERCISE_TYPES: Record<ExerciseCategory, string[]> = {
  fingers: ['hangboard', 'campus', 'grip'],
  strength: ['pulling', 'pushing', 'power', 'isometric', 'tension'],
  core: ['dynamic', 'isometric', 'rotation'],
  mobility: ['flexibility', 'warmup', 'recovery']
};

export default function ExerciseLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('fingers');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    category: 'fingers' as ExerciseCategory,
    exercise_type: '',
    description: ''
  });

  const getCategoryLabel = (cat: ExerciseCategory) => t(`exercises.categories.${cat}`);
  const getCategoryDesc = (cat: ExerciseCategory) => t(`exercises.categoryDescriptions.${cat}`);

  // Fetch all exercises
  const {
    data: exercises,
    isLoading
  } = useQuery({
    queryKey: ['exercises', user?.id],
    queryFn: async () => {
      const {
        data
      } = await supabase.from('exercises').select('*').or(`is_system.eq.true,user_id.eq.${user!.id}`).order('is_system', {
        ascending: false
      }).order('name');
      return data || [];
    },
    enabled: !!user
  });
  const createExercise = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('exercises').insert({
        user_id: user!.id,
        name: newExercise.name,
        category: newExercise.category,
        exercise_type: newExercise.exercise_type || null,
        description: newExercise.description || null,
        is_system: false
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setCreateDialogOpen(false);
      setNewExercise({ name: '', category: 'fingers', exercise_type: '', description: '' });
      toast({ title: t('exercises.created') });
    },
    onError: error => {
      toast({ title: t('common.error'), description: String(error), variant: 'destructive' });
    }
  });

  const deleteExercise = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({ title: t('exercises.deleted') });
    },
    onError: error => {
      toast({ title: t('common.error'), description: String(error), variant: 'destructive' });
    }
  });

  // Filter exercises
  const filteredExercises = exercises?.filter(ex => {
    const matchesCategory = ex.category === selectedCategory;
    const matchesSearch = searchQuery === '' || ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];
  
  const systemExercises = filteredExercises.filter(ex => ex.is_system);
  const userExercises = filteredExercises.filter(ex => !ex.is_system);

  // Count exercises per category
  const categoryCounts = exercises?.reduce((acc, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + 1;
    return acc;
  }, {} as Record<ExerciseCategory, number>) || {};

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-2 max-w-full">
          <Link to="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{t('exercises.title')}</h1>
          </div>
          <Link to="/protocols" className="shrink-0">
            <Button variant="outline" size="sm" className="px-2">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">{t('exercises.protocols')}</span>
            </Button>
          </Link>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="shrink-0 px-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">{t('exercises.add')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('exercises.createExercise')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>{t('exercises.exerciseName')} *</Label>
                  <Input 
                    placeholder={t('exercises.exerciseNamePlaceholder')} 
                    value={newExercise.name} 
                    onChange={e => setNewExercise(prev => ({ ...prev, name: e.target.value }))} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('exercises.category')} *</Label>
                  <Select 
                    value={newExercise.category} 
                    onValueChange={v => setNewExercise(prev => ({ ...prev, category: v as ExerciseCategory, exercise_type: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['fingers', 'strength', 'core', 'mobility'] as ExerciseCategory[]).map(key => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {CATEGORY_ICONS[key]}
                            {getCategoryLabel(key)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('exercises.exerciseType')}</Label>
                  <Select 
                    value={newExercise.exercise_type} 
                    onValueChange={v => setNewExercise(prev => ({ ...prev, exercise_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('exercises.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISE_TYPES[newExercise.category].map(type => (
                        <SelectItem key={type} value={type}>
                          {t(`exercises.types.${type}`, type.charAt(0).toUpperCase() + type.slice(1))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('exercises.description')}</Label>
                  <Textarea 
                    placeholder={t('exercises.descriptionPlaceholder')} 
                    value={newExercise.description} 
                    onChange={e => setNewExercise(prev => ({ ...prev, description: e.target.value }))} 
                  />
                </div>

                <Button className="w-full" onClick={() => createExercise.mutate()} disabled={!newExercise.name || createExercise.isPending}>
                  {createExercise.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('exercises.createExercise')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('exercises.searchPlaceholder')} 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-9" 
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={v => setSelectedCategory(v as ExerciseCategory)}>
          <TabsList className="grid grid-cols-4">
            {(['fingers', 'strength', 'core', 'mobility'] as ExerciseCategory[]).map(key => (
              <TabsTrigger key={key} value={key} className="flex flex-col gap-1.5 py-3 h-auto">
                {CATEGORY_ICONS[key]}
                <span className="text-[10px] leading-tight">{getCategoryLabel(key)}</span>
                <span className="text-[9px] text-muted-foreground mt-1">{categoryCounts[key] || 0}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            (['fingers', 'strength', 'core', 'mobility'] as ExerciseCategory[]).map(cat => (
              <TabsContent key={cat} value={cat} className="space-y-4 mt-4">
                {/* Category Description */}
                <p className="text-sm text-muted-foreground my-[15px] mb-0 mt-[50px]">
                  {getCategoryDesc(cat)}
                </p>

                {/* User Exercises */}
                {userExercises.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {t('exercises.yourExercises')}
                    </div>
                    {userExercises.map(exercise => (
                      <ExerciseCard 
                        key={exercise.id} 
                        exercise={exercise} 
                        onDelete={() => deleteExercise.mutate(exercise.id)} 
                        canDelete 
                      />
                    ))}
                  </div>
                )}

                {/* System Exercises */}
                {systemExercises.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      {t('exercises.systemExercises')}
                    </div>
                    {systemExercises.map(exercise => (
                      <ExerciseCard key={exercise.id} exercise={exercise} canDelete={false} />
                    ))}
                  </div>
                )}

                {filteredExercises.length === 0 && (
                  <Card className="glass text-center py-8">
                    <CardContent>
                      {CATEGORY_ICONS[cat]}
                      <p className="text-muted-foreground mt-2">
                        {searchQuery ? t('exercises.noMatch') : t('exercises.noExercisesCategory')}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4" 
                        onClick={() => {
                          setNewExercise(prev => ({ ...prev, category: cat }));
                          setCreateDialogOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('exercises.addExercise')}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))
          )}
        </Tabs>
      </main>
    </div>
  );
}
function ExerciseCard({
  exercise,
  onDelete,
  canDelete
}: {
  exercise: Exercise;
  onDelete?: () => void;
  canDelete: boolean;
}) {
  return <Card className="glass">
      <CardContent className="p-3 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${exercise.is_system ? 'bg-secondary' : 'bg-primary/20'}`}>
          {CATEGORY_ICONS[exercise.category]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{exercise.name}</p>
            {exercise.exercise_type && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground shrink-0">
                {exercise.exercise_type}
              </span>}
          </div>
          {exercise.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{exercise.description}</p>}
        </div>
        {canDelete && onDelete && <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>}
      </CardContent>
    </Card>;
}
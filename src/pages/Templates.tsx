import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, Mountain, Dumbbell, Plus, Loader2, Trash2, 
  FileText, Hand, CircleDot, Sparkles, GripVertical, Settings2, CheckCircle2,
  Clock, Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { OnWallTemplateEditor, type OnWallConfig } from '@/components/templates/OnWallTemplateEditor';
import type { Database, Json } from '@/integrations/supabase/types';

type Protocol = Database['public']['Tables']['protocols']['Row'];

interface ProtocolParams {
  work_duration_sec?: number;
  rest_duration_sec?: number;
  sets?: number;
  hold_sec?: number;
  notes?: string;
}

type TemplateType = Database['public']['Enums']['template_type'];
type ExerciseCategory = Database['public']['Enums']['exercise_category'];

interface Template {
  id: string;
  user_id: string | null;
  name: string;
  template_type: TemplateType;
  subtype: string | null;
  is_system: boolean | null;
  config_json: Json | null;
  created_at: string;
  updated_at: string;
}

type TemplateItem = Database['public']['Tables']['template_items']['Row'];
type Exercise = Database['public']['Tables']['exercises']['Row'];

interface TemplateWithItems extends Template {
  template_items?: (TemplateItem & { exercises?: Exercise | null })[];
}

const CATEGORY_ICONS: Record<ExerciseCategory, React.ReactNode> = {
  fingers: <Hand className="h-4 w-4" />,
  strength: <Dumbbell className="h-4 w-4" />,
  core: <CircleDot className="h-4 w-4" />,
  mobility: <Sparkles className="h-4 w-4" />,
};

export default function Templates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<TemplateType>('off_wall');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState<TemplateType>('off_wall');
  const [editingTemplate, setEditingTemplate] = useState<TemplateWithItems | null>(null);
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('fingers');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);

  // Fetch templates (user's own + system templates)
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('templates')
        .select('*, template_items(*, exercises(*))')
        .or(`user_id.eq.${user!.id},is_system.eq.true`)
        .order('is_system', { ascending: false })
        .order('template_type')
        .order('name');
      return (data || []) as TemplateWithItems[];
    },
    enabled: !!user,
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
    enabled: !!user,
  });

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
    enabled: !!user,
  });

  const createTemplate = useMutation({
    mutationFn: async () => {
      // For ON-WALL templates, include default config
      const isOnWall = newTemplateType === 'on_wall';
      const defaultConfig: OnWallConfig | null = isOnWall ? {
        focus: 'custom',
        grade_focus: 0,
        recommended_duration_min: 90,
        zone_guidance: { comfort: 33, growth: 34, limit: 33 },
      } : null;

      const { data, error } = await supabase
        .from('templates')
        .insert({
          user_id: user!.id,
          name: newTemplateName,
          template_type: newTemplateType,
          config_json: defaultConfig as unknown as Json,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setCreateDialogOpen(false);
      setNewTemplateName('');
      toast({ title: t('templates.created') });
      setEditingTemplate({ ...data, template_items: [] } as TemplateWithItems);
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: String(error), variant: 'destructive' });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: t('templates.deleted') });
    },
  });

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSelectedProtocol(null);
    setProtocolDialogOpen(true);
    setExerciseDialogOpen(false);
  };

  const addExerciseToTemplate = useMutation({
    mutationFn: async ({ exercise, protocol }: { exercise: Exercise; protocol?: Protocol | null }) => {
      if (!editingTemplate) return;
      
      const currentItems = editingTemplate.template_items || [];
      const { data, error } = await supabase
        .from('template_items')
        .insert({
          template_id: editingTemplate.id,
          item_type: 'exercise',
          exercise_id: exercise.id,
          protocol_id: protocol?.id || null,
          order_index: currentItems.length,
        })
        .select('*, exercises(*), protocols(*)')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data && editingTemplate) {
        setEditingTemplate({
          ...editingTemplate,
          template_items: [...(editingTemplate.template_items || []), data as TemplateItem & { exercises?: Exercise | null; protocols?: Protocol | null }],
        });
      }
      setProtocolDialogOpen(false);
      setSelectedExercise(null);
      setSelectedProtocol(null);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const removeTemplateItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('template_items').delete().eq('id', itemId);
      if (error) throw error;
      return itemId;
    },
    onSuccess: (itemId) => {
      if (editingTemplate) {
        setEditingTemplate({
          ...editingTemplate,
          template_items: editingTemplate.template_items?.filter(i => i.id !== itemId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const onWallTemplates = templates?.filter(t => t.template_type === 'on_wall') || [];
  const offWallTemplates = templates?.filter(t => t.template_type === 'off_wall') || [];

  const exercisesByCategory = exercises?.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {} as Record<ExerciseCategory, Exercise[]>) || {};

  // Template editor view
  if (editingTemplate) {
    const isOnWall = editingTemplate.template_type === 'on_wall';
    const isSystemTemplate = editingTemplate.is_system === true;
    
    return (
      <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="container flex items-center h-14 px-4 gap-3">
            <Button variant="ghost" size="icon" onClick={() => setEditingTemplate(null)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-bold">{editingTemplate.name}</h1>
                {isSystemTemplate && (
                  <Badge variant="secondary" className="text-xs">{t('templates.preset')}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOnWall ? 'ON-WALL' : 'OFF-WALL'} Template
              </p>
            </div>
          </div>
        </header>

        <main className="container px-4 py-4 space-y-4">
          {isOnWall ? (
            // ON-WALL Template Editor - Configuration based, no exercises
            <OnWallTemplateEditor
              templateId={editingTemplate.id}
              templateName={editingTemplate.name}
              initialConfig={editingTemplate.config_json as OnWallConfig | null}
              isSystemTemplate={isSystemTemplate}
            />
          ) : (
            // OFF-WALL Template Editor - Exercise-based (existing behavior)
            <>
              {editingTemplate.template_items?.length === 0 ? (
                <Card className="glass text-center py-12">
                  <CardContent>
                    <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">{t('templates.noExercisesInTemplate')}</p>
                    <Button onClick={() => setExerciseDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('templates.addExercise')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {editingTemplate.template_items?.map((item, index) => (
                    <Card key={item.id} className="glass">
                      <CardContent className="p-3 flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          {item.exercises && CATEGORY_ICONS[item.exercises.category]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.exercises?.name}</p>
                          <p className="text-xs text-muted-foreground">{item.exercises?.category}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeTemplateItem.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setExerciseDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('templates.addExercise')}
                  </Button>
                </>
              )}
            </>
          )}
        </main>

        {/* Exercise Selection Dialog - Only for OFF-WALL templates */}
        {!isOnWall && (
          <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
            <DialogContent className="glass max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>{t('templates.addExerciseToTemplate')}</DialogTitle>
              </DialogHeader>
              
              <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ExerciseCategory)} className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="grid grid-cols-4 shrink-0">
                  <TabsTrigger value="fingers" className="text-xs">{t('exercises.categories.fingers')}</TabsTrigger>
                  <TabsTrigger value="strength" className="text-xs">{t('exercises.categories.strength')}</TabsTrigger>
                  <TabsTrigger value="core" className="text-xs">{t('exercises.categories.core')}</TabsTrigger>
                  <TabsTrigger value="mobility" className="text-xs">{t('exercises.categories.mobility')}</TabsTrigger>
                </TabsList>
                
                {(['fingers', 'strength', 'core', 'mobility'] as ExerciseCategory[]).map((cat) => (
                  <TabsContent key={cat} value={cat} className="flex-1 overflow-y-auto mt-4">
                    <div className="space-y-2">
                      {exercisesByCategory[cat]?.map((exercise) => (
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
        )}

        {/* Protocol Selection Dialog - Only for OFF-WALL templates */}
        {!isOnWall && (
          <Dialog open={protocolDialogOpen} onOpenChange={setProtocolDialogOpen}>
            <DialogContent className="glass max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  {t('templates.selectProtocol')}
                </DialogTitle>
              </DialogHeader>
              
              {selectedExercise && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-secondary/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      {CATEGORY_ICONS[selectedExercise.category]}
                    </div>
                    <div>
                      <p className="font-medium">{selectedExercise.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedExercise.category}</p>
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
                        {t('templates.noProtocolsAvailable')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => {
                        if (selectedExercise) {
                          addExerciseToTemplate.mutate({ exercise: selectedExercise, protocol: null });
                        }
                      }}
                    >
                      {t('templates.skip')}
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        if (selectedExercise) {
                          addExerciseToTemplate.mutate({ exercise: selectedExercise, protocol: selectedProtocol });
                        }
                      }}
                    >
                      {selectedProtocol ? t('templates.addWithProtocol') : t('templates.addExercise')}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Template list view
  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Link to="/plan">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold">{t('templates.title')}</h1>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t('templates.new')}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>{t('templates.createTemplate')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>{t('templates.templateName')}</Label>
                  <Input
                    placeholder={t('templates.templateNamePlaceholder')}
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('templates.type')}</Label>
                  <Select value={newTemplateType} onValueChange={(v) => setNewTemplateType(v as TemplateType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_wall">
                        <div className="flex items-center gap-2">
                          <Mountain className="h-4 w-4" />
                          {t('templates.onWall')}
                        </div>
                      </SelectItem>
                      <SelectItem value="off_wall">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4" />
                          {t('templates.offWall')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createTemplate.mutate()}
                  disabled={!newTemplateName || createTemplate.isPending}
                >
                  {createTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('templates.createTemplate')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TemplateType)}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="off_wall" className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                OFF-WALL
              </TabsTrigger>
              <TabsTrigger value="on_wall" className="flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                ON-WALL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="off_wall" className="space-y-3">
              {offWallTemplates.length === 0 ? (
                <Card className="glass text-center py-8">
                  <CardContent>
                    <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">{t('templates.noStrengthTemplates')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('templates.createStrengthDesc')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                offWallTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={() => setEditingTemplate(template)}
                    onDelete={() => deleteTemplate.mutate(template.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="on_wall" className="space-y-3">
              {onWallTemplates.length === 0 ? (
                <Card className="glass text-center py-8">
                  <CardContent>
                    <Mountain className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">{t('templates.noBouldersTemplates')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('templates.createBoulderDesc')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                onWallTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={() => setEditingTemplate(template)}
                    onDelete={() => deleteTemplate.mutate(template.id)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: TemplateWithItems;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const isOnWall = template.template_type === 'on_wall';
  const isSystemTemplate = template.is_system === true;
  const config = template.config_json as OnWallConfig | null;
  
  // For OFF-WALL, show exercise count. For ON-WALL, show focus/duration
  const itemCount = template.template_items?.length || 0;
  
  return (
    <Card className="glass cursor-pointer hover:border-primary/50 transition-all" onClick={onEdit}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isOnWall ? 'bg-session-on-wall' : 'bg-session-off-wall'
        }`}>
          {isOnWall ? (
            <Mountain className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{template.name}</p>
            {isSystemTemplate && (
              <Badge variant="secondary" className="text-xs">{t('templates.preset')}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isOnWall ? (
              config ? (
                <span className="flex items-center gap-2">
                  {config.focus && <span className="capitalize">{config.focus}</span>}
                  {config.recommended_duration_min && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {config.recommended_duration_min}min
                    </span>
                  )}
                </span>
              ) : t('templates.sessionTemplate')
            ) : (
              `${itemCount} ${itemCount === 1 ? t('templates.exercise') : t('templates.exercises')}`
            )}
          </p>
        </div>
        {!isSystemTemplate && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

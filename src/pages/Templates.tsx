import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, Mountain, Dumbbell, Plus, Loader2, Trash2, 
  FileText, Hand, CircleDot, Sparkles, GripVertical, Settings2, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

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
type Template = Database['public']['Tables']['templates']['Row'];
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

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('templates')
        .select('*, template_items(*, exercises(*))')
        .eq('user_id', user!.id)
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
      const { data, error } = await supabase
        .from('templates')
        .insert({
          user_id: user!.id,
          name: newTemplateName,
          template_type: newTemplateType,
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
      toast({ title: 'Template created!' });
      setEditingTemplate({ ...data, template_items: [] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: String(error), variant: 'destructive' });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: 'Template deleted' });
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
    return (
      <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="container flex items-center h-14 px-4 gap-3">
            <Button variant="ghost" size="icon" onClick={() => setEditingTemplate(null)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold">{editingTemplate.name}</h1>
              <p className="text-xs text-muted-foreground">
                {editingTemplate.template_type === 'on_wall' ? 'ON-WALL' : 'OFF-WALL'} Template
              </p>
            </div>
          </div>
        </header>

        <main className="container px-4 py-4 space-y-4">
          {editingTemplate.template_items?.length === 0 ? (
            <Card className="glass text-center py-12">
              <CardContent>
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No exercises in this template</p>
                <Button onClick={() => setExerciseDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exercise
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
                Add Exercise
              </Button>
            </>
          )}
        </main>

        {/* Exercise Selection Dialog */}
        <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
          <DialogContent className="glass max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Exercise to Template</DialogTitle>
            </DialogHeader>
            
            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ExerciseCategory)} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid grid-cols-4 shrink-0">
                <TabsTrigger value="fingers" className="text-xs">Fingers</TabsTrigger>
                <TabsTrigger value="strength" className="text-xs">Strength</TabsTrigger>
                <TabsTrigger value="core" className="text-xs">Core</TabsTrigger>
                <TabsTrigger value="mobility" className="text-xs">Mobility</TabsTrigger>
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

        {/* Protocol Selection Dialog */}
        <Dialog open={protocolDialogOpen} onOpenChange={setProtocolDialogOpen}>
          <DialogContent className="glass max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Select Protocol
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
                      No protocols available
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
                    Skip
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      if (selectedExercise) {
                        addExerciseToTemplate.mutate({ exercise: selectedExercise, protocol: selectedProtocol });
                      }
                    }}
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
            <h1 className="font-bold">Templates</h1>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Create Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., Max Hangs Protocol"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newTemplateType} onValueChange={(v) => setNewTemplateType(v as TemplateType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_wall">
                        <div className="flex items-center gap-2">
                          <Mountain className="h-4 w-4" />
                          ON-WALL (Bouldering)
                        </div>
                      </SelectItem>
                      <SelectItem value="off_wall">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4" />
                          OFF-WALL (Strength)
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
                  Create Template
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
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No strength templates yet</p>
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
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No bouldering templates yet</p>
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
  const itemCount = template.template_items?.length || 0;
  
  return (
    <Card className="glass cursor-pointer hover:border-primary/50 transition-all" onClick={onEdit}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          template.template_type === 'on_wall' ? 'bg-session-on-wall' : 'bg-session-off-wall'
        }`}>
          {template.template_type === 'on_wall' ? (
            <Mountain className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">{template.name}</p>
          <p className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'exercise' : 'exercises'}
          </p>
        </div>
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
      </CardContent>
    </Card>
  );
}

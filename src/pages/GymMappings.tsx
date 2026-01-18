import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Plus, Loader2, Save, Trash2, GripVertical, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];

const FONT_GRADES = ['4', '4+', '5', '5+', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b'];
const V_GRADES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14'];

// Predefined accessible color palette with WCAG contrast compliance on dark backgrounds
const GRADE_COLORS = [
  { hex: '#FACC15', name: 'Yellow' },
  { hex: '#22C55E', name: 'Green' },
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#A855F7', name: 'Purple' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#9CA3AF', name: 'Gray' },
] as const;

interface MappingForm {
  id?: string;
  label: string;
  color_hex: string | null;
  approx_font_min: string | null;
  approx_font_max: string | null;
  approx_v_min: string | null;
  approx_v_max: string | null;
  order_index: number;
}

export default function GymMappings() {
  const { gymId } = useParams<{ gymId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [mappings, setMappings] = useState<MappingForm[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: gym, isLoading: gymLoading } = useQuery({
    queryKey: ['gym', gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', gymId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!gymId,
  });

  const { data: existingMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['gym_grade_mappings', gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_grade_mappings')
        .select('*')
        .eq('gym_id', gymId!)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!gymId,
  });

  useEffect(() => {
    if (existingMappings) {
      setMappings(existingMappings.map(m => ({
        id: m.id,
        label: m.label,
        color_hex: m.color_hex,
        approx_font_min: m.approx_font_min,
        approx_font_max: m.approx_font_max,
        approx_v_min: m.approx_v_min,
        approx_v_max: m.approx_v_max,
        order_index: m.order_index,
      })));
    }
  }, [existingMappings]);

  const saveMappings = useMutation({
    mutationFn: async () => {
      if (!gymId) return;
      
      // Delete removed mappings
      const existingIds = existingMappings?.map(m => m.id) || [];
      const currentIds = mappings.filter(m => m.id).map(m => m.id);
      const toDelete = existingIds.filter(id => !currentIds.includes(id));
      
      if (toDelete.length) {
        await supabase.from('gym_grade_mappings').delete().in('id', toDelete);
      }
      
      // Upsert mappings
      for (let i = 0; i < mappings.length; i++) {
        const m = mappings[i];
        const data = {
          gym_id: gymId,
          label: m.label,
          color_hex: m.color_hex,
          approx_font_min: m.approx_font_min,
          approx_font_max: m.approx_font_max,
          approx_v_min: m.approx_v_min,
          approx_v_max: m.approx_v_max,
          order_index: i,
        };
        
        if (m.id) {
          await supabase.from('gym_grade_mappings').update(data).eq('id', m.id);
        } else {
          await supabase.from('gym_grade_mappings').insert(data);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_grade_mappings'] });
      setHasChanges(false);
      toast({ title: t('gradeMappings.mappingsSaved') });
    },
    onError: (e: Error) => {
      toast({ title: t('common.error'), description: e.message, variant: 'destructive' });
    },
  });

  const updateMapping = (index: number, field: keyof MappingForm, value: string | null) => {
    setMappings(prev => prev.map((m, i) => 
      i === index ? { ...m, [field]: value } : m
    ));
    setHasChanges(true);
  };

  const addMapping = () => {
    setMappings(prev => [...prev, {
      label: `Level ${prev.length + 1}`,
      color_hex: '#9CA3AF',
      approx_font_min: '6a',
      approx_font_max: '6b',
      approx_v_min: 'V3',
      approx_v_max: 'V4',
      order_index: prev.length,
    }]);
    setHasChanges(true);
  };

  const removeMapping = (index: number) => {
    setMappings(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const moveMapping = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === mappings.length - 1) return;
    
    const newMappings = [...mappings];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newMappings[index], newMappings[swapIndex]] = [newMappings[swapIndex], newMappings[index]];
    setMappings(newMappings);
    setHasChanges(true);
  };

  const isColorBased = gym?.grading_type === 'colors' || gym?.grading_type === 'numeric';

  if (gymLoading || mappingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Link to="/gyms">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-sm">{gym?.name}</h1>
            <p className="text-xs text-muted-foreground">{t('gradeMappings.title')}</p>
          </div>
          <Button 
            size="sm" 
            onClick={() => saveMappings.mutate()} 
            disabled={!hasChanges || saveMappings.isPending}
          >
            {saveMappings.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {t('gradeMappings.save')}
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('gradeMappings.description')}
        </p>

        <div className="space-y-3">
          {mappings.map((mapping, index) => (
            <Card key={index} className="p-3 bg-secondary/30 border-primary/40">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  {isColorBased && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors flex items-center justify-center"
                          style={{ backgroundColor: mapping.color_hex || '#9CA3AF' }}
                          aria-label={t('gradeMappings.selectColor')}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">{t('gradeMappings.selectColor')}</p>
                          <div className="grid grid-cols-5 gap-2">
                            {GRADE_COLORS.map((color) => {
                              const isSelected = mapping.color_hex === color.hex;
                              const isUsed = mappings.some((m, i) => i !== index && m.color_hex === color.hex);
                              return (
                                <button
                                  key={color.hex}
                                  type="button"
                                  onClick={() => updateMapping(index, 'color_hex', color.hex)}
                                  className={`w-8 h-8 rounded-md border-2 transition-all flex items-center justify-center ${
                                    isSelected 
                                      ? 'border-primary ring-2 ring-primary/50' 
                                      : isUsed 
                                        ? 'border-border/50 opacity-40 cursor-not-allowed' 
                                        : 'border-border hover:border-primary/50'
                                  }`}
                                  style={{ backgroundColor: color.hex }}
                                  disabled={isUsed && !isSelected}
                                  title={isUsed ? `${color.name} (${t('gradeMappings.alreadyUsed')})` : color.name}
                                >
                                  {isSelected && (
                                    <Check className={`h-4 w-4 ${color.hex === '#FFFFFF' || color.hex === '#FACC15' ? 'text-black' : 'text-white'}`} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {GRADE_COLORS.find(c => c.hex === mapping.color_hex)?.name || 'Gray'}
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <Input
                    placeholder={t('gradeMappings.labelPlaceholder')}
                    value={mapping.label}
                    onChange={(e) => updateMapping(index, 'label', e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeMapping(index)}
                    disabled={mappings.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('gradeMappings.vScaleRange')}</Label>
                    <div className="flex items-center gap-1">
                      <Select 
                        value={mapping.approx_v_min || ''} 
                        onValueChange={(v) => updateMapping(index, 'approx_v_min', v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={t('gradeMappings.min')} />
                        </SelectTrigger>
                        <SelectContent>
                          {V_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground text-xs">→</span>
                      <Select 
                        value={mapping.approx_v_max || ''} 
                        onValueChange={(v) => updateMapping(index, 'approx_v_max', v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={t('gradeMappings.max')} />
                        </SelectTrigger>
                        <SelectContent>
                          {V_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('gradeMappings.fontRange')}</Label>
                    <div className="flex items-center gap-1">
                      <Select 
                        value={mapping.approx_font_min || ''} 
                        onValueChange={(v) => updateMapping(index, 'approx_font_min', v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={t('gradeMappings.min')} />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground text-xs">→</span>
                      <Select 
                        value={mapping.approx_font_max || ''} 
                        onValueChange={(v) => updateMapping(index, 'approx_font_max', v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={t('gradeMappings.max')} />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="outline" className="w-full" onClick={addMapping}>
          <Plus className="mr-2 h-4 w-4" />
          {t('gradeMappings.addGrade')}
        </Button>
      </main>
    </div>
  );
}

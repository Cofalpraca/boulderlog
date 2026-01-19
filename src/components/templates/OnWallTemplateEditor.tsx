import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mountain, Clock, Target, 
  ArrowUp, ArrowDown, Minus, Save, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface OnWallConfig {
  focus?: 'project' | 'volume' | 'limit' | 'technique' | 'warmup' | 'custom';
  description?: string;
  grade_focus?: number; // -2 to +2 relative to baseline
  recommended_duration_min?: number;
  zone_guidance?: {
    comfort: number;
    growth: number;
    limit: number;
  };
}

interface OnWallTemplateEditorProps {
  templateId: string;
  templateName: string;
  initialConfig: OnWallConfig | null;
  isSystemTemplate?: boolean;
}

export function OnWallTemplateEditor({ 
  templateId, 
  templateName, 
  initialConfig, 
  isSystemTemplate = false 
}: OnWallTemplateEditorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const FOCUS_OPTIONS = [
    { value: 'project', label: t('templates.focusTypes.project'), description: t('templates.focusTypes.projectDesc') },
    { value: 'volume', label: t('templates.focusTypes.volume'), description: t('templates.focusTypes.volumeDesc') },
    { value: 'limit', label: t('templates.focusTypes.limit'), description: t('templates.focusTypes.limitDesc') },
    { value: 'technique', label: t('templates.focusTypes.technique'), description: t('templates.focusTypes.techniqueDesc') },
    { value: 'warmup', label: t('templates.focusTypes.warmup'), description: t('templates.focusTypes.warmupDesc') },
    { value: 'custom', label: t('templates.focusTypes.custom'), description: t('templates.focusTypes.customDesc') },
  ] as const;

  const GRADE_FOCUS_OPTIONS = [
    { value: -2, label: t('templates.wellBelowBaseline'), icon: ArrowDown },
    { value: -1, label: t('templates.belowBaseline'), icon: ArrowDown },
    { value: 0, label: t('templates.aroundBaseline'), icon: Minus },
    { value: 1, label: t('templates.aboveBaseline'), icon: ArrowUp },
    { value: 2, label: t('templates.wellAboveBaseline'), icon: ArrowUp },
  ];
  
  const [config, setConfig] = useState<OnWallConfig>(initialConfig || {
    focus: 'custom',
    grade_focus: 0,
    recommended_duration_min: 90,
    zone_guidance: { comfort: 33, growth: 34, limit: 33 },
  });

  const updateConfig = useMutation({
    mutationFn: async (newConfig: OnWallConfig) => {
      const { error } = await supabase
        .from('templates')
        .update({ config_json: JSON.parse(JSON.stringify(newConfig)) })
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: t('templates.saved') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: String(error), variant: 'destructive' });
    },
  });

  const handleZoneChange = (zone: 'comfort' | 'growth' | 'limit', value: number) => {
    const current = config.zone_guidance || { comfort: 33, growth: 34, limit: 33 };
    const diff = value - current[zone];
    
    // Adjust other zones proportionally
    const others = (['comfort', 'growth', 'limit'] as const).filter(z => z !== zone);
    const otherTotal = others.reduce((sum, z) => sum + current[z], 0);
    
    const newZones = { ...current, [zone]: value };
    if (otherTotal > 0) {
      others.forEach(z => {
        newZones[z] = Math.max(0, Math.round(current[z] - (diff * current[z] / otherTotal)));
      });
    }
    
    // Normalize to 100
    const newTotal = newZones.comfort + newZones.growth + newZones.limit;
    if (newTotal !== 100) {
      const adjustment = 100 - newTotal;
      if (newZones.growth > 0) newZones.growth += adjustment;
      else if (newZones.comfort > 0) newZones.comfort += adjustment;
      else newZones.limit += adjustment;
    }
    
    setConfig({ ...config, zone_guidance: newZones });
  };


  if (isSystemTemplate) {
    return (
      <div className="space-y-4">
        <Card className="glass border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-session-on-wall flex items-center justify-center">
                <Mountain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">{templateName}</p>
                <Badge variant="secondary" className="text-xs">{t('templates.systemPreset')}</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {initialConfig?.description || t('templates.sessionTemplate')}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{initialConfig?.recommended_duration_min || 90} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>{GRADE_FOCUS_OPTIONS.find(o => o.value === initialConfig?.grade_focus)?.label || t('templates.aroundBaseline')}</span>
              </div>
            </div>
            {initialConfig?.zone_guidance && (
              <div className="mt-4 flex gap-2 text-xs">
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  {t('analytics.comfort')} {initialConfig.zone_guidance.comfort}%
                </Badge>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  {t('analytics.growth')} {initialConfig.zone_guidance.growth}%
                </Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-500">
                  {t('analytics.limit')} {initialConfig.zone_guidance.limit}%
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Focus Type */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t('templates.sessionFocus')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select 
            value={config.focus || 'custom'} 
            onValueChange={(v) => setConfig({ ...config, focus: v as OnWallConfig['focus'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOCUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t('templates.focusDescription')}</Label>
            <Input
              placeholder={t('templates.focusDescriptionPlaceholder')}
              value={config.description || ''}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grade Focus */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowUp className="h-4 w-4" />
            {t('templates.gradeFocus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={String(config.grade_focus ?? 0)} 
            onValueChange={(v) => setConfig({ ...config, grade_focus: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRADE_FOCUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  <div className="flex items-center gap-2">
                    <opt.icon className={`h-4 w-4 ${opt.value > 0 ? 'text-red-500' : opt.value < 0 ? 'text-green-500' : 'text-yellow-500'}`} />
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            {t('templates.gradeFocusDesc')}
          </p>
        </CardContent>
      </Card>

      {/* Duration */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('templates.recommendedDuration')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <Slider
              value={[config.recommended_duration_min || 90]}
              onValueChange={([v]) => setConfig({ ...config, recommended_duration_min: v })}
              min={30}
              max={180}
              step={15}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">
              {config.recommended_duration_min || 90} min
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Zone Distribution */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('templates.zoneDistribution')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(['comfort', 'growth', 'limit'] as const).map((zone) => {
            const colors = {
              comfort: 'bg-green-500',
              growth: 'bg-yellow-500',
              limit: 'bg-red-500',
            };
            const zoneLabels = {
              comfort: t('analytics.comfort'),
              growth: t('analytics.growth'),
              limit: t('analytics.limit'),
            };
            const value = config.zone_guidance?.[zone] || 33;
            return (
              <div key={zone} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">{zoneLabels[zone]}</Label>
                  <Badge variant="outline" className="text-xs">{value}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[zone]}`} />
                  <Slider
                    value={[value]}
                    onValueChange={([v]) => handleZoneChange(zone, v)}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        className="w-full" 
        onClick={() => updateConfig.mutate(config)}
        disabled={updateConfig.isPending}
      >
        {updateConfig.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {t('templates.saveTemplate')}
      </Button>
    </div>
  );
}

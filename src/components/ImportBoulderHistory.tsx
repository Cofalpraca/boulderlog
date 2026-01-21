import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Upload, AlertTriangle, CheckCircle2, AlertCircle, FileText, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { 
  parseImportText, 
  findUnmappedGrades, 
  calculateImportSummary,
  type ParsedSession,
  type ParseError 
} from '@/lib/importParser';
import { updateWeeklyAggregate } from '@/lib/sessionAggregates';
import { computeSessionZones } from '@/lib/analytics';
import type { Database } from '@/integrations/supabase/types';

type Gym = Database['public']['Tables']['gyms']['Row'];
type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];

interface ImportBoulderHistoryProps {
  onComplete?: () => void;
}

export function ImportBoulderHistory({ onComplete }: ImportBoulderHistoryProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [step, setStep] = useState<'input' | 'preview' | 'importing' | 'done'>('input');
  const [parseResult, setParseResult] = useState<{
    sessions: ParsedSession[];
    errors: ParseError[];
  } | null>(null);
  
  // Fetch gyms
  const { data: gyms, isLoading: gymsLoading } = useQuery({
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

  // Fetch grade mappings for selected gym
  const { data: gradeMappings } = useQuery({
    queryKey: ['gym_grade_mappings', selectedGymId],
    queryFn: async () => {
      const { data } = await supabase
        .from('gym_grade_mappings')
        .select('*')
        .eq('gym_id', selectedGymId!)
        .order('order_index');
      return (data || []) as GradeMapping[];
    },
    enabled: !!selectedGymId,
  });

  const selectedGym = useMemo(() => 
    gyms?.find(g => g.id === selectedGymId) || null,
    [gyms, selectedGymId]
  );

  const availableGrades = useMemo(() => 
    gradeMappings?.map(m => m.label) || [],
    [gradeMappings]
  );

  // Parse preview
  const handlePreview = () => {
    const result = parseImportText(importText);
    setParseResult(result);
    setStep('preview');
  };

  // Summary data
  const summary = useMemo(() => {
    if (!parseResult) return null;
    return calculateImportSummary(parseResult.sessions);
  }, [parseResult]);

  const unmappedGrades = useMemo(() => {
    if (!parseResult || !availableGrades.length) return [];
    return findUnmappedGrades(parseResult.sessions, availableGrades);
  }, [parseResult, availableGrades]);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedGymId || !parseResult || !selectedGym) {
        throw new Error('Missing required data');
      }

      const sessionsToCreate = parseResult.sessions;
      let createdCount = 0;
      let boulderCount = 0;

      for (const parsed of sessionsToCreate) {
        // Create session (COMPLETED status, not draft)
        const sessionStart = new Date(parsed.date);
        sessionStart.setHours(12, 0, 0, 0);
        const sessionEnd = new Date(sessionStart);
        sessionEnd.setHours(14, 0, 0, 0); // Default 2 hour session
        
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            user_id: user.id,
            session_type: 'on_wall' as const,
            date_start: sessionStart.toISOString(),
            date_end: sessionEnd.toISOString(),
            status: 'completed',
            notes: t('import.importedNote', { date: parsed.rawLine.split(',')[0] }),
          })
          .select('id')
          .single();

        if (sessionError || !session) {
          console.error('Failed to create session:', sessionError);
          continue;
        }

        // Link gym
        await supabase.from('session_gyms').insert({
          session_id: session.id,
          gym_id: selectedGymId,
        });

        // Create boulder logs (each grade entry creates individual logs with count=1)
        const logs = [];
        for (const entry of parsed.grades) {
          for (let i = 0; i < entry.count; i++) {
            logs.push({
              session_id: session.id,
              grade_raw: entry.grade_raw,
              grade_type: selectedGym.grading_type,
              count: 1,
            });
          }
        }

        if (logs.length > 0) {
          await supabase.from('boulder_logs').insert(logs);
          boulderCount += logs.length;
        }

        // Compute and store zone summaries (same as manual session finish)
        if (gradeMappings?.length) {
          const logsForZones = logs.map(l => ({ grade_raw: l.grade_raw, count: l.count }));
          const zones = computeSessionZones(logsForZones, gradeMappings, user.id);
          await supabase.from('session_zone_summaries').upsert({
            session_id: session.id,
            comfort_pct: zones.comfort_pct,
            growth_pct: zones.growth_pct,
            limit_pct: zones.limit_pct,
          }, { onConflict: 'session_id' });
        }

        // Update weekly aggregates (same as manual session finish)
        await updateWeeklyAggregate({
          sessionId: session.id,
          userId: user.id,
          sessionType: 'on_wall',
          dateStart: sessionStart.toISOString(),
          boulderCount: logs.length,
          hasPain: false,
        });

        createdCount++;
      }

      return { createdCount, boulderCount };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session_history'] });
      queryClient.invalidateQueries({ queryKey: ['weekly_aggregates'] });
      queryClient.invalidateQueries({ queryKey: ['boulder_logs'] });
      queryClient.invalidateQueries({ queryKey: ['sessions_on_wall'] });
      queryClient.invalidateQueries({ queryKey: ['user_level_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session_zone_summaries'] });
      
      toast.success(t('import.success'), {
        description: `${t('import.successDesc', { 
          sessions: result.createdCount, 
          boulders: result.boulderCount 
        })} ${t('import.successHint')}`,
      });
      
      setStep('done');
      onComplete?.();
    },
    onError: (error) => {
      console.error('Import failed:', error);
      toast.error(t('common.error'), {
        description: t('import.failed'),
      });
    },
  });

  const handleImport = () => {
    setStep('importing');
    importMutation.mutate();
  };

  const handleReset = () => {
    setImportText('');
    setParseResult(null);
    setStep('input');
  };

  if (gymsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!gyms?.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('import.noGyms')}</AlertTitle>
        <AlertDescription>{t('import.addGymFirst')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {step === 'input' && (
        <>
          {/* Gym Selection */}
          <div className="space-y-2">
            <Label>{t('import.selectGym')} *</Label>
            <Select value={selectedGymId || ''} onValueChange={setSelectedGymId}>
              <SelectTrigger>
                <SelectValue placeholder={t('import.chooseGym')} />
              </SelectTrigger>
              <SelectContent>
                {gyms.map((gym) => (
                  <SelectItem key={gym.id} value={gym.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {gym.name}
                      {gym.city && <span className="text-muted-foreground">({gym.city})</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Help */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>{t('import.formatTitle')}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{t('import.formatDesc')}</p>
              <pre className="bg-muted p-2 rounded text-xs font-mono whitespace-pre-wrap">
{`10.01.2025, 2x6a, 3x6b, 1x6c+
12.01.2025, 5x6a, 2x6b+`}
              </pre>
            </AlertDescription>
          </Alert>

          {/* Text Input */}
          <div className="space-y-2">
            <Label>{t('import.pasteData')}</Label>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={t('import.placeholder')}
              rows={10}
              className="font-mono text-sm"
              disabled={!selectedGymId}
            />
          </div>

          <Button 
            onClick={handlePreview} 
            disabled={!selectedGymId || !importText.trim()}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {t('import.preview')}
          </Button>
        </>
      )}

      {step === 'preview' && parseResult && summary && (
        <>
          {/* Summary Card */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-zone-growth" />
                {t('import.previewTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('import.sessions')}</p>
                  <p className="font-bold text-lg">{summary.sessionCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('import.boulders')}</p>
                  <p className="font-bold text-lg">{summary.totalBoulders}</p>
                </div>
              </div>
              
              {summary.dateRange && (
                <p className="text-xs text-muted-foreground">
                  {t('import.dateRange', {
                    from: summary.dateRange.earliest.toLocaleDateString(),
                    to: summary.dateRange.latest.toLocaleDateString(),
                  })}
                </p>
              )}

              {/* Grade breakdown */}
              <div className="flex flex-wrap gap-1">
                {Object.entries(summary.gradeBreakdown).map(([grade, count]) => (
                  <Badge key={grade} variant="secondary" className="text-xs">
                    {count}× {grade}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {parseResult.errors.length > 0 && (
            <Card className="glass border-destructive/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {t('import.errors', { count: parseResult.errors.length })}
                </CardTitle>
                <CardDescription>{t('import.errorsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-32">
                  <div className="space-y-2 text-sm">
                    {parseResult.errors.map((err, i) => (
                      <div key={i} className="text-destructive">
                        <span className="font-mono">{t('import.line')} {err.lineNumber}:</span>{' '}
                        {err.error}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Unmapped Grades Warning */}
          {unmappedGrades.length > 0 && (
            <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">{t('import.unmappedWarning')}</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{t('import.unmappedDesc')}</p>
                <div className="flex flex-wrap gap-1">
                  {unmappedGrades.slice(0, 10).map(u => (
                    <Badge key={u.grade} variant="outline" className="text-xs">
                      {u.grade} ({u.count})
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={parseResult.sessions.length === 0}
              className="flex-1"
            >
              {t('import.confirmImport', { count: parseResult.sessions.length })}
            </Button>
          </div>
        </>
      )}

      {step === 'importing' && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('import.importing')}</p>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <CheckCircle2 className="h-12 w-12 text-zone-growth" />
          <p className="font-medium">{t('import.complete')}</p>
          <Button variant="outline" onClick={handleReset}>
            {t('import.importMore')}
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveSession } from '@/contexts/ActiveSessionContext';
import { useOfflineStorage, generateTempId, type PendingBoulderLog } from '@/hooks/useOfflineStorage';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SessionExitConfirmation } from '@/components/SessionExitConfirmation';
import { X, Mountain, Plus, Minus, Timer, Save, Tag, Loader2, AlertTriangle, CheckCircle2, WifiOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { computeSessionZones } from '@/lib/analytics';
import { logError } from '@/lib/errorLogger';
import { updateWeeklyAggregate } from '@/lib/sessionAggregates';

type BoulderLog = Database['public']['Tables']['boulder_logs']['Row'];
type GradeMapping = Database['public']['Tables']['gym_grade_mappings']['Row'];
type Gym = Database['public']['Tables']['gyms']['Row'];

// Each boulder is an individual record with count=1
interface IndividualBoulder {
  id: string; // Temporary ID or DB ID
  grade_raw: string;
  grade_type: Database['public']['Enums']['grading_type'];
  tags: string[];
  notes: string;
  created_at: number; // Timestamp for ordering (LIFO deletion)
  isNew?: boolean; // Track if created in this session
}

const COMMON_TAGS = ['Flash', 'Top', 'Project', 'Slab', 'Overhang', 'Dyno', 'Crimp', 'Pinch', 'Volume'];

export default function BoulderSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { isOnline, cacheData, getCachedData, completeSessionOffline, deletePendingSession, getPendingSessions } = useOfflineStorage();
  
  // Check if this is an offline session
  const isOfflineSession = sessionId?.startsWith('offline-');
  const offlineTempId = isOfflineSession ? sessionId.replace('offline-', '') : null;
  
  // Individual boulder records (each with count=1)
  const [boulders, setBoulders] = useState<IndividualBoulder[]>([]);
  const [deletedBoulderIds, setDeletedBoulderIds] = useState<Set<string>>(new Set());
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [editingBoulder, setEditingBoulder] = useState<IndividualBoulder | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [rpe, setRpe] = useState<number>(5);
  const [fingerFatigue, setFingerFatigue] = useState<number>(5);
  const [painFlag, setPainFlag] = useState(false);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [painArea, setPainArea] = useState<string | null>(null);
  const [painNote, setPainNote] = useState('');
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [flashCount, setFlashCount] = useState(0);
  
  // Timer: use persisted start time or session date_start to survive app restores
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  
  // Session persistence
  const { clearActiveSession } = useActiveSession();
  const { saveSessionState, loadSessionState, clearSessionState, registerActiveSession } = useSessionPersistence(sessionId);
  
  // Offline state
  const [offlineGym, setOfflineGym] = useState<Gym | null>(null);
  const [offlineGradeMappings, setOfflineGradeMappings] = useState<GradeMapping[]>([]);

  // Fetch session (only for online sessions)
  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, session_gyms(gym_id)')
        .eq('id', sessionId!)
        .single();
      return data;
    },
    enabled: !!sessionId && !isOfflineSession,
  });

  // Fetch gym and grade mappings (only for online sessions)
  const gymId = session?.session_gyms?.[0]?.gym_id;
  
  const { data: gym } = useQuery({
    queryKey: ['gym', gymId],
    queryFn: async () => {
      const { data } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', gymId!)
        .single();
      return data;
    },
    enabled: !!gymId && !isOfflineSession,
  });

  const { data: gradeMappings } = useQuery({
    queryKey: ['gym_grade_mappings', gymId],
    queryFn: async () => {
      const { data } = await supabase
        .from('gym_grade_mappings')
        .select('*')
        .eq('gym_id', gymId!)
        .order('order_index');
      return data || [];
    },
    enabled: !!gymId && !isOfflineSession,
  });

  // Load offline session data
  useEffect(() => {
    if (isOfflineSession && offlineTempId && user) {
      getPendingSessions().then(async (sessions) => {
        const pendingSession = sessions.find(s => s.tempId === offlineTempId);
        if (pendingSession?.gym_id) {
          const cachedGyms = await getCachedData<Gym[]>(`gyms_${user.id}`);
          const foundGym = cachedGyms?.find(g => g.id === pendingSession.gym_id);
          if (foundGym) {
            setOfflineGym(foundGym);
            const cachedMappings = await getCachedData<GradeMapping[]>(`grade_mappings_${foundGym.id}`);
            if (cachedMappings?.length) {
              setOfflineGradeMappings(cachedMappings);
            }
          }
        }
      });
    }
  }, [isOfflineSession, offlineTempId, user, getPendingSessions, getCachedData]);

  // Cache grade mappings when online
  useEffect(() => {
    if (gradeMappings?.length && gymId && isOnline) {
      cacheData(`grade_mappings_${gymId}`, gradeMappings);
    }
  }, [gradeMappings, gymId, isOnline, cacheData]);

  // Use offline data if in offline session
  const activeGym = isOfflineSession ? offlineGym : gym;
  const activeGradeMappings = isOfflineSession ? offlineGradeMappings : gradeMappings;
  
  // Fetch existing boulder logs (only for online sessions)
  const { data: existingLogs } = useQuery({
    queryKey: ['boulder_logs', sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('boulder_logs')
        .select('*')
        .eq('session_id', sessionId!);
      return data || [];
    },
    enabled: !!sessionId && !isOfflineSession,
  });

  // Initialize boulders from existing data (online)
  // Each existing log becomes individual boulders based on count
  useEffect(() => {
    if (existingLogs?.length && activeGradeMappings?.length && boulders.length === 0) {
      const loadedBoulders: IndividualBoulder[] = [];
      
      existingLogs.forEach(log => {
        // For legacy data with count > 1, create multiple individual records
        // Note: in the new model, each row should have count=1
        // But we handle legacy by expanding
        const countToExpand = log.count || 1;
        for (let i = 0; i < countToExpand; i++) {
          loadedBoulders.push({
            id: countToExpand === 1 ? log.id : `${log.id}_${i}`,
            grade_raw: log.grade_raw,
            grade_type: log.grade_type,
            tags: log.tags || [],
            notes: log.notes || '',
            created_at: new Date(log.created_at).getTime() + i,
            isNew: false,
          });
        }
      });
      
      setBoulders(loadedBoulders);
    }
  }, [existingLogs, activeGradeMappings, boulders.length]);

  // Register active session when component mounts
  useEffect(() => {
    if (sessionId && activeGym) {
      // Use session.date_start if online session, otherwise use current time
      const startTime = session?.date_start ? new Date(session.date_start) : new Date();
      setSessionStartTime(startTime);
      
      registerActiveSession({
        sessionId,
        sessionType: 'on_wall',
        gymId: activeGym.id,
        gymName: activeGym.name,
        isOffline: isOfflineSession,
        route: `/session/${sessionId}/boulders`,
        startTime: startTime.toISOString(),
      });
    }
  }, [sessionId, activeGym, session?.date_start, isOfflineSession, registerActiveSession]);
  
  // Timer update interval - derived from persisted start time
  useEffect(() => {
    if (!sessionStartTime) return;
    
    const updateTimer = () => {
      const mins = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000);
      setElapsedMinutes(mins);
    };
    
    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Save session state periodically (including failed attempts and flash count)
  useEffect(() => {
    if (boulders.length > 0 || deletedBoulderIds.size > 0 || failedAttempts > 0 || flashCount > 0) {
      saveSessionState({
        boulders,
        deletedBoulderIds: Array.from(deletedBoulderIds),
        sessionNotes,
        rpe,
        fingerFatigue,
        painFlag,
        failedAttempts,
        flashCount,
      });
    }
  }, [boulders, deletedBoulderIds, sessionNotes, rpe, fingerFatigue, painFlag, failedAttempts, flashCount, saveSessionState]);

  // Load saved session state on mount (restore timer start time, failed attempts, flash count)
  useEffect(() => {
    const savedState = loadSessionState();
    if (savedState) {
      if (savedState.boulders && boulders.length === 0) {
        setBoulders(savedState.boulders as IndividualBoulder[]);
      }
      if (savedState.deletedBoulderIds) {
        setDeletedBoulderIds(new Set(savedState.deletedBoulderIds as string[]));
      }
      if (savedState.sessionNotes) setSessionNotes(savedState.sessionNotes);
      if (savedState.rpe) setRpe(savedState.rpe);
      if (savedState.fingerFatigue) setFingerFatigue(savedState.fingerFatigue);
      if (savedState.painFlag !== undefined) setPainFlag(savedState.painFlag);
      if (savedState.failedAttempts !== undefined) setFailedAttempts(savedState.failedAttempts as number);
      if (savedState.flashCount !== undefined) setFlashCount(savedState.flashCount as number);
    }
  }, [loadSessionState]);

  // Aggregate boulders by grade for display
  const aggregatedByGrade = useMemo(() => {
    const agg: Record<string, { count: number; boulders: IndividualBoulder[] }> = {};
    
    // Initialize with all grade mappings
    activeGradeMappings?.forEach(m => {
      agg[m.label] = { count: 0, boulders: [] };
    });
    
    // Count non-deleted boulders
    boulders.forEach(b => {
      if (!deletedBoulderIds.has(b.id)) {
        if (!agg[b.grade_raw]) {
          agg[b.grade_raw] = { count: 0, boulders: [] };
        }
        agg[b.grade_raw].count++;
        agg[b.grade_raw].boulders.push(b);
      }
    });
    
    // Sort boulders by created_at (newest first for display)
    Object.values(agg).forEach(g => {
      g.boulders.sort((a, b) => b.created_at - a.created_at);
    });
    
    return agg;
  }, [boulders, deletedBoulderIds, activeGradeMappings]);

  const addBoulder = useCallback((gradeRaw: string) => {
    if (!activeGym) return;
    
    const newBoulder: IndividualBoulder = {
      id: generateTempId(),
      grade_raw: gradeRaw,
      grade_type: activeGym.grading_type,
      tags: [],
      notes: '',
      created_at: Date.now(),
      isNew: true,
    };
    
    setBoulders(prev => [...prev, newBoulder]);
  }, [activeGym]);

  const removeBoulder = useCallback((gradeRaw: string) => {
    // Remove the most recently added boulder for this grade (LIFO)
    const gradeBoulders = aggregatedByGrade[gradeRaw]?.boulders || [];
    if (gradeBoulders.length === 0) return;
    
    // Most recent is first (sorted by created_at desc)
    const toRemove = gradeBoulders[0];
    setDeletedBoulderIds(prev => new Set([...prev, toRemove.id]));
  }, [aggregatedByGrade]);

  const updateBoulder = useCallback((boulderId: string, updates: Partial<IndividualBoulder>) => {
    setBoulders(prev => prev.map(b => 
      b.id === boulderId ? { ...b, ...updates } : b
    ));
  }, []);

  const toggleBoulderTag = useCallback((boulderId: string, tag: string) => {
    setBoulders(prev => prev.map(b => {
      if (b.id !== boulderId) return b;
      const currentTags = b.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      return { ...b, tags: newTags };
    }));
  }, []);

  const deleteSingleBoulder = useCallback((boulderId: string) => {
    setDeletedBoulderIds(prev => new Set([...prev, boulderId]));
    setEditingBoulder(null);
  }, []);

  const totalBoulders = useMemo(() => 
    Object.values(aggregatedByGrade).reduce((sum, g) => sum + g.count, 0),
    [aggregatedByGrade]
  );
  
  // Derived flash count from tags is for analytics; sessionFlashCount is the manual counter
  const tagFlashCount = useMemo(() => {
    let count = 0;
    for (const g of Object.values(aggregatedByGrade)) {
      for (const b of g.boulders) {
        if (b.tags.includes('Flash')) count++;
      }
    }
    return count;
  }, [aggregatedByGrade]);

  const endSession = async () => {
    if (!user || !activeGym || !activeGradeMappings) return;
    
    // Validation: require at least one boulder
    if (totalBoulders === 0) {
      toast({ 
        title: t('session.cannotEndEmpty', 'Cannot end empty session'),
        description: t('session.addAtLeastOneBoulder', 'Add at least one boulder before ending the session.'),
        variant: 'destructive' 
      });
      return;
    }
    
    setSaving(true);

    // Get all non-deleted boulders
    const activeBoulders = boulders.filter(b => !deletedBoulderIds.has(b.id));
    
    // Create boulder_logs records (each with count=1)
    const logsToSave = activeBoulders.map(b => ({
      grade_type: b.grade_type,
      grade_raw: b.grade_raw,
      count: 1, // Always 1 per boulder
      tags: b.tags.length > 0 ? b.tags : null,
      notes: b.notes || null,
    }));

    try {
      if (isOfflineSession && offlineTempId) {
        // OFFLINE: Save to IndexedDB
        const logsWithIds: Omit<PendingBoulderLog, 'sessionTempId'>[] = logsToSave.map((log, idx) => ({
          id: `${offlineTempId}_log_${idx}`,
          grade_raw: log.grade_raw,
          grade_type: log.grade_type,
          count: 1,
          tags: log.tags || undefined,
          notes: log.notes || undefined,
        }));
          
        const saved = await completeSessionOffline(offlineTempId, {
          date_end: new Date().toISOString(), notes: sessionNotes || undefined,
          rpe, finger_fatigue: fingerFatigue, pain_flag: painFlag,
          pain_level: painFlag ? painLevel : null, pain_area: painFlag ? painArea : null,
          pain_note: painFlag ? (painNote || null) : null,
          failed_attempts: failedAttempts, flash_count: flashCount,
        }, { logs: logsWithIds });
        if (!saved) throw new Error('Failed to save session offline');
        
        sonnerToast.success('Session saved offline', {
          description: `${totalBoulders} boulders logged. Will sync when online.`,
        });
        clearSessionState();
        navigate('/');
      } else {
        // ONLINE: Save to Supabase
        if (!sessionId) return;
        
        // Delete all existing logs for this session
        await supabase.from('boulder_logs').delete().eq('session_id', sessionId);
        
        // Insert new individual boulder records
        if (logsToSave.length > 0) {
          const logsToInsert = logsToSave.map(log => ({
            ...log,
            session_id: sessionId,
          }));
          await supabase.from('boulder_logs').insert(logsToInsert);
        }

        // Update session metadata with status='completed'
        await supabase.from('sessions').update({
          date_end: new Date().toISOString(),
          status: 'completed', // Mark as completed for Session History
          notes: sessionNotes || null,
          rpe,
          finger_fatigue: fingerFatigue,
          pain_flag: painFlag,
          pain_level: painFlag ? painLevel : null,
          pain_area: painFlag ? painArea : null,
          pain_note: painFlag ? (painNote || null) : null,
          failed_attempts: failedAttempts,
          flash_count: flashCount,
        }).eq('id', sessionId);

        // Compute and save zone summary
        const zonesInput = logsToSave.map(l => ({ grade_raw: l.grade_raw, count: 1 }));
        const zones = computeSessionZones(zonesInput, activeGradeMappings, user.id);
        
        await supabase.from('session_zone_summaries').delete().eq('session_id', sessionId);
        await supabase.from('session_zone_summaries').insert({
          session_id: sessionId,
          comfort_pct: zones.comfort_pct,
          growth_pct: zones.growth_pct,
          limit_pct: zones.limit_pct,
        });

        // Update weekly aggregates for performance
        await updateWeeklyAggregate({
          sessionId,
          userId: user.id,
          sessionType: 'on_wall',
          dateStart: session?.date_start || new Date().toISOString(),
          boulderCount: totalBoulders,
          hasPain: painFlag,
        });

        await queryClient.invalidateQueries({ queryKey: ['sessions'] });
        toast({ 
          title: 'Session saved!', 
          description: `${totalBoulders} boulders logged` 
        });
        clearSessionState();
        navigate('/analytics');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      logError('session_finish', 'Failed to save boulder session', { error, userId: user?.id });
      toast({ 
        title: 'Error', 
        description: 'Failed to save session', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelClick = () => {
    setExitConfirmOpen(true);
  };

  const confirmDiscard = async () => {
    setExitConfirmOpen(false);
    clearSessionState();
    if (isOfflineSession && offlineTempId) {
      await deletePendingSession(offlineTempId);
    } else if (sessionId) {
      await supabase.from('sessions').delete().eq('id', sessionId);
    }
    navigate('/');
  };

  // Called after successful save
  const onSessionSaved = () => {
    clearSessionState();
  };

  if (!activeGradeMappings?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Exit confirmation dialog */}
      <SessionExitConfirmation
        open={exitConfirmOpen}
        onOpenChange={setExitConfirmOpen}
        onConfirmDiscard={confirmDiscard}
        onContinue={() => setExitConfirmOpen(false)}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={handleCancelClick}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm">{activeGym?.name}</h1>
              {isOfflineSession && (
                <span className="flex items-center gap-1 text-xs text-amber-500">
                  <WifiOff className="h-3 w-3" />
                  {t('session.offline')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Timer className="h-3 w-3" />
              {elapsedMinutes} {t('session.minutes')}
              <span className="mx-1">•</span>
              <Mountain className="h-3 w-3" />
              {totalBoulders} {t('session.boulders')}
            </div>
          </div>
          <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-zone-growth hover:bg-zone-growth/90">
                <Save className="mr-2 h-4 w-4" />
                {t('session.end')}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-h-[calc(100dvh-1rem)] max-w-md overflow-y-auto p-4 sm:max-h-[calc(100dvh-2rem)] sm:p-6">
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
                painLevel={painLevel}
                setPainLevel={setPainLevel}
                painArea={painArea}
                setPainArea={setPainArea}
                painNote={painNote}
                setPainNote={setPainNote}
                totalBoulders={totalBoulders}
                elapsedMinutes={elapsedMinutes}
                onSave={endSession}
                saving={saving}
                t={t}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Global Counters Bar */}
      <div className="sticky top-14 z-30 glass border-b border-border/50 py-2">
        <div className="container px-4 flex items-center justify-center gap-6">
          {/* Failed Attempts Counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('session.failedAttempts')}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFailedAttempts(Math.max(0, failedAttempts - 1))}
                disabled={failedAttempts === 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-mono text-sm">{failedAttempts}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFailedAttempts(failedAttempts + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Flash Counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('session.flashCounter')}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFlashCount(Math.max(0, flashCount - 1))}
                disabled={flashCount === 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-mono text-sm">{flashCount}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFlashCount(flashCount + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Boulder Logging Grid */}
      <main className="container px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activeGradeMappings.map((mapping) => {
            const gradeData = aggregatedByGrade[mapping.label];
            const count = gradeData?.count || 0;
            const hasCount = count > 0;
            
            return (
              <Card 
                key={mapping.id} 
                className={`relative overflow-hidden transition-all ${hasCount ? 'ring-2 ring-primary/50' : ''}`}
                style={{
                  // Readable background: use a subtle tint of the color with proper opacity for dark mode
                  background: mapping.color_hex 
                    ? `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 100%)`
                    : undefined,
                  borderLeftColor: mapping.color_hex || undefined,
                  borderLeftWidth: mapping.color_hex ? '4px' : undefined,
                }}
              >
                {/* Color accent header bar - visible but not overwhelming */}
                {mapping.color_hex && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: mapping.color_hex }}
                  />
                )}
                
                <CardContent className="p-3 pt-4">
                  {/* Grade label + details button */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Color badge for visual identification */}
                      {mapping.color_hex && (
                        <span 
                          className="w-4 h-4 rounded-full shrink-0 ring-1 ring-border"
                          style={{ backgroundColor: mapping.color_hex }}
                        />
                      )}
                      <span className="font-bold text-lg text-foreground">
                        {mapping.label}
                      </span>
                    </div>
                    
                    {/* Open detail drawer to view/edit individual boulders */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => setEditingGrade(mapping.label)}
                          disabled={!hasCount}
                        >
                          <Tag className="h-3 w-3" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="glass h-[70vh]">
                        <SheetHeader>
                          <SheetTitle className="flex items-center gap-2">
                            <span style={{ color: mapping.color_hex || undefined }}>
                              {mapping.label}
                            </span>
                            <span className="text-muted-foreground font-normal">
                              — {count} {t('session.boulders')}
                            </span>
                          </SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-full py-4">
                          <div className="space-y-3">
                            {gradeData?.boulders.map((boulder, idx) => (
                              <BoulderInstanceCard
                                key={boulder.id}
                                boulder={boulder}
                                index={count - idx}
                                onToggleTag={(tag) => toggleBoulderTag(boulder.id, tag)}
                                onSetNotes={(notes) => updateBoulder(boulder.id, { notes })}
                                onDelete={() => deleteSingleBoulder(boulder.id)}
                                t={t}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>
                  </div>
                  
                  {/* Counter */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => removeBoulder(mapping.label)}
                      disabled={!hasCount}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div 
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono text-2xl font-bold transition-all ${
                        hasCount ? 'animate-counter bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                      key={count}
                    >
                      {count}
                    </div>
                    
                    <Button
                      variant="default"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => addBoulder(mapping.label)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Tags indicator - show unique tags across all boulders in this grade */}
                  {hasCount && (
                    <BoulderTagsSummary boulders={gradeData.boulders} />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// Component to show summary of tags across all boulders of a grade
function BoulderTagsSummary({ boulders }: { boulders: IndividualBoulder[] }) {
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    boulders.forEach(b => {
      b.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [boulders]);

  if (tagCounts.length === 0) return null;

  return (
    <div className="flex gap-1 mt-2 flex-wrap">
      {tagCounts.slice(0, 2).map(([tag, count]) => (
        <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
          {tag}{count > 1 ? ` ×${count}` : ''}
        </span>
      ))}
      {tagCounts.length > 2 && (
        <span className="text-xs text-muted-foreground">+{tagCounts.length - 2}</span>
      )}
    </div>
  );
}

// Component for editing a single boulder instance
function BoulderInstanceCard({
  boulder,
  index,
  onToggleTag,
  onSetNotes,
  onDelete,
  t,
}: {
  boulder: IndividualBoulder;
  index: number;
  onToggleTag: (tag: string) => void;
  onSetNotes: (notes: string) => void;
  onDelete: () => void;
  t: (key: string) => string;
}) {
  return (
    <Card className="bg-secondary/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{t('session.boulder')} #{index}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Tags */}
        <div>
          <Label className="text-xs text-muted-foreground">{t('session.tags')}</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {COMMON_TAGS.map(tag => (
              <Button
                key={tag}
                variant={boulder.tags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => onToggleTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <Label className="text-xs text-muted-foreground">{t('session.notes')}</Label>
          <Textarea
            placeholder={t('session.betaObservations')}
            value={boulder.notes}
            onChange={(e) => onSetNotes(e.target.value)}
            className="mt-1.5 text-sm"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
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
  painLevel,
  setPainLevel,
  painArea,
  setPainArea,
  painNote,
  setPainNote,
  totalBoulders,
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
  painLevel: number | null;
  setPainLevel: (v: number | null) => void;
  painArea: string | null;
  setPainArea: (v: string | null) => void;
  painNote: string;
  setPainNote: (v: string) => void;
  totalBoulders: number;
  elapsedMinutes: number;
  onSave: () => void;
  saving: boolean;
  t: (key: string) => string;
}) {
  const painAreas = [
    { value: 'fingers', label: t('session.painAreas.fingers') },
    { value: 'elbow', label: t('session.painAreas.elbow') },
    { value: 'shoulder', label: t('session.painAreas.shoulder') },
    { value: 'back', label: t('session.painAreas.back') },
    { value: 'wrist', label: t('session.painAreas.wrist') },
    { value: 'knee', label: t('session.painAreas.knee') },
    { value: 'other', label: t('session.painAreas.other') },
  ];

  return (
    <div className="space-y-6 pb-2">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
        <CheckCircle2 className="h-8 w-8 text-zone-growth" />
        <div>
          <p className="font-semibold">{totalBoulders} {t('session.boulders')}</p>
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
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            variant={painFlag ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setPainFlag(!painFlag)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {painFlag ? t('session.painReported') : t('session.reportPain')}
          </Button>
        </div>

        {/* Pain Details (shown when pain_flag is true) */}
        {painFlag && (
          <div className="space-y-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            {/* Pain Level */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm">{t('session.painLevel')}</Label>
                <span className="font-mono text-sm text-destructive">
                  {painLevel ?? '-'}/5
                </span>
              </div>
              <Slider
                value={[painLevel ?? 1]}
                onValueChange={([v]) => setPainLevel(v)}
                min={1}
                max={5}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                {t('session.painLevelDesc')}
              </p>
            </div>

            {/* Pain Area */}
            <div className="space-y-2">
              <Label className="text-sm">{t('session.painArea')}</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={painArea ?? ''}
                onChange={(e) => setPainArea(e.target.value || null)}
              >
                <option value="">{t('session.selectPainArea')}</option>
                {painAreas.map((area) => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pain Note */}
            <div className="space-y-2">
              <Label className="text-sm">
                {t('session.painNote')} <span className="text-muted-foreground">({t('common.optional')})</span>
              </Label>
              <Textarea
                placeholder={t('session.painNotePlaceholder')}
                value={painNote}
                onChange={(e) => setPainNote(e.target.value)}
                className="h-16"
              />
            </div>
          </div>
        )}
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

      <Button className="w-full" onClick={onSave} disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('session.saveSession')}
      </Button>
    </div>
  );
}

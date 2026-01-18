import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChevronLeft, Plus, Loader2, Trash2, Search, Clock, 
  Repeat, Settings2, User, Globe, Timer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';

type Protocol = Database['public']['Tables']['protocols']['Row'];

interface ProtocolParams {
  work_duration_sec?: number;
  rest_duration_sec?: number;
  sets?: number;
  reps?: number;
  hold_sec?: number;
  rest_between_sets_sec?: number;
  notes?: string;
}

export default function Protocols() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProtocol, setNewProtocol] = useState({
    name: '',
    work_duration_sec: '',
    rest_duration_sec: '',
    sets: '',
    hold_sec: '',
    notes: '',
  });

  // Fetch all protocols
  const { data: protocols, isLoading } = useQuery({
    queryKey: ['protocols', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('protocols')
        .select('*')
        .or(`is_system.eq.true,user_id.eq.${user!.id}`)
        .order('is_system', { ascending: false })
        .order('name');
      return data || [];
    },
    enabled: !!user,
  });

  const createProtocol = useMutation({
    mutationFn: async () => {
      const params: { [key: string]: string | number | boolean | null } = {};
      if (newProtocol.work_duration_sec) params.work_duration_sec = Number(newProtocol.work_duration_sec);
      if (newProtocol.rest_duration_sec) params.rest_duration_sec = Number(newProtocol.rest_duration_sec);
      if (newProtocol.sets) params.sets = Number(newProtocol.sets);
      if (newProtocol.hold_sec) params.hold_sec = Number(newProtocol.hold_sec);
      if (newProtocol.notes) params.notes = newProtocol.notes;

      const { error } = await supabase.from('protocols').insert([{
        user_id: user!.id,
        name: newProtocol.name,
        params_json: params,
        is_system: false,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
      setCreateDialogOpen(false);
      setNewProtocol({ name: '', work_duration_sec: '', rest_duration_sec: '', sets: '', hold_sec: '', notes: '' });
      toast({ title: t('protocols.created') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: String(error), variant: 'destructive' });
    },
  });

  const deleteProtocol = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('protocols').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
      toast({ title: t('protocols.deleted') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: String(error), variant: 'destructive' });
    },
  });

  // Filter protocols
  const filteredProtocols = protocols?.filter(p => 
    searchQuery === '' || 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const systemProtocols = filteredProtocols.filter(p => p.is_system);
  const userProtocols = filteredProtocols.filter(p => !p.is_system);

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-2 max-w-full">
          <Link to="/exercises">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{t('protocols.title')}</h1>
            <p className="text-xs text-muted-foreground truncate">{t('protocols.subtitle')}</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="shrink-0 px-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">{t('protocols.add')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('protocols.createProtocol')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>{t('protocols.protocolName')} *</Label>
                  <Input
                    placeholder={t('protocols.protocolNamePlaceholder')}
                    value={newProtocol.name}
                    onChange={(e) => setNewProtocol(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {t('protocols.workDuration')}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 7"
                      value={newProtocol.work_duration_sec}
                      onChange={(e) => setNewProtocol(prev => ({ ...prev, work_duration_sec: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t('protocols.restDuration')}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 3"
                      value={newProtocol.rest_duration_sec}
                      onChange={(e) => setNewProtocol(prev => ({ ...prev, rest_duration_sec: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      {t('protocols.sets')}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 6"
                      value={newProtocol.sets}
                      onChange={(e) => setNewProtocol(prev => ({ ...prev, sets: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {t('protocols.holdDuration')}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={newProtocol.hold_sec}
                      onChange={(e) => setNewProtocol(prev => ({ ...prev, hold_sec: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('protocols.notes')}</Label>
                  <Textarea
                    placeholder={t('protocols.notesPlaceholder')}
                    value={newProtocol.notes}
                    onChange={(e) => setNewProtocol(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => createProtocol.mutate()}
                  disabled={!newProtocol.name || createProtocol.isPending}
                >
                  {createProtocol.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('protocols.createProtocol')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container px-4 py-4 space-y-4 max-w-full">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('protocols.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* User Protocols */}
            {userProtocols.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  {t('protocols.yourProtocols')}
                </div>
                {userProtocols.map((protocol) => (
                  <ProtocolCard
                    key={protocol.id}
                    protocol={protocol}
                    onDelete={() => deleteProtocol.mutate(protocol.id)}
                    canDelete
                    t={t}
                  />
                ))}
              </div>
            )}

            {/* System Protocols */}
            {systemProtocols.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  {t('protocols.systemProtocols')}
                </div>
                {systemProtocols.map((protocol) => (
                  <ProtocolCard
                    key={protocol.id}
                    protocol={protocol}
                    canDelete={false}
                    t={t}
                  />
                ))}
              </div>
            )}

            {filteredProtocols.length === 0 && (
              <Card className="glass text-center py-12">
                <CardContent>
                  <Settings2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? t('protocols.noMatch') : t('protocols.noProtocols')}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('protocols.protocolsExplain')}
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('protocols.createProtocol')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ProtocolCard({
  protocol,
  onDelete,
  canDelete,
  t,
}: {
  protocol: Protocol;
  onDelete?: () => void;
  canDelete: boolean;
  t: (key: string) => string;
}) {
  const params = protocol.params_json as ProtocolParams | null;
  
  // Build timing summary
  const timingParts: string[] = [];
  if (params?.work_duration_sec && params?.rest_duration_sec) {
    timingParts.push(`${params.work_duration_sec}/${params.rest_duration_sec}`);
  } else if (params?.hold_sec) {
    timingParts.push(`${params.hold_sec}s ${t('protocols.hold')}`);
  }
  if (params?.sets) {
    timingParts.push(`${params.sets} ${t('protocols.sets').toLowerCase()}`);
  }
  
  const timingSummary = timingParts.join(' • ') || t('protocols.noTimingDefined');

  return (
    <Card className="glass">
      <CardContent className="p-3 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          protocol.is_system ? 'bg-secondary' : 'bg-primary/20'
        }`}>
          <Settings2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{protocol.name}</p>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            {timingSummary}
          </p>
          {params?.notes && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{params.notes}</p>
          )}
        </div>
        {canDelete && onDelete && (
          <Button 
            variant="ghost" 
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineStorage, generateTempId } from '@/hooks/useOfflineStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Mountain, Dumbbell, MapPin, Loader2, ChevronRight, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type SessionType = Database['public']['Enums']['session_type'];
type Gym = Database['public']['Tables']['gyms']['Row'];

export default function SessionNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type') as SessionType | null;
  const { isOnline, cacheData, getCachedData, saveSessionOffline } = useOfflineStorage();
  
  const [sessionType, setSessionType] = useState<SessionType | null>(preselectedType);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [cachedGyms, setCachedGyms] = useState<Gym[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  // Fetch gyms from Supabase when online
  const { data: gyms, isLoading } = useQuery({
    queryKey: ['gyms', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('gyms')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');
      return data || [];
    },
    enabled: !!user && isOnline,
  });

  // Cache gyms for offline use
  useEffect(() => {
    if (gyms?.length && isOnline) {
      cacheData(`gyms_${user?.id}`, gyms);
    }
  }, [gyms, user?.id, isOnline, cacheData]);

  // Load cached gyms when offline
  useEffect(() => {
    if (!isOnline && user) {
      getCachedData<Gym[]>(`gyms_${user.id}`).then((cached) => {
        if (cached) setCachedGyms(cached);
      });
    }
  }, [isOnline, user, getCachedData]);

  const availableGyms = isOnline ? gyms : cachedGyms;

  const startSession = async () => {
    if (!user || !sessionType) return;
    setIsStarting(true);
    
    try {
      if (isOnline) {
        const { data: session, error } = await supabase
          .from('sessions')
          .insert({
            user_id: user.id,
            session_type: sessionType,
            date_start: new Date().toISOString(),
          })
          .select('id')
          .single();
        
        if (error || !session) {
          throw new Error('Failed to create session');
        }
        
        if (sessionType === 'on_wall' && selectedGym) {
          await supabase.from('session_gyms').insert({
            session_id: session.id,
            gym_id: selectedGym.id,
          });
        }
        
        if (sessionType === 'on_wall') {
          navigate(`/session/${session.id}/boulders`);
        } else {
          navigate(`/session/${session.id}/strength`);
        }
      } else {
        const tempId = generateTempId();
        
        await saveSessionOffline({
          id: '',
          tempId,
          user_id: user.id,
          session_type: sessionType,
          date_start: new Date().toISOString(),
          gym_id: selectedGym?.id,
        });
        
        toast.info(t('session.startingOffline'), {
          description: t('session.willSyncOnline'),
        });
        
        if (sessionType === 'on_wall') {
          navigate(`/session/offline-${tempId}/boulders`);
        } else {
          navigate(`/session/offline-${tempId}/strength`);
        }
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error(t('session.failedToStart'));
    } finally {
      setIsStarting(false);
    }
  };

  // Step 1: Select session type
  if (!sessionType) {
    return (
      <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="container flex items-center h-14 px-4 gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold">{t('session.newSession')}</h1>
          </div>
        </header>

        <main className="container px-4 py-6 space-y-4">
          <p className="text-muted-foreground">{t('session.whatTypeToday')}</p>
          
          <div className="grid gap-4">
            <Card 
              className="glass cursor-pointer hover:border-session-on-wall/50 transition-all"
              onClick={() => setSessionType('on_wall')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-session-on-wall flex items-center justify-center">
                  <Mountain className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t('dashboard.boulderingSession')}</h3>
                  <p className="text-sm text-muted-foreground">{t('session.logByGrade')}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card 
              className="glass cursor-pointer hover:border-session-off-wall/50 transition-all"
              onClick={() => setSessionType('off_wall')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-session-off-wall flex items-center justify-center">
                  <Dumbbell className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t('dashboard.strengthSession')}</h3>
                  <p className="text-sm text-muted-foreground">{t('session.exercisesSetsReps')}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Step 2: For ON-WALL, select gym
  if (sessionType === 'on_wall' && !selectedGym) {
    return (
      <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="container flex items-center h-14 px-4 gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSessionType(null)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold">{t('session.selectGym')}</h1>
            {!isOnline && (
              <div className="ml-auto flex items-center gap-1 text-amber-500 text-xs">
                <WifiOff className="h-4 w-4" />
                {t('session.offline')}
              </div>
            )}
          </div>
        </header>

        <main className="container px-4 py-6 space-y-4">
          {isLoading && isOnline ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !availableGyms?.length ? (
            <Card className="glass text-center py-12">
              <CardContent>
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {isOnline ? t('session.noGymsConfigured') : t('session.noCachedGyms')}
                </p>
                {isOnline && (
                  <Link to="/gyms">
                    <Button>{t('session.addGymFirst')}</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {availableGyms.map((gym) => (
                <Card 
                  key={gym.id} 
                  className="glass cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => setSelectedGym(gym)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{gym.name}</h3>
                      {gym.city && <p className="text-sm text-muted-foreground">{gym.city}</p>}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Step 3: Confirm and start
  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => sessionType === 'on_wall' ? setSelectedGym(null) : setSessionType(null)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold">{t('session.startSession')}</h1>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <Card className="glass overflow-hidden">
          <div className={`h-2 ${sessionType === 'on_wall' ? 'bg-session-on-wall' : 'bg-session-off-wall'}`} />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${sessionType === 'on_wall' ? 'bg-session-on-wall' : 'bg-session-off-wall'} flex items-center justify-center`}>
                {sessionType === 'on_wall' ? (
                  <Mountain className="h-7 w-7 text-primary-foreground" />
                ) : (
                  <Dumbbell className="h-7 w-7 text-primary-foreground" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {sessionType === 'on_wall' ? t('dashboard.boulderingSession') : t('dashboard.strengthSession')}
                </h2>
                {selectedGym && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedGym.name}
                  </p>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {sessionType === 'on_wall' 
                ? t('session.logBouldersByTap')
                : t('session.addExercisesLogSets')}
            </p>
          </CardContent>
        </Card>

        <Button className="w-full h-14 text-lg" onClick={startSession} disabled={isStarting}>
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('session.starting')}
            </>
          ) : (
            <>
              {t('session.startTraining')}
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
        
        {!isOnline && (
          <p className="text-center text-sm text-amber-500 flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            {t('session.sessionWillSaveOffline')}
          </p>
        )}
      </main>
    </div>
  );
}

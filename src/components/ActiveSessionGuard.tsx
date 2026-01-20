import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useActiveSession } from '@/contexts/ActiveSessionContext';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Mountain, Dumbbell, Loader2 } from 'lucide-react';

export function ActiveSessionGuard() {
  const { t } = useTranslation();
  const { activeSession, restoreSession, clearActiveSession } = useActiveSession();
  const { deletePendingSession } = useOfflineStorage();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [hasShownRestore, setHasShownRestore] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  // Session route patterns
  const isSessionRoute = location.pathname.includes('/session/') && 
    (location.pathname.includes('/boulders') || location.pathname.includes('/strength'));

  // Show restore dialog when navigating away from session routes while having an active session
  useEffect(() => {
    if (activeSession && !isSessionRoute && !hasShownRestore) {
      // Check if current session matches stored session
      const storedSessionId = activeSession.sessionId;
      const currentPathSessionId = location.pathname.includes('/session/') 
        ? location.pathname.split('/session/')[1]?.split('/')[0] 
        : null;
      
      if (storedSessionId !== currentPathSessionId) {
        setShowDialog(true);
        setHasShownRestore(true);
      }
    }
  }, [activeSession, isSessionRoute, location.pathname, hasShownRestore]);

  // Reset shown state when session is cleared
  useEffect(() => {
    if (!activeSession) {
      setHasShownRestore(false);
    }
  }, [activeSession]);

  const handleContinueSession = () => {
    setShowDialog(false);
    restoreSession();
  };

  const handleDiscardSession = async () => {
    if (!activeSession) {
      setShowDialog(false);
      return;
    }

    setIsDiscarding(true);

    try {
      const sessionId = activeSession.sessionId;
      const isOfflineSession = sessionId.startsWith('offline-');

      if (isOfflineSession) {
        // Delete offline session from IndexedDB
        const offlineTempId = sessionId.replace('offline-', '');
        await deletePendingSession(offlineTempId);
      } else {
        // Delete online session from Supabase (including cascading boulder_logs, etc.)
        await supabase.from('boulder_logs').delete().eq('session_id', sessionId);
        await supabase.from('session_gyms').delete().eq('session_id', sessionId);
        await supabase.from('session_zone_summaries').delete().eq('session_id', sessionId);
        await supabase.from('session_items').delete().eq('session_id', sessionId);
        await supabase.from('sessions').delete().eq('id', sessionId);
      }

      // Clear local session persistence (localStorage)
      const sessionStateKey = `boulderlog_session_state_${sessionId}`;
      localStorage.removeItem(sessionStateKey);

      // Clear active session context
      clearActiveSession();

      setShowDialog(false);

      if (pendingNavigation) {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('Failed to discard session:', error);
      // Still clear the active session state to prevent being stuck
      clearActiveSession();
      setShowDialog(false);
    } finally {
      setIsDiscarding(false);
    }
  };

  if (!activeSession) return null;

  return (
    <AlertDialog open={showDialog} onOpenChange={(open) => !isDiscarding && setShowDialog(open)}>
      <AlertDialogContent className="glass">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-xl ${activeSession.sessionType === 'on_wall' ? 'bg-session-on-wall' : 'bg-session-off-wall'} flex items-center justify-center`}>
              {activeSession.sessionType === 'on_wall' ? (
                <Mountain className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Dumbbell className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <div>
              <AlertDialogTitle>{t('session.activeSessionFound')}</AlertDialogTitle>
              {activeSession.gymName && (
                <p className="text-sm text-muted-foreground">{activeSession.gymName}</p>
              )}
            </div>
          </div>
          <AlertDialogDescription>
            {t('session.activeSessionDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDiscardSession} disabled={isDiscarding}>
            {isDiscarding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.discarding', 'Discarding...')}
              </>
            ) : (
              t('session.discardSession')
            )}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleContinueSession} disabled={isDiscarding}>
            {t('session.continueSession')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

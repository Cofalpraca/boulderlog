import { useTranslation } from 'react-i18next';
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
import { AlertTriangle } from 'lucide-react';

interface SessionExitConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDiscard: () => void;
  onContinue: () => void;
}

export function SessionExitConfirmation({
  open,
  onOpenChange,
  onConfirmDiscard,
  onContinue,
}: SessionExitConfirmationProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle>{t('session.leaveSessionTitle')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {t('session.leaveSessionDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onContinue}>
            {t('session.keepTraining')}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmDiscard}
            className="bg-destructive hover:bg-destructive/90"
          >
            {t('session.discardAndLeave')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

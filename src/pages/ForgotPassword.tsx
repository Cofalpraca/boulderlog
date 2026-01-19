import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo-user.png';
import { useToast } from '@/hooks/use-toast';
export default function ForgotPassword() {
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: t('auth.errors.invalidEmail'),
        variant: 'destructive'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: t('auth.errors.invalidEmail'),
        variant: 'destructive'
      });
      return;
    }
    setSubmitting(true);
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`
    });
    if (error) {
      // Show user-friendly error message
      toast({
        title: t('auth.errors.resetFailed'),
        description: t('auth.errors.tryAgainLater'),
        variant: 'destructive'
      });
    } else {
      // Show success state - email sent
      setEmailSent(true);
    }
    setSubmitting(false);
  };
  if (emailSent) {
    return <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md glass">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t('auth.emailSent')}
            </CardTitle>
            <CardDescription className="text-base">
              {t('auth.checkInboxDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('auth.emailSentTo', {
              email
            })}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              {t('auth.checkSpam')}
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('auth.backToLogin')}
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center space-y-4">
          <img src={logo} alt="BoulderLog" className="mx-auto w-60 w-max-full object-contain" />
          <CardTitle className="text-2xl font-bold">
            {t('auth.resetPassword')}
          </CardTitle>
          <CardDescription>
            {t('auth.resetPasswordDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder={t('auth.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.sendResetEmail')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" onClick={() => navigate('/auth')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="inline mr-1 h-3 w-3" />
              {t('auth.backToLogin')}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>;
}
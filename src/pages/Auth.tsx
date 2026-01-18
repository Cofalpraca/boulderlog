import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Loader2 } from 'lucide-react';
import logo from '@/assets/logo-transparent.png';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetEmailSending, setResetEmailSending] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else if (!isLogin) {
      toast({ title: t('common.success'), description: t('auth.accountCreated') });
    }
    setSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: t('common.error'), description: t('auth.email'), variant: 'destructive' });
      return;
    }
    
    setResetEmailSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`
    });
    
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.emailSent'), description: t('auth.checkInbox') });
    }
    setResetEmailSending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center space-y-4">
          <img src={logo} alt="BoulderLog" className="mx-auto w-32 h-32 object-contain" />
          <CardTitle className="text-2xl font-bold">BoulderLog</CardTitle>
          <CardDescription>
            {isLogin ? t('auth.signInToTrack') : t('auth.createAccount')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? t('auth.signIn') : t('auth.signUp')}
            </Button>
          </form>
          <div className="mt-4 space-y-2 text-center">
            {isLogin && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetEmailSending}
                className="text-sm text-muted-foreground hover:text-primary transition-colors block w-full"
              >
                {resetEmailSending ? t('auth.sending') : t('auth.forgotPassword')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

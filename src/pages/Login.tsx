import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Loader2 } from 'lucide-react';
import logo from '@/assets/logo-user.png';
import { useToast } from '@/hooks/use-toast';

// Helper function to translate Supabase auth errors to friendly messages
const getAuthErrorMessage = (error: Error, t: (key: string) => string): string => {
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return t('auth.errors.invalidCredentials');
  }
  if (message.includes('email not confirmed')) {
    return t('auth.errors.emailNotConfirmed');
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return t('auth.errors.tooManyAttempts');
  }
  if (message.includes('network') || message.includes('fetch')) {
    return t('auth.errors.networkError');
  }
  return t('auth.errors.generic');
};

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: t('auth.errors.title'),
        description: getAuthErrorMessage(error, t),
        variant: 'destructive'
      });
    }
    
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center space-y-4">
          <img src={logo} alt="BoulderLog" className="mx-auto w-56 w-max-full object-contain" />
          <CardTitle className="text-2xl font-bold">BoulderLog</CardTitle>
          <CardDescription>{t('auth.signInToTrack')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.signIn')}
            </Button>
          </form>
          <div className="mt-4 space-y-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors block w-full"
            >
              {t('auth.forgotPassword')}
            </button>
            <Link
              to="/register"
              className="text-sm text-muted-foreground hover:text-primary transition-colors block"
            >
              {t('auth.noAccount')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Lock, Loader2, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthReset() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL for recovery token (Supabase sends tokens via URL hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        // Set the session from the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (error) {
          setError('Invalid or expired reset link. Please request a new one.');
          setValidSession(false);
        } else {
          setValidSession(true);
        }
      } else if (session) {
        // User is already logged in, allow password change
        setValidSession(true);
      } else {
        setError('No valid reset session found. Please request a new password reset link.');
        setValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSuccess(true);
      toast({ title: 'Success', description: 'Your password has been updated.' });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
    
    setSubmitting(false);
  };

  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
            <Mountain className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {success ? 'Password Updated' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {success 
              ? 'Your password has been successfully updated.'
              : error 
                ? error
                : 'Enter your new password below.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Reset link invalid</span>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Return to Login
              </Button>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-zone-comfort">
                <Check className="h-5 w-5" />
                <span className="text-sm">Redirecting to dashboard...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set New Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

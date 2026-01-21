import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Shield, Loader2, Check, MapPin, Mail, Lock, Palette, Globe, Sun, Moon, Monitor, Activity, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImportBoulderHistory } from '@/components/ImportBoulderHistory';
import type { Database } from '@/integrations/supabase/types';

// NOTE: preferred_grade is deprecated - user level is now computed automatically from boulder logs
// See src/lib/userLevel.ts for the computation logic

export default function Settings() {
  const { user, session } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [resetEmailSending, setResetEmailSending] = useState(false);

  // Fetch profile (preferred_grade is deprecated and no longer used)
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['settings_profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  // Save profile - only display_name is editable now (preferred_grade is deprecated)
  const handleProfileSave = async () => {
    if (!user || !displayName) return;
    setProfileSaving(true);
    setProfileSaved(false);

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id);

    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['settings_profile'] });
      setProfileSaved(true);
      toast({ title: t('settings.saved'), description: t('settings.profileInfo') });
      setTimeout(() => setProfileSaved(false), 2000);
    }
    setProfileSaving(false);
  };

  const handlePasswordReset = async () => {
    if (!session?.user.email) return;
    setResetEmailSending(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      session.user.email,
      { redirectTo: `${window.location.origin}/auth/reset` }
    );

    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.emailSent'), description: t('auth.checkInbox') });
    }
    setResetEmailSending(false);
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: t('common.error'), description: t('auth.passwordsNoMatch'), variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: t('common.error'), description: t('auth.passwordTooShort'), variant: 'destructive' });
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('common.success'), description: t('auth.passwordUpdated') });
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordSaving(false);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center h-14 px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">{t('settings.title')}</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-lg mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-1 text-xs sm:text-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.profile')}</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-1 text-xs sm:text-sm">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.import')}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1 text-xs sm:text-sm">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.appearance')}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1 text-xs sm:text-sm">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.security')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t('settings.profileInfo')}
                </CardTitle>
                <CardDescription>{t('settings.profileInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">{t('settings.displayName')}</Label>
                  <Input
                    id="displayName"
                    placeholder={t('settings.displayNamePlaceholder')}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  {t('settings.levelAutoComputed', 'Your climbing level is calculated automatically from your logged sessions.')}
                </p>

                <Button className="w-full" onClick={handleProfileSave} disabled={!displayName || profileSaving}>
                  {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : profileSaved ? <Check className="mr-2 h-4 w-4" /> : null}
                  {profileSaved ? t('settings.saved') : t('settings.saveProfile')}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {t('settings.gymConfiguration')}
                </CardTitle>
                <CardDescription>{t('settings.gymConfigurationDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/gyms">
                  <Button variant="outline" className="w-full">
                    <MapPin className="mr-2 h-4 w-4" />
                    {t('settings.manageGyms')}
                  </Button>
                </Link>
                <Link to="/mapping-health">
                  <Button variant="outline" className="w-full">
                    <Activity className="mr-2 h-4 w-4" />
                    {t('mappingHealth.title')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  {t('settings.importHistory')}
                </CardTitle>
                <CardDescription>{t('settings.importHistoryDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ImportBoulderHistory />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  {t('settings.theme')}
                </CardTitle>
                <CardDescription>{t('settings.themeDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="flex flex-col gap-2 h-auto py-4"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-xs">{t('settings.themeLight')}</span>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="flex flex-col gap-2 h-auto py-4"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-5 w-5" />
                    <span className="text-xs">{t('settings.themeDark')}</span>
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="flex flex-col gap-2 h-auto py-4"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="text-xs">{t('settings.themeSystem')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {t('settings.language')}
                </CardTitle>
                <CardDescription>{t('settings.languageDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={i18n.language === 'en' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('en')}
                  >
                    🇬🇧 {t('settings.english')}
                  </Button>
                  <Button
                    variant={i18n.language === 'pl' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('pl')}
                  >
                    🇵🇱 {t('settings.polish')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {t('settings.accountEmail')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded-md">
                  {session?.user.email}
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  {t('settings.resetPasswordTitle')}
                </CardTitle>
                <CardDescription>{t('settings.resetPasswordDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={handlePasswordReset} disabled={resetEmailSending}>
                  {resetEmailSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('auth.sendResetEmail')}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {t('settings.changePassword')}
                </CardTitle>
                <CardDescription>{t('settings.changePasswordDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder={t('auth.newPassword')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('auth.confirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
                <Button className="w-full" onClick={handlePasswordUpdate} disabled={!newPassword || !confirmPassword || passwordSaving}>
                  {passwordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('auth.updatePassword')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

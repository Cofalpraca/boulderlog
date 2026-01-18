import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Dumbbell, BarChart3, MapPin, Calendar, LogOut, Plus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  const quickActions = [
    { icon: Mountain, label: 'Bouldering Session', href: '/session/new?type=on_wall', color: 'bg-session-on-wall' },
    { icon: Dumbbell, label: 'Strength Session', href: '/session/new?type=off_wall', color: 'bg-session-off-wall' },
  ];

  const navItems = [
    { icon: BarChart3, label: 'Progress & Analytics', href: '/analytics', description: 'View your development zones and trends' },
    { icon: MapPin, label: 'Gym Management', href: '/gyms', description: 'Manage gyms and grading systems' },
    { icon: Calendar, label: 'Weekly Plan', href: '/plan', description: 'Plan your training week' },
    { icon: Dumbbell, label: 'Exercise Library', href: '/exercises', description: 'Browse OFF-WALL exercises' },
  ];

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Mountain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">ClimbTrack</h1>
              <p className="text-xs text-muted-foreground">Training Analytics</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Welcome */}
        <section className="animate-slide-up">
          <h2 className="text-2xl font-bold mb-1">
            Welcome back
          </h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Start</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Card className="glass hover:border-primary/50 transition-all group cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-sm">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats Preview */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card className="glass overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zone-growth">0</p>
                  <p className="text-xs text-muted-foreground">Boulders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">--</p>
                  <p className="text-xs text-muted-foreground">Max Grade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Navigation */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Explore</h3>
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href}>
                <Card className="glass hover:border-primary/50 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* FAB */}
      <Link
        to="/session/new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-elevation-3 flex items-center justify-center glow-primary animate-pulse-glow"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </Link>
    </div>
  );
}

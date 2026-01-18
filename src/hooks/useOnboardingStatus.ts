import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnboardingStatus {
  isComplete: boolean;
  hasProfile: boolean;
  hasGym: boolean;
  hasGradeMappings: boolean;
  loading: boolean;
}

export function useOnboardingStatus(): OnboardingStatus {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, preferred_grade')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: gyms, isLoading: gymsLoading } = useQuery({
    queryKey: ['gyms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('gyms')
        .select('id')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: mappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['gym_grade_mappings', user?.id],
    queryFn: async () => {
      if (!user || !gyms?.length) return [];
      const { data } = await supabase
        .from('gym_grade_mappings')
        .select('id')
        .in('gym_id', gyms.map(g => g.id));
      return data || [];
    },
    enabled: !!user && !!gyms?.length,
  });

  const hasProfile = !!profile?.display_name;
  const hasGym = !!gyms?.length;
  const hasGradeMappings = !!mappings?.length;
  const isComplete = hasProfile && hasGym && hasGradeMappings;

  return {
    isComplete,
    hasProfile,
    hasGym,
    hasGradeMappings,
    loading: profileLoading || gymsLoading || mappingsLoading,
  };
}

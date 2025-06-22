
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
}

interface UserCyclingData {
  height_cm: number | null;
  weight_kg: number | null;
  fitness_level: string | null;
  preferred_cycling_type: string | null;
  experience_years: number | null;
  max_heart_rate: number | null;
  resting_heart_rate: number | null;
  ftp_watts: number | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cyclingData, setCyclingData] = useState<UserCyclingData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch cycling data
      const { data: cyclingDataResult, error: cyclingError } = await supabase
        .from('user_cycling_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (cyclingError && cyclingError.code !== 'PGRST116') {
        console.error('Cycling data fetch error:', cyclingError);
      } else if (cyclingDataResult) {
        setCyclingData(cyclingDataResult);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const updateCyclingData = async (updates: Partial<UserCyclingData>) => {
    if (!user) return;

    try {
      if (cyclingData) {
        // Update existing
        const { error } = await supabase
          .from('user_cycling_data')
          .update(updates)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_cycling_data')
          .insert({ ...updates, user_id: user.id });

        if (error) throw error;
      }

      setCyclingData(prev => prev ? { ...prev, ...updates } : { ...updates } as UserCyclingData);
      toast({
        title: "Cycling Data Updated",
        description: "Your cycling data has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating cycling data:', error);
      toast({
        title: "Error",
        description: "Failed to update cycling data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    cyclingData,
    loading,
    updateProfile,
    updateCyclingData,
    refetch: fetchProfile
  };
};

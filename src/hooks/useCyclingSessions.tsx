
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CyclingSession {
  id: string;
  session_name: string | null;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  distance_km: number | null;
  average_speed_kmh: number | null;
  max_speed_kmh: number | null;
  elevation_gain_m: number | null;
  calories_burned: number | null;
  average_heart_rate: number | null;
  max_heart_rate: number | null;
  notes: string | null;
  created_at: string;
}

interface CreateSessionData {
  session_name?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number | null;
  distance_km?: number | null;
  average_speed_kmh?: number | null;
  max_speed_kmh?: number | null;
  elevation_gain_m?: number | null;
  calories_burned?: number | null;
  average_heart_rate?: number | null;
  max_heart_rate?: number | null;
  notes?: string | null;
}

export const useCyclingSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<CyclingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cycling_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: CreateSessionData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cycling_sessions')
        .insert({ ...sessionData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => [data, ...prev]);
      toast({
        title: "Session Created",
        description: "Your cycling session has been saved.",
      });

      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to save cycling session.",
        variant: "destructive",
      });
    }
  };

  const getTodaysStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.created_at);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const totalDistance = todaySessions.reduce((sum, session) => sum + (session.distance_km || 0), 0);
    const totalDuration = todaySessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0);
    const avgSpeed = todaySessions.length > 0 
      ? todaySessions.reduce((sum, session) => sum + (session.average_speed_kmh || 0), 0) / todaySessions.length 
      : 0;
    const totalElevation = todaySessions.reduce((sum, session) => sum + (session.elevation_gain_m || 0), 0);

    return {
      distance: totalDistance,
      duration: totalDuration,
      averageSpeed: avgSpeed,
      elevation: totalElevation
    };
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions,
    loading,
    createSession,
    getTodaysStats,
    refetch: fetchSessions
  };
};

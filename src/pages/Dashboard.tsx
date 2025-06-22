import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import UserMenu from '@/components/UserMenu';
import MetricCard from '@/components/MetricCard';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCyclingSessions } from '@/hooks/useCyclingSessions';
import { 
  Activity, 
  Timer, 
  TrendingUp, 
  Trophy,
  Calendar,
  Navigation as NavigationIcon
} from 'lucide-react';

const Dashboard = () => {
  const { profile, loading: profileLoading } = useUserProfile();
  const { sessions, getTodaysStats, loading: sessionsLoading } = useCyclingSessions();
  
  const todaysStats = getTodaysStats();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const metrics = [
    {
      title: 'Distance Today',
      value: todaysStats.distance.toFixed(1),
      unit: 'km',
      icon: Activity,
      change: { value: 0, type: 'increase' as const }
    },
    {
      title: 'Ride Time',
      value: todaysStats.duration > 0 ? formatDuration(todaysStats.duration) : '0:00',
      unit: 'hrs',
      icon: Timer,
      change: { value: 0, type: 'increase' as const }
    },
    {
      title: 'Avg Speed',
      value: todaysStats.averageSpeed.toFixed(1),
      unit: 'km/h',
      icon: TrendingUp,
      change: { value: 0, type: 'increase' as const }
    },
    {
      title: 'Elevation',
      value: todaysStats.elevation.toString(),
      unit: 'm',
      icon: NavigationIcon,
      change: { value: 0, type: 'increase' as const }
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (profileLoading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-cycling flex items-center justify-center">
        <div className="glass-morphism rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cycling-primary mx-auto"></div>
          <p className="text-white text-center mt-4">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cycling relative">
      <div className="container mx-auto px-4 py-6">
        {/* Header with User Menu */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="text-center flex-1">
            <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
            </h1>
            <p className="text-white/80">
              Track your cycling progress and achievements
            </p>
          </div>
          <UserMenu />
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MetricCard {...metric} />
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-morphism rounded-xl p-6 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="text-cycling-primary" size={24} />
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {sessions.length > 0 ? (
              sessions.slice(0, 3).map((session, index) => (
                <motion.div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <p className="font-medium text-white">
                      {session.session_name || 'Cycling Session'}
                    </p>
                    <p className="text-sm text-white/70">{formatDate(session.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {session.distance_km ? `${session.distance_km.toFixed(1)} km` : 'N/A'}
                    </p>
                    <p className="text-sm text-white/70">
                      {session.duration_seconds ? formatDuration(session.duration_seconds) : 'N/A'}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">No cycling sessions yet.</p>
                <p className="text-white/40 text-sm mt-2">Start tracking your rides to see them here!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Achievements - Keep static for now */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-morphism rounded-xl p-6 mb-20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="text-cycling-accent" size={24} />
            <h2 className="text-xl font-semibold text-white">Achievements</h2>
          </div>
          
          <div className="text-center py-8">
            <p className="text-white/60">No achievements yet.</p>
            <p className="text-white/40 text-sm mt-2">Keep cycling to unlock achievements!</p>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <Navigation />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

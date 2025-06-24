import React, { useState, useEffect } from 'react';
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
  Navigation as NavigationIcon,
  Award,
  Zap,
  Map,
  Target,
  ChevronRight,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Cycling background images
const CYCLING_IMAGES = [
  '/assets/images/cycling-background-1.jpg',
  '/assets/images/cycling-background-2.jpg'
];

// Sample data
const WEATHER_CONDITIONS = ['sunny', 'cloudy', 'rainy', 'snowy'];
const STATS = [
  { label: 'Total Distance', value: '0 km', icon: Map, changeType: 'neutral', change: '0%' },
  { label: 'Active Days', value: '0', icon: Calendar, changeType: 'neutral', change: '0%' },
  { label: 'Avg Speed', value: '0 km/h', icon: Activity, changeType: 'neutral', change: '0%' },
];

const Dashboard = () => {
  const { profile, loading: profileLoading } = useUserProfile();
  const { sessions, getTodaysStats, loading: sessionsLoading } = useCyclingSessions();
  const [backgroundImage, setBackgroundImage] = useState(0);
  const navigate = useNavigate();
  
  const todaysStats = getTodaysStats();

  // Monthly goal settings
  const MONTHLY_GOAL_KM = 250; // Target distance in km
  
  // Calculate monthly progress
  const calculateMonthlyProgress = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter sessions from current month
    const monthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.created_at);
      return sessionDate.getMonth() === currentMonth && 
             sessionDate.getFullYear() === currentYear;
    });
    
    // Calculate total distance for the month
    const totalMonthlyDistance = monthSessions.reduce(
      (sum, session) => sum + (session.distance_km || 0), 
      0
    );
    
    // Calculate days left in month
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysLeft = lastDay - now.getDate();
    
    return {
      distance: totalMonthlyDistance,
      percentage: Math.min(100, (totalMonthlyDistance / MONTHLY_GOAL_KM) * 100),
      daysLeft
    };
  };
  
  const monthlyProgress = calculateMonthlyProgress();

  // Cycle through background images
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundImage(prev => (prev + 1) % CYCLING_IMAGES.length);
    }, 30000); // Change every 30 seconds
    return () => clearInterval(interval);
  }, []);

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

  // Add this function to calculate speed
  const calculateSpeed = (session: any) => {
    if (session.distance_km && session.duration_seconds && session.duration_seconds > 0) {
      // Convert seconds to hours and calculate km/h
      const hours = session.duration_seconds / 3600;
      return (session.distance_km / hours).toFixed(1);
    }
    return 'N/A';
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
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
        style={{ 
          backgroundImage: `url(${CYCLING_IMAGES[backgroundImage]})`,
          transition: 'background-image 1s ease-in-out'
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
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
          transition={{ delay: 0.6 }}
          className="glass-morphism rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Activity className="text-cycling-primary" size={24} />
              <h2 className="text-xl font-semibold text-black font-serif">Recent Activity</h2>
            </div>
            <button 
              onClick={() => navigate('/history')}
              className="text-black/70 hover:text-black flex items-center space-x-1 text-sm transition-colors font-sans"
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>
          
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(0, 3).map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(`/activity/${session.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-cycling-primary/20">
                      <Activity className="text-cycling-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-black font-sans">{session.session_name || 'Cycling Session'}</h3>
                      <div className="flex items-center space-x-3 text-black/60 text-sm font-sans">
                        <span>{formatDate(session.created_at)}</span>
                        <span>•</span>
                        <span>{session.distance_km ? `${session.distance_km.toFixed(1)} km` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-black font-medium font-mono">{session.duration_seconds ? formatDuration(session.duration_seconds) : 'N/A'}</div>
                    <div className="text-black/60 text-sm font-sans">{calculateSpeed(session)} km/h</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="mx-auto text-cycling-primary/50 mb-4" size={32} />
              <p className="text-black/70 mb-2 font-sans">No recent rides</p>
              <p className="text-black/60 text-sm mb-4 font-sans">Your cycling activities will appear here</p>
              <button 
                onClick={() => navigate('/map')}
                className="px-4 py-2 bg-cycling-primary text-black rounded-lg hover:bg-cycling-primary/90 transition-colors inline-flex items-center space-x-2 font-sans"
              >
                <span>Plan a Route</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
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

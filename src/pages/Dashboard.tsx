
import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import MetricCard from '@/components/MetricCard';
import { 
  Activity, 
  Timer, 
  TrendingUp, 
  Trophy,
  Calendar,
  Navigation as NavigationIcon
} from 'lucide-react';

const Dashboard = () => {
  const metrics = [
    {
      title: 'Distance Today',
      value: '42.7',
      unit: 'km',
      icon: Activity,
      change: { value: 12, type: 'increase' as const }
    },
    {
      title: 'Ride Time',
      value: '2:34',
      unit: 'hrs',
      icon: Timer,
      change: { value: 8, type: 'increase' as const }
    },
    {
      title: 'Avg Speed',
      value: '28.4',
      unit: 'km/h',
      icon: TrendingUp,
      change: { value: 5, type: 'increase' as const }
    },
    {
      title: 'Elevation',
      value: '847',
      unit: 'm',
      icon: NavigationIcon,
      change: { value: 15, type: 'increase' as const }
    }
  ];

  const achievements = [
    { title: 'Distance Master', description: '100km in a day', earned: true },
    { title: 'Hill Climber', description: '1000m elevation', earned: true },
    { title: 'Speed Demon', description: '50+ km/h', earned: false },
    { title: 'Endurance Pro', description: '5+ hours', earned: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-cycling relative">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-white/80">
            Track your cycling progress and achievements
          </p>
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
            {[
              { date: 'Today', route: 'Mountain Trail Loop', distance: '42.7 km', time: '2:34:21' },
              { date: 'Yesterday', route: 'City Park Circuit', distance: '28.3 km', time: '1:45:12' },
              { date: '2 days ago', route: 'Riverside Path', distance: '35.6 km', time: '2:12:45' }
            ].map((ride, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <p className="font-medium text-white">{ride.route}</p>
                  <p className="text-sm text-white/70">{ride.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{ride.distance}</p>
                  <p className="text-sm text-white/70">{ride.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                className={`p-4 rounded-lg transition-all ${
                  achievement.earned 
                    ? 'bg-cycling-primary/20 border border-cycling-primary/30' 
                    : 'bg-white/5 border border-white/10'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center space-x-3">
                  <Trophy 
                    className={achievement.earned ? 'text-cycling-accent' : 'text-white/40'} 
                    size={24} 
                  />
                  <div>
                    <p className={`font-medium ${achievement.earned ? 'text-white' : 'text-white/60'}`}>
                      {achievement.title}
                    </p>
                    <p className={`text-sm ${achievement.earned ? 'text-white/80' : 'text-white/50'}`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
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


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { 
  Calendar, 
  TrendingUp, 
  Activity, 
  Clock,
  Filter,
  Download
} from 'lucide-react';

const History = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];

  const rideHistory = [
    {
      id: 1,
      date: '2024-01-20',
      title: 'Mountain Trail Adventure',
      distance: 42.7,
      duration: '2:34:21',
      avgSpeed: 16.8,
      elevation: 847,
      difficulty: 'Hard'
    },
    {
      id: 2,
      date: '2024-01-19',
      title: 'City Park Circuit',
      distance: 28.3,
      duration: '1:45:12',
      avgSpeed: 16.1,
      elevation: 234,
      difficulty: 'Medium'
    },
    {
      id: 3,
      date: '2024-01-18',
      title: 'Riverside Path',
      distance: 35.6,
      duration: '2:12:45',
      avgSpeed: 16.0,
      elevation: 123,
      difficulty: 'Easy'
    },
    {
      id: 4,
      date: '2024-01-17',
      title: 'Hill Climbing Challenge',
      distance: 18.2,
      duration: '1:28:33',
      avgSpeed: 12.3,
      elevation: 956,
      difficulty: 'Hard'
    }
  ];

  const stats = {
    totalDistance: rideHistory.reduce((sum, ride) => sum + ride.distance, 0),
    totalTime: rideHistory.reduce((sum, ride) => {
      const [hours, minutes, seconds] = ride.duration.split(':').map(Number);
      return sum + hours * 3600 + minutes * 60 + seconds;
    }, 0),
    totalRides: rideHistory.length,
    avgSpeed: rideHistory.reduce((sum, ride) => sum + ride.avgSpeed, 0) / rideHistory.length
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds %- 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-dusk relative">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
            Ride History
          </h1>
          <p className="text-white/80">
            Track your cycling journey and progress
          </p>
        </motion.div>

        {/* Period Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-xl p-4 mb-8"
        >
          <div className="flex space-x-2 overflow-x-auto">
            {periods.map((period) => (
              <motion.button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedPeriod === period.id
                    ? 'bg-cycling-primary text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {period.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-morphism rounded-xl p-4 text-center">
            <Activity className="text-cycling-primary mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{stats.totalDistance.toFixed(1)}</p>
            <p className="text-white/60 text-sm">km Total</p>
          </div>
          <div className="glass-morphism rounded-xl p-4 text-center">
            <Clock className="text-cycling-secondary mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{formatDuration(stats.totalTime)}</p>
            <p className="text-white/60 text-sm">Time</p>
          </div>
          <div className="glass-morphism rounded-xl p-4 text-center">
            <Calendar className="text-cycling-accent mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{stats.totalRides}</p>
            <p className="text-white/60 text-sm">Rides</p>
          </div>
          <div className="glass-morphism rounded-xl p-4 text-center">
            <TrendingUp className="text-purple-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{stats.avgSpeed.toFixed(1)}</p>
            <p className="text-white/60 text-sm">km/h Avg</p>
          </div>
        </motion.div>

        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-morphism rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Performance Trends</h2>
            <div className="flex space-x-2">
              <motion.button
                className="glass-morphism p-2 text-white hover:bg-white/20 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter size={16} />
              </motion.button>
              <motion.button
                className="glass-morphism p-2 text-white hover:bg-white/20 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={16} />
              </motion.button>
            </div>
          </div>
          
          <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center">
            <div className="text-center text-white/60">
              <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
              <p>Interactive performance chart</p>
              <p className="text-sm">Distance, speed, and elevation trends</p>
            </div>
          </div>
        </motion.div>

        {/* Ride List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-morphism rounded-xl p-6 mb-20"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Recent Rides</h2>
          
          <div className="space-y-4">
            {rideHistory.map((ride, index) => (
              <motion.div
                key={ride.id}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-white">{ride.title}</h3>
                    <p className="text-sm text-white/60">{new Date(ride.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ride.difficulty === 'Hard' ? 'bg-red-500/20 text-red-300' :
                    ride.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {ride.difficulty}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-white/60">Distance</p>
                    <p className="text-white font-medium">{ride.distance} km</p>
                  </div>
                  <div>
                    <p className="text-white/60">Duration</p>
                    <p className="text-white font-medium">{ride.duration}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Avg Speed</p>
                    <p className="text-white font-medium">{ride.avgSpeed} km/h</p>
                  </div>
                  <div>
                    <p className="text-white/60">Elevation</p>
                    <p className="text-white font-medium">{ride.elevation} m</p>
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

export default History;

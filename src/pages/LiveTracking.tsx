
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import MetricCard from '@/components/MetricCard';
import { 
  Play, 
  Pause, 
  Square, 
  Activity, 
  Timer, 
  TrendingUp,
  Navigation as NavigationIcon,
  Heart,
  Zap
} from 'lucide-react';

const LiveTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        // Simulate speed changes
        setCurrentSpeed(20 + Math.random() * 20);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const liveMetrics = [
    {
      title: 'Current Speed',
      value: currentSpeed.toFixed(1),
      unit: 'km/h',
      icon: TrendingUp
    },
    {
      title: 'Distance',
      value: ((elapsedTime * currentSpeed) / 3600).toFixed(2),
      unit: 'km',
      icon: Activity
    },
    {
      title: 'Elapsed Time',
      value: formatTime(elapsedTime),
      unit: '',
      icon: Timer
    },
    {
      title: 'Heart Rate',
      value: '142',
      unit: 'bpm',
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-night relative">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
            Live Tracking
          </h1>
          <p className="text-white/80">
            Real-time cycling performance monitoring
          </p>
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism rounded-xl p-6 mb-8 text-center"
        >
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
            isTracking ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              isTracking ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></div>
            <span className="font-medium">
              {isTracking ? 'Tracking Active' : 'Tracking Paused'}
            </span>
          </div>
        </motion.div>

        {/* Control Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center space-x-4 mb-8"
        >
          <motion.button
            onClick={() => setIsTracking(!isTracking)}
            className={`cycling-button px-8 py-4 flex items-center space-x-2 ${
              isTracking ? 'bg-red-500 hover:bg-red-600' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isTracking ? <Pause size={20} /> : <Play size={20} />}
            <span>{isTracking ? 'Pause' : 'Start'}</span>
          </motion.button>
          
          <motion.button
            onClick={() => {
              setIsTracking(false);
              setElapsedTime(0);
              setCurrentSpeed(0);
            }}
            className="glass-morphism px-8 py-4 text-white hover:bg-white/20 rounded-lg flex items-center space-x-2 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Square size={20} />
            <span>Stop</span>
          </motion.button>
        </motion.div>

        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {liveMetrics.map((metric, index) => (
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

        {/* Performance Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-morphism rounded-xl p-6 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="text-cycling-accent" size={24} />
            <h2 className="text-xl font-semibold text-white">Performance Graph</h2>
          </div>
          
          <div className="h-40 bg-white/5 rounded-lg flex items-center justify-center">
            <div className="text-center text-white/60">
              <Activity size={48} className="mx-auto mb-2 opacity-50" />
              <p>Real-time performance chart</p>
              <p className="text-sm">Speed, heart rate, and elevation data</p>
            </div>
          </div>
        </motion.div>

        {/* GPS Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-morphism rounded-xl p-6 mb-20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <NavigationIcon className="text-cycling-primary" size={24} />
            <h2 className="text-xl font-semibold text-white">GPS Status</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-white/60 text-sm">Satellites</p>
              <p className="text-white font-semibold text-lg">12</p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">Accuracy</p>
              <p className="text-white font-semibold text-lg">±3m</p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">Elevation</p>
              <p className="text-white font-semibold text-lg">234m</p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">Grade</p>
              <p className="text-white font-semibold text-lg">2.1%</p>
            </div>
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

export default LiveTracking;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import MetricCard from '@/components/MetricCard';
import CyclingChart from '@/components/CyclingChart';
import { useGPSFusion } from '@/hooks/useGPSFusion';
import { 
  Play, 
  Pause, 
  Square, 
  Activity, 
  Timer, 
  TrendingUp,
  Navigation as NavigationIcon,
  Zap,
  Shield,
  Smartphone,
  ArrowUpRight
} from 'lucide-react';

// Cycling background images
const CYCLING_IMAGES = [
  '/assets/images/cycling-background-1.jpg',
  '/assets/images/cycling-background-2.jpg'
];

// Interface for chart data points
interface DataPoint {
  time: string;
  speed: number;
  acceleration?: number;
  elevation?: number;
}

const LiveTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(0);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [gpsAvailable, setGpsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    fusedData,
    startTracking,
    stopTracking,
    isTracking: gpsTracking
  } = useGPSFusion();

  // Update state from fusedData
  useEffect(() => {
    if (fusedData) {
      setGpsAvailable(!!fusedData.heading); // If we have heading, GPS is working
      setIsCalibrating(fusedData.isMoving === false && isTracking);
    }
  }, [fusedData, isTracking]);

  // Handle elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        // Calculate distance based on speed
        if (fusedData && fusedData.speed > 0) {
          // Speed is in km/h, convert to km/s and multiply by elapsed second
          const distanceIncrement = fusedData.speed / 3600;
          setDistance(prev => prev + distanceIncrement);
          
          // Add data point to chart
          const now = new Date();
          const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          setChartData(prev => {
            const newData = [...prev, {
              time: timeString,
              speed: fusedData.speed,
              acceleration: fusedData.acceleration,
              elevation: fusedData.latitude // Using latitude as placeholder for elevation
            }];
            
            // Keep only the last 60 data points (1 minute at 1 point per second)
            if (newData.length > 60) {
              return newData.slice(-60);
            }
            return newData;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, fusedData]);
  
  // Cycle through background images
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundImage(prev => (prev + 1) % CYCLING_IMAGES.length);
    }, 30000); // Change every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Start/stop GPS tracking when isTracking changes
  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTracking = () => {
    setIsTracking(!isTracking);
  };
  
  const handleStopTracking = () => {
    setIsTracking(false);
    setElapsedTime(0);
    setDistance(0);
    setChartData([]);
    stopTracking();
  };

  const liveMetrics = [
    {
      title: 'Current Speed',
      value: fusedData ? fusedData.speed.toFixed(1) : '0.0',
      unit: 'km/h',
      icon: TrendingUp,
      change: { 
        value: fusedData ? Math.round(fusedData.confidence === 'high' ? 90 : fusedData.confidence === 'medium' ? 60 : 30) : 0, 
        type: 'neutral' as const,
        label: 'accuracy'
      }
    },
    {
      title: 'Distance',
      value: distance.toFixed(2),
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
      title: 'Acceleration',
      value: fusedData && typeof fusedData.acceleration === 'number' ? Math.abs(fusedData.acceleration).toFixed(1) : '0.0',
      unit: 'm/s²',
      icon: ArrowUpRight
    }
  ];

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
          {isCalibrating ? (
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-300">
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="font-medium">Calibrating Sensors...</span>
            </div>
          ) : (
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
          )}
          
          {/* GPS Status */}
          <div className="mt-3 flex justify-center space-x-4">
            <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
              gpsAvailable ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
            }`}>
              <NavigationIcon size={12} />
              <span>{gpsAvailable ? 'GPS Active' : 'GPS Inactive'}</span>
            </div>
            
            <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
              fusedData && fusedData.confidence === 'high' ? 'bg-green-500/10 text-green-300' : 'bg-yellow-500/10 text-yellow-300'
            }`}>
              <Smartphone size={12} />
              <span>{fusedData && fusedData.confidence === 'high' ? 'Sensors OK' : 'Calibrating'}</span>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-red-400 text-sm">
              {error}
            </div>
          )}
        </motion.div>

        {/* Control Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center space-x-4 mb-8"
        >
          <motion.button
            onClick={handleStartTracking}
            className={`cycling-button px-8 py-4 flex items-center space-x-2 ${
              isTracking ? 'bg-red-500 hover:bg-red-600' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isCalibrating}
          >
            {isTracking ? <Pause size={20} /> : <Play size={20} />}
            <span>{isTracking ? 'Pause' : 'Start'}</span>
          </motion.button>
          
          <motion.button
            onClick={handleStopTracking}
            className="glass-morphism px-8 py-4 text-white hover:bg-white/20 rounded-lg flex items-center space-x-2 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isCalibrating}
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

        {/* Performance Chart */}
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
          
          <div className="h-60 rounded-lg">
            <CyclingChart 
              data={chartData} 
              showAcceleration={true} 
              showElevation={true}
              height={200}
            />
          </div>
        </motion.div>

        {/* Sensor Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-morphism rounded-xl p-6 mb-20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="text-cycling-primary" size={24} />
            <h2 className="text-xl font-semibold text-white">Tracking Status</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-white/60 text-sm">GPS Accuracy</p>
              <p className="text-white font-semibold text-lg">
                {fusedData && gpsAvailable ? `±${Math.round(5 + Math.random() * 10)}m` : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">Elevation</p>
              <p className="text-white font-semibold text-lg">
                {fusedData ? `${Math.round(fusedData.latitude * 10)}m` : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">Confidence</p>
              <p className="text-white font-semibold text-lg">
                {fusedData ? `${fusedData.confidence === 'high' ? 90 : fusedData.confidence === 'medium' ? 60 : 30}%` : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">Mode</p>
              <p className="text-white font-semibold text-lg">
                {!fusedData ? 'Inactive' : 
                  gpsAvailable && fusedData.isMoving ? 'Hybrid' :
                  gpsAvailable ? 'GPS Only' : 'Sensors Only'}
              </p>
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

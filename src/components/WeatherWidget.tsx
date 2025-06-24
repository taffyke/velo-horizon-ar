
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

const WeatherWidget = () => {
  const { weather, loading, error, isOnline, lastUpdateTime, refreshWeather } = useWeather();

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case '01d': return <Sun className="text-yellow-500" size={24} />;
      case '02d': return <Cloud className="text-gray-500" size={24} />;
      case '03d': return <Cloud className="text-gray-400" size={24} />;
      case '10d': return <CloudRain className="text-blue-500" size={24} />;
      case '50d': return <Wind className="text-gray-600" size={24} />;
      default: return <Sun className="text-yellow-500" size={24} />;
    }
  };

  const getCyclingCondition = (weather: any) => {
    if (weather.windSpeed > 15) return { condition: 'Challenging', color: 'text-red-500' };
    if (weather.description.toLowerCase().includes('rain')) return { condition: 'Poor', color: 'text-red-500' };
    if (weather.temperature < 5 || weather.temperature > 35) return { condition: 'Difficult', color: 'text-yellow-500' };
    return { condition: 'Good', color: 'text-green-500' };
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-morphism rounded-xl p-4"
      >
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cycling-primary"></div>
          <span className="ml-3 text-white/60 text-sm">
            {isOnline ? 'Updating weather...' : 'Loading cached data...'}
          </span>
        </div>
      </motion.div>
    );
  }

  if (error || !weather) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-morphism rounded-xl p-4"
      >
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {isOnline ? <Wifi size={16} className="text-green-400" /> : <WifiOff size={16} className="text-red-400" />}
            <span className="ml-1 text-white/60 text-xs">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-white/60 text-sm mb-2">Weather unavailable</p>
          <button
            onClick={refreshWeather}
            className="cycling-button px-3 py-1 text-xs"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Retry'}
          </button>
        </div>
      </motion.div>
    );
  }

  const cyclingCondition = getCyclingCondition(weather);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-morphism rounded-xl p-4"
    >
      {/* Header with status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getWeatherIcon(weather.icon)}
          <div>
            <p className="text-white font-semibold text-lg">{weather.temperature}°C</p>
            <p className="text-white/60 text-xs">{weather.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {isOnline ? <Wifi size={12} className="text-green-400" /> : <WifiOff size={12} className="text-red-400" />}
            <span className="text-white/60 text-xs">
              {isOnline ? 'Live' : 'Cached'}
            </span>
          </div>
          <button
            onClick={refreshWeather}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            disabled={loading}
          >
            <RefreshCw size={16} className={`text-white/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Weather details */}
      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div className="flex items-center space-x-2">
          <Thermometer size={14} className="text-white/60" />
          <div>
            <p className="text-white/60">Feels like</p>
            <p className="text-white">{weather.feelsLike}°C</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Wind size={14} className="text-white/60" />
          <div>
            <p className="text-white/60">Wind</p>
            <p className="text-white">{weather.windSpeed} km/h</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Droplets size={14} className="text-white/60" />
          <div>
            <p className="text-white/60">Humidity</p>
            <p className="text-white">{weather.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Eye size={14} className="text-white/60" />
          <div>
            <p className="text-white/60">Visibility</p>
            <p className="text-white">{weather.visibility} km</p>
          </div>
        </div>
      </div>

      {/* Cycling conditions */}
      <div className="pt-3 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs">Cycling Conditions</span>
          <span className={`text-xs font-medium ${cyclingCondition.color}`}>
            {cyclingCondition.condition}
          </span>
        </div>
        
        {/* Last update time */}
        <div className="flex items-center space-x-1">
          <Clock size={10} className="text-white/40" />
          <span className="text-white/40 text-xs">
            Updated {formatLastUpdate(lastUpdateTime)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;

import React, { useEffect, useState } from 'react';
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
<<<<<<< Updated upstream
  Wifi,
  WifiOff,
  Clock
=======
  CloudSnow,
  CloudFog,
  CloudLightning,
  Clock,
  AlertTriangle,
  Info
>>>>>>> Stashed changes
} from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

const WeatherWidget = () => {
<<<<<<< Updated upstream
  const { weather, loading, error, isOnline, lastUpdateTime, refreshWeather } = useWeather();

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case '01d': return <Sun className="text-yellow-500" size={24} />;
      case '02d': return <Cloud className="text-gray-500" size={24} />;
      case '03d': return <Cloud className="text-gray-400" size={24} />;
      case '10d': return <CloudRain className="text-blue-500" size={24} />;
      case '50d': return <Wind className="text-gray-600" size={24} />;
      default: return <Sun className="text-yellow-500" size={24} />;
=======
  const { weather, loading, error, refreshWeather, isUsingCachedData, getCurrentLocation, location } = useWeather();
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [showInfo, setShowInfo] = useState(false);

  // Force refresh on initial mount to ensure data is current
  useEffect(() => {
    // Only refresh if we don't already have weather data or it's stale
    if (!weather || (weather.timestamp && Date.now() - weather.timestamp > 300000)) {
      handleRefresh();
    }
  }, []);

  // Refresh weather data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && Date.now() - lastRefreshTime > 60000) { // Only refresh if at least 1 minute has passed
        refreshWeather();
        setLastRefreshTime(Date.now());
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [refreshWeather, lastRefreshTime]);

  // Handle manual refresh with rate limiting
  const handleRefresh = () => {
    if (Date.now() - lastRefreshTime < 10000) { // Prevent refreshing more than once every 10 seconds
      return;
    }
    
    setRefreshAttempts(prev => prev + 1);
    
    // If we've tried multiple times and still have errors, try getting location again
    if (refreshAttempts > 1 && error) {
      getCurrentLocation();
    } else {
      refreshWeather();
    }
    
    setLastRefreshTime(Date.now());
  };

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case '01d': 
      case '01n': 
        return <Sun className="text-yellow-500" size={24} />;
      case '02d':
      case '02n':
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return <Cloud className="text-gray-500" size={24} />;
      case '09d':
      case '09n':
      case '10d':
      case '10n':
        return <CloudRain className="text-blue-500" size={24} />;
      case '11d':
      case '11n':
        return <CloudLightning className="text-purple-500" size={24} />;
      case '13d':
      case '13n':
        return <CloudSnow className="text-blue-200" size={24} />;
      case '50d':
      case '50n':
        return <CloudFog className="text-gray-400" size={24} />;
      default: 
        return <Sun className="text-yellow-500" size={24} />;
>>>>>>> Stashed changes
    }
  };

  const getCyclingCondition = (weather: any) => {
    if (weather.description.toLowerCase().includes('thunderstorm')) 
      return { condition: 'Dangerous', color: 'text-red-600' };
    if (weather.description.toLowerCase().includes('snow')) 
      return { condition: 'Hazardous', color: 'text-red-500' };
    if (weather.windSpeed > 20) 
      return { condition: 'Very Challenging', color: 'text-red-500' };
    if (weather.windSpeed > 15) 
      return { condition: 'Challenging', color: 'text-orange-500' };
    if (weather.description.toLowerCase().includes('rain')) 
      return { condition: 'Poor', color: 'text-orange-500' };
    if (weather.temperature < 5) 
      return { condition: 'Cold', color: 'text-yellow-500' };
    if (weather.temperature > 35) 
      return { condition: 'Hot', color: 'text-yellow-500' };
    if (weather.temperature > 25 && weather.temperature <= 35) 
      return { condition: 'Warm', color: 'text-yellow-400' };
    if (weather.temperature >= 10 && weather.temperature <= 25) 
      return { condition: 'Excellent', color: 'text-green-500' };
    if (weather.temperature >= 5 && weather.temperature < 10) 
      return { condition: 'Good', color: 'text-green-400' };
    
    return { condition: 'Good', color: 'text-green-500' };
  };

<<<<<<< Updated upstream
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
=======
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMinutes = Math.floor((now - timestamp) / (60 * 1000));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const toggleInfo = () => {
    setShowInfo(prev => !prev);
>>>>>>> Stashed changes
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-morphism rounded-xl p-4 shadow-lg"
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
        className="glass-morphism rounded-xl p-4 shadow-lg"
      >
        <div className="text-center">
<<<<<<< Updated upstream
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
=======
          <div className="flex justify-center mb-2">
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
          <p className="text-white/60 text-sm mb-2">
            {error || "Weather data unavailable"}
          </p>
          <button
            onClick={handleRefresh}
            disabled={Date.now() - lastRefreshTime < 10000}
            className={`cycling-button px-3 py-1 text-xs ${Date.now() - lastRefreshTime < 10000 ? 'opacity-50 cursor-not-allowed' : ''}`}
>>>>>>> Stashed changes
          >
            {loading ? 'Updating...' : 'Retry'}
          </button>
          {refreshAttempts > 2 && (
            <p className="text-xs text-white/60 mt-2">
              Having trouble? Make sure location services are enabled.
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  const cyclingCondition = getCyclingCondition(weather);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-morphism rounded-xl p-4 shadow-lg"
    >
      {/* Header with status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getWeatherIcon(weather.icon)}
          <div>
            <p className="text-cycling-accent font-semibold text-lg">{Math.round(weather.temperature)}°C</p>
            <p className="text-white/60 text-xs capitalize">{weather.description}</p>
          </div>
        </div>
<<<<<<< Updated upstream
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
=======
        <div className="flex space-x-1">
          <button
            onClick={toggleInfo}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Weather information"
          >
            <Info size={16} className="text-white/60" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={Date.now() - lastRefreshTime < 10000}
            className={`p-1 hover:bg-white/10 rounded-full transition-colors ${Date.now() - lastRefreshTime < 10000 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Refresh weather data"
          >
            <RefreshCw size={16} className={`text-white/60 ${Date.now() - lastRefreshTime < 10000 && 'animate-spin'}`} />
>>>>>>> Stashed changes
          </button>
        </div>
      </div>

<<<<<<< Updated upstream
      {/* Weather details */}
      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
=======
      {location?.city && (
        <div className="text-xs text-white/80 mb-2">
          {location.city}
        </div>
      )}

      {showInfo && (
        <div className="mb-3 px-2 py-1 bg-white/10 rounded-md text-xs">
          <p className="text-white/80">
            Data source: {weather.source || 'OpenWeatherMap'}
          </p>
          <p className="text-white/80">
            Updated: {weather.timestamp ? formatTimeAgo(weather.timestamp) : 'Recently'}
          </p>
        </div>
      )}

      {isUsingCachedData && weather.timestamp && (
        <div className="mb-3 px-2 py-1 bg-yellow-500/10 rounded-md flex items-center text-xs">
          <Clock size={12} className="text-yellow-400 mr-1" />
          <span className="text-yellow-400">Cached data from {formatTimeAgo(weather.timestamp)}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs">
>>>>>>> Stashed changes
        <div className="flex items-center space-x-2">
          <Thermometer size={14} className="text-white/60" />
          <div>
            <p className="text-white/60">Feels like</p>
            <p className="text-white">{Math.round(weather.feelsLike)}°C</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Wind size={14} className="text-white/60" />
          <div>
            <p className="text-white/60">Wind</p>
            <p className="text-white">{Math.round(weather.windSpeed)} km/h</p>
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


import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
}

interface WeatherLocation {
  lat: number;
  lon: number;
  city?: string;
}

export const useWeather = () => {
  const { toast } = useToast();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<WeatherLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored - refreshing weather data');
      if (location) {
        fetchWeather(location);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost - using cached weather data');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [location]);

  // Auto-refresh weather data every 10 minutes when online
  useEffect(() => {
    if (!isOnline || !location) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing weather data');
      fetchWeather(location);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [isOnline, location]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setLocation(newLocation);
        setError(null);
        console.log('Location updated:', newLocation);
      },
      (error) => {
        setError('Unable to retrieve location');
        setLoading(false);
        toast({
          title: "Location Error",
          description: "Unable to get your location for weather data",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000 // 5 minutes
      }
    );
  };

  const fetchWeather = async (weatherLocation: WeatherLocation) => {
    try {
      setLoading(true);
      console.log('Fetching weather for:', weatherLocation);
      
      // Check if we have cached data less than 30 minutes old
      const cachedWeather = localStorage.getItem('cached-weather');
      const cachedTime = localStorage.getItem('cached-weather-time');
      
      if (!isOnline && cachedWeather && cachedTime) {
        const cacheAge = Date.now() - parseInt(cachedTime);
        if (cacheAge < 30 * 60 * 1000) { // 30 minutes
          setWeather(JSON.parse(cachedWeather));
          setLastUpdateTime(new Date(parseInt(cachedTime)));
          setLoading(false);
          console.log('Using cached weather data (offline)');
          return;
        }
      }

      // Simulate real weather API with more realistic data
      const simulatedWeather: WeatherData = {
        temperature: Math.round(15 + Math.random() * 20),
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 20),
        windDirection: Math.round(Math.random() * 360),
        description: ['Clear sky', 'Partly cloudy', 'Light rain', 'Sunny', 'Overcast', 'Windy'][Math.floor(Math.random() * 6)],
        icon: ['01d', '02d', '10d', '01d', '03d', '50d'][Math.floor(Math.random() * 6)],
        pressure: Math.round(1000 + Math.random() * 50),
        visibility: Math.round(5 + Math.random() * 15),
        uvIndex: Math.round(Math.random() * 11),
        feelsLike: Math.round(15 + Math.random() * 20),
      };

      // Simulate network delay based on connection
      const delay = isOnline ? 500 + Math.random() * 1000 : 2000;
      
      setTimeout(() => {
        setWeather(simulatedWeather);
        setLastUpdateTime(new Date());
        setLoading(false);
        setError(null);
        
        // Cache the weather data
        localStorage.setItem('cached-weather', JSON.stringify(simulatedWeather));
        localStorage.setItem('cached-weather-time', Date.now().toString());
        
        console.log('Weather data updated:', simulatedWeather);
        
        if (isOnline) {
          toast({
            title: "Weather Updated",
            description: "Latest weather data loaded",
            duration: 2000,
          });
        }
      }, delay);

    } catch (err) {
      setError('Failed to fetch weather data');
      setLoading(false);
      console.error('Weather fetch error:', err);
      
      // Try to use cached data as fallback
      const cachedWeather = localStorage.getItem('cached-weather');
      if (cachedWeather) {
        setWeather(JSON.parse(cachedWeather));
        toast({
          title: "Using Cached Weather",
          description: "Showing last known weather data",
          variant: "default",
        });
      } else {
        toast({
          title: "Weather Error",
          description: "Unable to fetch weather data",
          variant: "destructive",
        });
      }
    }
  };

  const refreshWeather = () => {
    console.log('Manual weather refresh requested');
    if (location) {
      fetchWeather(location);
    } else {
      getCurrentLocation();
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeather(location);
    }
  }, [location]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    weather,
    location,
    loading,
    error,
    isOnline,
    lastUpdateTime,
    refreshWeather,
    getCurrentLocation,
  };
};

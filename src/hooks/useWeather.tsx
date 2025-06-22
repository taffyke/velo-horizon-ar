
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setError(null);
      },
      (error) => {
        setError('Unable to retrieve location');
        setLoading(false);
        toast({
          title: "Location Error",
          description: "Unable to get your location for weather data",
          variant: "destructive",
        });
      }
    );
  };

  const fetchWeather = async (weatherLocation: WeatherLocation) => {
    try {
      setLoading(true);
      
      // Note: In a real app, you'd store the API key in Supabase secrets
      // For demo purposes, we'll simulate weather data
      const simulatedWeather: WeatherData = {
        temperature: Math.round(15 + Math.random() * 20),
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 20),
        windDirection: Math.round(Math.random() * 360),
        description: ['Clear sky', 'Partly cloudy', 'Light rain', 'Sunny'][Math.floor(Math.random() * 4)],
        icon: ['01d', '02d', '10d', '01d'][Math.floor(Math.random() * 4)],
        pressure: Math.round(1000 + Math.random() * 50),
        visibility: Math.round(5 + Math.random() * 15),
        uvIndex: Math.round(Math.random() * 11),
        feelsLike: Math.round(15 + Math.random() * 20),
      };

      // Simulate API delay
      setTimeout(() => {
        setWeather(simulatedWeather);
        setLoading(false);
        setError(null);
      }, 1000);

    } catch (err) {
      setError('Failed to fetch weather data');
      setLoading(false);
      toast({
        title: "Weather Error",
        description: "Unable to fetch weather data",
        variant: "destructive",
      });
    }
  };

  const refreshWeather = () => {
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
    refreshWeather,
    getCurrentLocation,
  };
};

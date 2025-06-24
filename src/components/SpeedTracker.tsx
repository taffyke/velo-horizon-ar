import React, { useState, useEffect, useRef } from 'react';
import { Activity, Gauge, Clock, MapPin } from 'lucide-react';

interface SpeedTrackerProps {
  className?: string;
  onSpeedUpdate?: (speed: number) => void;
  onElevationUpdate?: (elevation: number) => void;
  onDistanceUpdate?: (distance: number) => void;
  onDurationUpdate?: (duration: number) => void;
}

const SpeedTracker: React.FC<SpeedTrackerProps> = ({ 
  className = "",
  onSpeedUpdate,
  onElevationUpdate,
  onDistanceUpdate,
  onDurationUpdate
}) => {
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [averageSpeed, setAverageSpeed] = useState<number>(0);
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [batteryOptimization, setBatteryOptimization] = useState<boolean>(false);

  const speedReadings = useRef<number[]>([]);
  const lastPosition = useRef<GeolocationPosition | null>(null);
  const watchId = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const totalDistance = useRef<number>(0);
  const durationInterval = useRef<number | null>(null);

  // Request permissions and check if device sensors are available
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check if geolocation is available
        if (!navigator.geolocation) {
          setErrorMessage("Geolocation is not supported by this browser");
          setHasPermission(false);
          return;
        }

        // Request permission
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setHasPermission(true);
            setErrorMessage(null);
          },
          (error) => {
            console.error("Error getting location permission:", error);
            setHasPermission(false);
            setErrorMessage(`Location permission denied: ${error.message}`);
          },
          { enableHighAccuracy: true }
        );

        // Check if device motion/orientation is available and request permission if needed
        if (typeof DeviceMotionEvent !== 'undefined' && 
            typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          try {
            const motionPermission = await (DeviceMotionEvent as any).requestPermission();
            if (motionPermission === 'granted') {
              // We have motion permission which helps with more accurate tracking
              console.log("Device motion permission granted");
            }
          } catch (error) {
            console.warn("Could not request device motion permission:", error);
          }
        }

        // Check if device has wake lock API (keeps screen/CPU active)
        if ('wakeLock' in navigator) {
          console.log("Wake Lock API is supported");
        } else {
          console.warn("Wake Lock API is not supported");
          setBatteryOptimization(true);
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setErrorMessage("Error checking device permissions");
      }
    };

    checkPermissions();

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      if (durationInterval.current !== null) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    };
  }, []);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance; // Distance in meters
  };

  // Start tracking speed
  const startTracking = async () => {
    if (!hasPermission) {
      setErrorMessage("Location permission is required");
      return;
    }

    try {
      // Try to acquire a wake lock to keep the device from sleeping
      if ('wakeLock' in navigator) {
        try {
          const wakeLock = await (navigator as any).wakeLock.request('screen');
          wakeLock.addEventListener('release', () => {
            console.log('Wake Lock released');
          });
          console.log('Wake Lock acquired');
        } catch (err) {
          console.error(`Could not acquire Wake Lock: ${err}`);
          setBatteryOptimization(true);
        }
      }

      // Reset tracking data
      speedReadings.current = [];
      lastPosition.current = null;
      totalDistance.current = 0;
      startTime.current = Date.now();
      setCurrentSpeed(0);
      setAverageSpeed(0);
      setMaxSpeed(0);
      setDistance(0);
      setDuration(0);
      setIsTracking(true);

      // Start duration timer
      durationInterval.current = window.setInterval(() => {
        if (startTime.current) {
          const elapsedSeconds = (Date.now() - startTime.current) / 1000;
          setDuration(elapsedSeconds);
          
          // Notify parent component if callback provided
          if (onDurationUpdate) {
            onDurationUpdate(elapsedSeconds);
          }
        }
      }, 1000);

      // Start watching position with high accuracy
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed, altitude } = position.coords;
          const timestamp = position.timestamp;

          // If we have altitude data, update elevation
          if (altitude !== null && !isNaN(altitude)) {
            if (onElevationUpdate) {
              onElevationUpdate(altitude);
            }
          }

          // If we have a valid speed from the device, use it
          if (speed !== null && !isNaN(speed)) {
            // Convert m/s to km/h
            const speedKmh = speed * 3.6;
            updateSpeed(speedKmh);
          } 
          // Otherwise calculate speed based on position change
          else if (lastPosition.current) {
            const prevLat = lastPosition.current.coords.latitude;
            const prevLng = lastPosition.current.coords.longitude;
            const prevTime = lastPosition.current.timestamp;
            
            // Calculate distance in meters
            const distanceInMeters = calculateDistance(
              prevLat, prevLng,
              latitude, longitude
            );
            
            // Calculate time difference in seconds
            const timeDiffInSeconds = (timestamp - prevTime) / 1000;
            
            // Only update if we have reasonable values and accuracy
            if (timeDiffInSeconds > 0 && distanceInMeters > 0 && accuracy <= 20) {
              // Calculate speed in km/h
              const calculatedSpeed = (distanceInMeters / timeDiffInSeconds) * 3.6;
              
              // Filter out unrealistic speed spikes (e.g., GPS errors)
              if (calculatedSpeed < 100) { // Max realistic cycling speed
                updateSpeed(calculatedSpeed);
                
                // Update total distance
                totalDistance.current += distanceInMeters;
                setDistance(totalDistance.current);
                
                // Notify parent component if callback provided
                if (onDistanceUpdate) {
                  onDistanceUpdate(totalDistance.current);
                }
              }
            }
          }
          
          // Update duration
          if (startTime.current) {
            const elapsedSeconds = (Date.now() - startTime.current) / 1000;
            setDuration(elapsedSeconds);
            
            // Notify parent component if callback provided
            if (onDurationUpdate) {
              onDurationUpdate(elapsedSeconds);
            }
          }
          
          // Store current position for next calculation
          lastPosition.current = position;
        },
        (error) => {
          console.error("Error tracking location:", error);
          setErrorMessage(`Tracking error: ${error.message}`);
          setIsTracking(false);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 1000, 
          timeout: 5000 
        }
      );
    } catch (error) {
      console.error("Error starting tracking:", error);
      setErrorMessage("Failed to start speed tracking");
    }
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    if (durationInterval.current !== null) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    setIsTracking(false);
  };

  // Update speed calculations
  const updateSpeed = (speed: number) => {
    // Update current speed (rounded to 1 decimal place)
    const roundedSpeed = Math.round(speed * 10) / 10;
    setCurrentSpeed(roundedSpeed);
    
    // Notify parent component if callback provided
    if (onSpeedUpdate) {
      onSpeedUpdate(roundedSpeed);
    }
    
    // Add to speed readings array for average calculation
    speedReadings.current.push(roundedSpeed);
    
    // Calculate average speed
    const sum = speedReadings.current.reduce((acc, val) => acc + val, 0);
    const avg = sum / speedReadings.current.length;
    setAverageSpeed(Math.round(avg * 10) / 10);
    
    // Update max speed if needed
    if (roundedSpeed > maxSpeed) {
      setMaxSpeed(roundedSpeed);
    }
  };

  // Format distance for display
  const formatDistance = (meters: number): string => {
    return meters >= 1000 
      ? `${(meters / 1000).toFixed(2)} km` 
      : `${Math.round(meters)} m`;
  };

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className={`${className}`}>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
        <h2 className="text-xl font-bold mb-4 text-black font-serif flex items-center gap-2">
          <Activity className="text-black" size={20} /> 
          Speed Tracker
        </h2>
        
        {errorMessage && (
          <div className="bg-red-500/20 text-black p-3 rounded-lg mb-4 text-sm font-sans">
            {errorMessage}
          </div>
        )}
        
        {batteryOptimization && (
          <div className="bg-yellow-500/20 text-black p-3 rounded-lg mb-4 text-sm font-sans">
            For best tracking results, disable battery optimization for this app and keep the screen on.
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-black/60 text-xs font-sans">Current Speed</div>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-black font-mono">{currentSpeed}</span>
              <span className="text-black/70 ml-1 font-sans">km/h</span>
            </div>
          </div>
          
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-black/60 text-xs font-sans">Average Speed</div>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-black font-mono">{averageSpeed}</span>
              <span className="text-black/70 ml-1 font-sans">km/h</span>
            </div>
          </div>
          
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-black/60 text-xs font-sans">Distance</div>
            <div className="flex items-end">
              <span className="text-lg font-bold text-black font-mono">{formatDistance(distance)}</span>
            </div>
          </div>
          
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-black/60 text-xs font-sans">Duration</div>
            <div className="flex items-end">
              <span className="text-lg font-bold text-black font-mono">{formatDuration(duration)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          {!isTracking ? (
            <button
              onClick={startTracking}
              disabled={!hasPermission}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                hasPermission 
                  ? 'bg-cycling-primary text-black hover:bg-cycling-primary/90' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Gauge size={18} />
              <span className="font-sans">Start Tracking</span>
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="px-6 py-2 bg-red-500/80 hover:bg-red-500/90 text-black rounded-lg flex items-center gap-2"
            >
              <Clock size={18} />
              <span className="font-sans">Stop Tracking</span>
            </button>
          )}
        </div>
        
        {isTracking && (
          <div className="mt-4 flex items-center justify-center text-black text-xs font-sans">
            <MapPin size={12} className="mr-1" />
            <span>GPS tracking active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeedTracker;
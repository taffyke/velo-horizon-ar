import { useState, useEffect, useCallback, useRef } from 'react';
import { useMotionSensors } from './useMotionSensors';

interface GPSReading {
  latitude: number;
  longitude: number;
  speed: number | null;
  accuracy: number | null;
  timestamp: number;
}

interface FusedData {
  speed: number;
  latitude: number;
  longitude: number;
  confidence: 'high' | 'medium' | 'low';
  isMoving: boolean;
  heading: number | null;
  smoothedSpeed: number;
  acceleration: number;
}

// Constants for the Kalman filter
const PROCESS_NOISE = 0.01;
const MEASUREMENT_NOISE_BASE = 0.5;
const INITIAL_ESTIMATE_ERROR = 1;

// Threshold for detecting movement (in m/s)
const MOVEMENT_THRESHOLD = 0.5;

// Threshold for detecting GPS jumps (in meters)
const GPS_JUMP_THRESHOLD = 20;

// Time window for speed smoothing (in milliseconds)
const SMOOTHING_WINDOW = 5000;

const useGPSFusion = () => {
  const [gpsData, setGpsData] = useState<GPSReading | null>(null);
  const [fusedData, setFusedData] = useState<FusedData>({
    speed: 0,
    latitude: 0,
    longitude: 0,
    confidence: 'low',
    isMoving: false,
    heading: null,
    smoothedSpeed: 0,
    acceleration: 0
  });

  const { 
    motionData,
    isCalibrating,
    startCalibration
  } = useMotionSensors(true);

  // Refs for Kalman filter state
  const kalmanState = useRef({
    estimate: 0,
    estimateError: INITIAL_ESTIMATE_ERROR
  });

  // Ref for previous readings
  const prevReadings = useRef<GPSReading[]>([]);
  const prevFusedData = useRef<FusedData | null>(null);
  const watchId = useRef<number | null>(null);

  // Calculate distance between two GPS coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }, []);

  // Calculate heading between two GPS coordinates
  const calculateHeading = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let heading = Math.atan2(y, x) * 180 / Math.PI;
    heading = (heading + 360) % 360; // Normalize to 0-360
    
    return heading;
  }, []);

  // Apply Kalman filter to speed readings
  const applyKalmanFilter = useCallback((measurement: number, accuracy: number | null): number => {
    // Get previous state
    let { estimate, estimateError } = kalmanState.current;
    
    // Adjust measurement noise based on GPS accuracy
    const measurementNoise = accuracy ? 
      MEASUREMENT_NOISE_BASE * (accuracy / 10) : 
      MEASUREMENT_NOISE_BASE * 2;
    
    // Prediction update
    estimateError = estimateError + PROCESS_NOISE;
    
    // Measurement update
    const kalmanGain = estimateError / (estimateError + measurementNoise);
    estimate = estimate + kalmanGain * (measurement - estimate);
    estimateError = (1 - kalmanGain) * estimateError;
    
    // Save updated state
    kalmanState.current = { estimate, estimateError };
    
    return estimate;
  }, []);

  // Detect GPS jumps (unrealistic position changes)
  const isGpsJump = useCallback((newReading: GPSReading): boolean => {
    if (prevReadings.current.length === 0) return false;
    
    const lastReading = prevReadings.current[prevReadings.current.length - 1];
    const distance = calculateDistance(
      lastReading.latitude, lastReading.longitude,
      newReading.latitude, newReading.longitude
    );
    
    const timeGap = newReading.timestamp - lastReading.timestamp;
    const timeGapSeconds = timeGap / 1000;
    
    // If time gap is too small, don't consider it a jump
    if (timeGapSeconds < 0.1) return false;
    
    // Calculate maximum reasonable distance based on previous speed
    // Allow for acceleration but detect unrealistic jumps
    const maxReasonableSpeed = lastReading.speed ? lastReading.speed * 1.5 + 5 : 30; // m/s
    const maxDistance = maxReasonableSpeed * timeGapSeconds;
    
    return distance > maxDistance || distance > GPS_JUMP_THRESHOLD;
  }, [calculateDistance]);

  // Calculate smoothed speed from recent readings
  const calculateSmoothedSpeed = useCallback((): number => {
    const now = Date.now();
    const recentReadings = prevReadings.current.filter(
      reading => now - reading.timestamp < SMOOTHING_WINDOW
    );
    
    if (recentReadings.length < 2) {
      return fusedData.smoothedSpeed;
    }
    
    // Calculate distance covered in the window
    let totalDistance = 0;
    for (let i = 1; i < recentReadings.length; i++) {
      const prev = recentReadings[i-1];
      const curr = recentReadings[i];
      
      totalDistance += calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
    }
    
    // Calculate time elapsed
    const timeElapsed = (recentReadings[recentReadings.length - 1].timestamp - 
                        recentReadings[0].timestamp) / 1000;
    
    // Avoid division by zero
    if (timeElapsed <= 0) return fusedData.smoothedSpeed;
    
    return totalDistance / timeElapsed;
  }, [calculateDistance, fusedData.smoothedSpeed]);

  // Start GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    // Reset Kalman filter
    kalmanState.current = {
      estimate: 0,
      estimateError: INITIAL_ESTIMATE_ERROR
    };

    // Clear previous readings
    prevReadings.current = [];

    // Start watching position
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newReading: GPSReading = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed !== null ? position.coords.speed : null,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        setGpsData(newReading);
        
        // Add to readings history if not a GPS jump
        if (!isGpsJump(newReading)) {
          prevReadings.current.push(newReading);
          
          // Keep only recent readings for memory efficiency
          if (prevReadings.current.length > 100) {
            prevReadings.current.shift();
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    // Start motion sensors
    startCalibration();

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [startCalibration, isGpsJump]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  // Process and fuse data from GPS and motion sensors
  useEffect(() => {
    if (!gpsData) return;

    const now = Date.now();
    
    // Calculate heading if we have at least two points
    let heading: number | null = null;
    if (prevReadings.current.length >= 2) {
      const prevReading = prevReadings.current[prevReadings.current.length - 2];
      heading = calculateHeading(
        prevReading.latitude, prevReading.longitude,
        gpsData.latitude, gpsData.longitude
      );
    }
    
    // Determine if device is moving based on both GPS and accelerometer
    const isMoving = isCalibrating || 
                    (gpsData.speed !== null && gpsData.speed > MOVEMENT_THRESHOLD);
    
    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (gpsData.accuracy) {
      if (gpsData.accuracy < 10 && isCalibrating) {
        confidence = 'high';
      } else if (gpsData.accuracy < 20) {
        confidence = 'medium';
      }
    }
    
    // Calculate speed using Kalman filter
    let speed = 0;
    if (gpsData.speed !== null) {
      speed = applyKalmanFilter(gpsData.speed, gpsData.accuracy);
    } else if (prevReadings.current.length >= 2) {
      // Calculate speed from position changes if GPS speed is not available
      const prevReading = prevReadings.current[prevReadings.current.length - 2];
      const distance = calculateDistance(
        prevReading.latitude, prevReading.longitude,
        gpsData.latitude, gpsData.longitude
      );
      const timeGap = (gpsData.timestamp - prevReading.timestamp) / 1000;
      
      if (timeGap > 0) {
        const calculatedSpeed = distance / timeGap;
        speed = applyKalmanFilter(calculatedSpeed, gpsData.accuracy);
      }
    }
    
    // Calculate smoothed speed
    const smoothedSpeed = calculateSmoothedSpeed();
    
    // Calculate acceleration
    let calculatedAcceleration = 0;
    if (prevFusedData.current) {
      const timeDiff = (now - prevReadings.current[prevReadings.current.length - 2]?.timestamp) / 1000;
      if (timeDiff > 0) {
        calculatedAcceleration = (smoothedSpeed - prevFusedData.current.smoothedSpeed) / timeDiff;
      }
    }
    
    // Combine acceleration from sensors and calculated acceleration
    const fusedAcceleration = isCalibrating ? 
      (calculateAccelerationMagnitude(motionData.acceleration) + calculatedAcceleration) / 2 : 
      calculatedAcceleration;
    
    // Update fused data
    const newFusedData: FusedData = {
      speed: Math.max(0, speed),
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
      confidence,
      isMoving,
      heading,
      smoothedSpeed: Math.max(0, smoothedSpeed),
      acceleration: fusedAcceleration
    };
    
    setFusedData(newFusedData);
    prevFusedData.current = newFusedData;
  }, [gpsData, isCalibrating, motionData, applyKalmanFilter, calculateDistance, calculateHeading, calculateSmoothedSpeed]);

  return {
    fusedData,
    rawGpsData: gpsData,
    startTracking,
    stopTracking,
    isTracking: watchId.current !== null,
    startCalibration
  };
};

// Add this helper function
const calculateAccelerationMagnitude = (acceleration: { x: number; y: number; z: number }): number => {
  return Math.sqrt(
    Math.pow(acceleration.x, 2) + 
    Math.pow(acceleration.y, 2) + 
    Math.pow(acceleration.z, 2)
  );
};

export { useGPSFusion };

export default useGPSFusion; 
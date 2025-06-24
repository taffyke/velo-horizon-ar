import { useState, useEffect } from 'react';

interface MotionData {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  orientation: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  speed: number;
  isMoving: boolean;
  confidence: number;
}

const MOVEMENT_THRESHOLD = 0.8;
const CALIBRATION_SAMPLES = 50;

export const useMotionSensors = (isActive: boolean = true) => {
  const [motionData, setMotionData] = useState<MotionData>({
    acceleration: { x: 0, y: 0, z: 0 },
    rotationRate: { alpha: 0, beta: 0, gamma: 0 },
    orientation: { alpha: 0, beta: 0, gamma: 0 },
    speed: 0,
    isMoving: false,
    confidence: 0
  });
  
  const [calibrationData, setCalibrationData] = useState<number[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [noiseThreshold, setNoiseThreshold] = useState(1.0);
  
  // Initialize calibration
  useEffect(() => {
    if (isActive && calibrationData.length === 0 && !isCalibrating) {
      setIsCalibrating(true);
    }
  }, [isActive, calibrationData, isCalibrating]);

  // Handle device motion events
  useEffect(() => {
    if (!isActive) return;
    
    let lastTimestamp: number | null = null;
    let speedBuffer: number[] = [];
    
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      
      if (!acceleration || acceleration.x === null) return;
      
      // Calculate magnitude of acceleration
      const magnitude = Math.sqrt(
        Math.pow(acceleration.x || 0, 2) + 
        Math.pow(acceleration.y || 0, 2) + 
        Math.pow(acceleration.z || 0, 2)
      );
      
      // During calibration, collect noise samples
      if (isCalibrating) {
        setCalibrationData(prev => {
          const newData = [...prev, magnitude];
          if (newData.length >= CALIBRATION_SAMPLES) {
            // Calculate standard deviation to determine noise threshold
            const avg = newData.reduce((sum, val) => sum + val, 0) / newData.length;
            const variance = newData.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / newData.length;
            const stdDev = Math.sqrt(variance);
            
            setNoiseThreshold(stdDev * 1.5);
            setIsCalibrating(false);
          }
          return newData;
        });
        return;
      }
      
      // Detect cycling motion pattern
      const isCyclingMotion = detectCyclingPattern(
        acceleration.x || 0,
        acceleration.y || 0,
        acceleration.z || 0,
        event.rotationRate?.alpha || 0,
        event.rotationRate?.beta || 0,
        event.rotationRate?.gamma || 0
      );
      
      // Calculate speed based on acceleration and time
      const timestamp = event.timeStamp || Date.now();
      let instantSpeed = 0;
      
      if (lastTimestamp) {
        const timeDelta = (timestamp - lastTimestamp) / 1000; // in seconds
        const accelerationMagnitude = Math.max(0, magnitude - noiseThreshold);
        
        // Only consider acceleration above the noise threshold
        if (accelerationMagnitude > MOVEMENT_THRESHOLD && isCyclingMotion) {
          // Simple physics: v = a * t
          instantSpeed = accelerationMagnitude * timeDelta * 3.6; // Convert to km/h
          
          // Add to buffer for smoothing
          speedBuffer.push(instantSpeed);
          if (speedBuffer.length > 10) speedBuffer.shift();
        }
      }
      
      lastTimestamp = timestamp;
      
      // Calculate average speed from buffer for smoothing
      const avgSpeed = speedBuffer.length > 0 
        ? speedBuffer.reduce((sum, s) => sum + s, 0) / speedBuffer.length 
        : 0;
      
      // Calculate confidence based on consistency of measurements
      const confidence = calculateConfidence(speedBuffer, isCyclingMotion);
      
      setMotionData({
        acceleration: {
          x: acceleration.x || 0,
          y: acceleration.y || 0,
          z: acceleration.z || 0
        },
        rotationRate: {
          alpha: event.rotationRate?.alpha || 0,
          beta: event.rotationRate?.beta || 0,
          gamma: event.rotationRate?.gamma || 0
        },
        orientation: {
          alpha: window.orientation || 0,
          beta: 0,
          gamma: 0
        },
        speed: avgSpeed,
        isMoving: magnitude > MOVEMENT_THRESHOLD + noiseThreshold,
        confidence
      });
    };
    
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      setMotionData(prev => ({
        ...prev,
        orientation: {
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0
        }
      }));
    };
    
    window.addEventListener('devicemotion', handleDeviceMotion);
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isActive, isCalibrating, noiseThreshold]);
  
  // Detect cycling motion pattern
  const detectCyclingPattern = (
    accelX: number, 
    accelY: number, 
    accelZ: number,
    rotAlpha: number,
    rotBeta: number,
    rotGamma: number
  ): boolean => {
    // This is a simplified algorithm to detect cycling patterns
    // In a real app, this would use machine learning or more sophisticated pattern recognition
    
    // Check for vertical oscillation typical in cycling
    const verticalOscillation = Math.abs(accelY) > 1.5 && Math.abs(accelY) < 8;
    
    // Check for forward motion
    const forwardMotion = Math.abs(accelZ) > 1.0;
    
    // Check for minimal side-to-side motion (bike stays relatively upright)
    const minimalSidewaysMotion = Math.abs(accelX) < 3.0;
    
    return verticalOscillation && forwardMotion && minimalSidewaysMotion;
  };
  
  // Calculate confidence level in the measurements
  const calculateConfidence = (speedBuffer: number[], isCyclingMotion: boolean): number => {
    if (speedBuffer.length < 3) return 0;
    
    // Calculate variance in speed measurements
    const avg = speedBuffer.reduce((sum, val) => sum + val, 0) / speedBuffer.length;
    const variance = speedBuffer.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / speedBuffer.length;
    
    // Lower variance = higher confidence
    const varianceConfidence = Math.max(0, 1 - (variance / 10));
    
    // Combine with cycling motion detection
    return isCyclingMotion ? (0.7 + 0.3 * varianceConfidence) : (0.3 * varianceConfidence);
  };

  const startCalibration = () => {
    setCalibrationData([]);
    setIsCalibrating(true);
  };
  
  return {
    motionData,
    isCalibrating,
    startCalibration
  };
}; 
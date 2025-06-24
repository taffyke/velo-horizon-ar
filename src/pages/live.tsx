import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import SpeedTracker from '@/components/SpeedTracker';
import CyclingChart from '@/components/CyclingChart';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Battery, Wifi, Smartphone, Gauge, Clock, TrendingUp, Zap, Shield, AlertTriangle } from 'lucide-react';

// Interface for tracking data points
interface DataPoint {
  time: string;
  speed: number;
  acceleration?: number;
  elevation?: number;
}

const Live = () => {
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [averageSpeed, setAverageSpeed] = useState<number>(0);
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [elevation, setElevation] = useState<number>(0);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [diagnosticsRun, setDiagnosticsRun] = useState<boolean>(false);
  const [diagnosticsResults, setDiagnosticsResults] = useState<{
    gps: boolean;
    battery: boolean;
    network: boolean;
    sensors: boolean;
    background: boolean;
  }>({
    gps: false,
    battery: false,
    network: false,
    sensors: false,
    background: false
  });

  const speedReadingsRef = useRef<number[]>([]);
  const lastElevationRef = useRef<number | null>(null);
  const elevationReadingsRef = useRef<number[]>([]);
  const accelerationReadingsRef = useRef<number[]>([]);
  const lastSpeedRef = useRef<number>(0);
  const speedSmoothingBufferRef = useRef<number[]>([]);
  const dataPointsRef = useRef<DataPoint[]>([]);
  const trackingIntervalRef = useRef<number | null>(null);

  // Initialize chart data
  useEffect(() => {
    // Create empty chart data points for the last 2 minutes (12 points at 10 second intervals)
    const initialData: DataPoint[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 10000);
      initialData.push({
        time: time.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
        speed: 0,
        acceleration: 0,
        elevation: 0
      });
    }
    
    setChartData(initialData);
    dataPointsRef.current = initialData;
  }, []);

  // Handle speed updates from the tracker
  const handleSpeedUpdate = (speed: number) => {
    // Add to smoothing buffer (last 3 readings)
    speedSmoothingBufferRef.current.push(speed);
    if (speedSmoothingBufferRef.current.length > 3) {
      speedSmoothingBufferRef.current.shift();
    }
    
    // Calculate smoothed speed (average of last 3 readings)
    const smoothedSpeed = speedSmoothingBufferRef.current.reduce((sum, val) => sum + val, 0) / 
      speedSmoothingBufferRef.current.length;
    
    // Update current speed
    setCurrentSpeed(Math.round(smoothedSpeed * 10) / 10);
    
    // Calculate acceleration (km/h/s)
    const acceleration = (smoothedSpeed - lastSpeedRef.current) / 1; // Assuming 1 second between readings
    lastSpeedRef.current = smoothedSpeed;
    
    // Add to speed readings for average
    speedReadingsRef.current.push(smoothedSpeed);
    
    // Add to acceleration readings
    accelerationReadingsRef.current.push(acceleration);
    if (accelerationReadingsRef.current.length > 5) {
      accelerationReadingsRef.current.shift();
    }
    
    // Calculate average speed
    const avgSpeed = speedReadingsRef.current.reduce((sum, val) => sum + val, 0) / 
      speedReadingsRef.current.length;
    setAverageSpeed(Math.round(avgSpeed * 10) / 10);
    
    // Update max speed if needed
    if (smoothedSpeed > maxSpeed) {
      setMaxSpeed(Math.round(smoothedSpeed * 10) / 10);
    }
    
    // Update chart data every 10 seconds
    if (!trackingIntervalRef.current) {
      trackingIntervalRef.current = window.setInterval(() => {
        // Calculate average acceleration
        const avgAcceleration = accelerationReadingsRef.current.length > 0 
          ? accelerationReadingsRef.current.reduce((sum, val) => sum + val, 0) / 
            accelerationReadingsRef.current.length 
          : 0;
        
        // Calculate average elevation change
        const avgElevation = lastElevationRef.current !== null && elevationReadingsRef.current.length > 0
          ? elevationReadingsRef.current.reduce((sum, val) => sum + val, 0) / 
            elevationReadingsRef.current.length
          : 0;
        
        // Create new data point
        const now = new Date();
        const newDataPoint: DataPoint = {
          time: now.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          speed: currentSpeed,
          acceleration: Math.round(avgAcceleration * 100) / 100,
          elevation: Math.round(elevation)
        };
        
        // Add to data points and remove oldest if more than 12 points
        const newDataPoints = [...dataPointsRef.current, newDataPoint];
        if (newDataPoints.length > 12) {
          newDataPoints.shift();
        }
        
        // Update chart data
        dataPointsRef.current = newDataPoints;
        setChartData(newDataPoints);
        
        // Reset acceleration readings for next interval
        accelerationReadingsRef.current = [];
      }, 10000); // Update every 10 seconds
    }
  };

  // Handle elevation updates
  const handleElevationUpdate = (newElevation: number) => {
    if (lastElevationRef.current !== null) {
      const elevationChange = newElevation - lastElevationRef.current;
      elevationReadingsRef.current.push(elevationChange);
      if (elevationReadingsRef.current.length > 5) {
        elevationReadingsRef.current.shift();
      }
    }
    
    lastElevationRef.current = newElevation;
    setElevation(newElevation);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  // Run diagnostics to check if the app can track in background
  const runDiagnostics = () => {
    // Check GPS availability
    const gpsAvailable = 'geolocation' in navigator;
    
    // Check battery API
    const batteryApiAvailable = 'getBattery' in navigator;
    
    // Check network status
    const networkAvailable = navigator.onLine;
    
    // Check if device motion/orientation is available
    const sensorsAvailable = 'DeviceMotionEvent' in window || 'DeviceOrientationEvent' in window;
    
    // Check if wake lock API is available (for background processing)
    const backgroundCapable = 'wakeLock' in navigator;
    
    setDiagnosticsResults({
      gps: gpsAvailable,
      battery: batteryApiAvailable,
      network: networkAvailable,
      sensors: sensorsAvailable,
      background: backgroundCapable
    });
    
    setDiagnosticsRun(true);
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

  // Format distance for display
  const formatDistance = (meters: number): string => {
    return meters >= 1000 
      ? `${(meters / 1000).toFixed(2)} km` 
      : `${Math.round(meters)} m`;
  };

  return (
    <div className="min-h-screen bg-gradient-cycling">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-black font-serif">Live Tracking</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Speed Tracker */}
          <SpeedTracker 
            className="col-span-1" 
            onSpeedUpdate={handleSpeedUpdate}
            onElevationUpdate={handleElevationUpdate}
            onDistanceUpdate={setDistance}
            onDurationUpdate={setDuration}
          />
          
          {/* Diagnostics */}
          <div className="col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-black font-serif flex items-center gap-2">
                  <Smartphone className="text-black" size={20} />
                  System Diagnostics
                </h2>
                
                <p className="text-black font-sans mb-4">
                  Check if your device can accurately track speed while in a backpack or pocket.
                </p>
                
                {!diagnosticsRun ? (
                  <button
                    onClick={runDiagnostics}
                    className="w-full py-3 bg-cycling-primary text-black rounded-lg font-sans hover:bg-cycling-primary/90 transition-colors"
                  >
                    Run Diagnostics
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-black" />
                        <span className="text-black font-sans">GPS Tracking</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-mono ${diagnosticsResults.gps ? 'bg-green-500/20 text-black' : 'bg-red-500/20 text-black'}`}>
                        {diagnosticsResults.gps ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Battery size={16} className="text-black" />
                        <span className="text-black font-sans">Battery Optimization</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-mono ${diagnosticsResults.battery ? 'bg-green-500/20 text-black' : 'bg-yellow-500/20 text-black'}`}>
                        {diagnosticsResults.battery ? 'Optimized' : 'Check Settings'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wifi size={16} className="text-black" />
                        <span className="text-black font-sans">Network Status</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-mono ${diagnosticsResults.network ? 'bg-green-500/20 text-black' : 'bg-red-500/20 text-black'}`}>
                        {diagnosticsResults.network ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-black" />
                        <span className="text-black font-sans">Motion Sensors</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-mono ${diagnosticsResults.sensors ? 'bg-green-500/20 text-black' : 'bg-yellow-500/20 text-black'}`}>
                        {diagnosticsResults.sensors ? 'Available' : 'Limited'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-black" />
                        <span className="text-black font-sans">Background Tracking</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-mono ${diagnosticsResults.background ? 'bg-green-500/20 text-black' : 'bg-yellow-500/20 text-black'}`}>
                        {diagnosticsResults.background ? 'Supported' : 'Limited'}
                      </span>
                    </div>
                    
                    <div className="mt-4 p-4 bg-white/5 rounded-lg">
                      <h3 className="font-semibold text-black font-serif mb-2">Diagnosis Result:</h3>
                      <p className="text-black font-sans text-sm">
                        {(diagnosticsResults.gps && diagnosticsResults.background) 
                          ? "Your device can track speed accurately even when in a backpack. For best results, keep the app running in the foreground and disable battery optimization."
                          : "Your device has limited tracking capabilities when the phone is in a backpack. For best results, keep the phone in an accessible position with the screen on."}
                      </p>
                    </div>
                    
                    <button
                      onClick={runDiagnostics}
                      className="w-full py-2 mt-2 bg-white/10 text-black rounded-lg font-sans hover:bg-white/20 transition-colors"
                    >
                      Run Again
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Current Speed Card */}
            {currentSpeed > 0 && (
              <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg mt-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-black font-serif">Current Speed</h2>
                  <div className="flex items-end">
                    <span className="text-5xl font-bold text-black font-mono">{currentSpeed}</span>
                    <span className="text-black/70 ml-2 text-xl font-sans">km/h</span>
                  </div>
                  <p className="text-black/60 text-xs font-sans mt-2">
                    Speed is updated in real-time using GPS data
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-xs text-black/60 font-sans">Avg Speed</div>
                      <div className="text-lg font-mono text-black">{averageSpeed} <span className="text-xs">km/h</span></div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-xs text-black/60 font-sans">Max Speed</div>
                      <div className="text-lg font-mono text-black">{maxSpeed} <span className="text-xs">km/h</span></div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-xs text-black/60 font-sans">Distance</div>
                      <div className="text-lg font-mono text-black">{formatDistance(distance)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-xs text-black/60 font-sans">Duration</div>
                      <div className="text-lg font-mono text-black">{formatDuration(duration)}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-xs text-black/60 font-sans">Elevation</div>
                      <div className="text-lg font-mono text-black">{elevation.toFixed(0)} <span className="text-xs">m</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Performance Graph */}
        <div className="mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-black font-serif flex items-center gap-2">
                <TrendingUp className="text-black" size={20} />
                Performance Graph
              </h2>
              
              <div className="h-60 rounded-lg">
                <CyclingChart 
                  data={chartData} 
                  showAcceleration={true} 
                  showElevation={true}
                  height={200}
                />
              </div>
              
              <div className="flex justify-between mt-4 text-xs text-black/60 font-sans">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-1 bg-cycling-primary"></div>
                  <span>Speed (km/h)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-1 bg-cycling-accent"></div>
                  <span>Acceleration (m/s²)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-1 bg-cycling-secondary"></div>
                  <span>Elevation (m)</span>
                </div>
              </div>
              
              {chartData.every(point => point.speed === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-lg">
                  <div className="text-center">
                    <AlertTriangle className="mx-auto text-cycling-accent mb-2" size={24} />
                    <p className="text-black font-sans">Start tracking to see performance data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-50">
        <Navigation />
      </div>
    </div>
  );
};

export default Live; 
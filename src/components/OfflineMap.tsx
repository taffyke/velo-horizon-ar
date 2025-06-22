
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Download, Wifi, WifiOff } from 'lucide-react';

interface OfflineMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  markers?: Array<{ lat: number; lng: number; title?: string }>;
}

const OfflineMap: React.FC<OfflineMapProps> = ({ 
  center = [51.505, -0.09], 
  zoom = 13, 
  className = "",
  markers = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const downloadAreaForOffline = () => {
    // Simulate downloading map tiles for offline use
    console.log('Downloading map area for offline use...');
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
        {!mapLoaded ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cycling-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Simulated map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-blue-100 to-green-100">
              {/* Grid lines to simulate map tiles */}
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}></div>
              
              {/* Simulated roads */}
              <div className="absolute top-20 left-10 w-80 h-1 bg-gray-400 transform rotate-45"></div>
              <div className="absolute top-40 left-20 w-60 h-1 bg-gray-400 transform -rotate-12"></div>
              <div className="absolute bottom-20 right-10 w-40 h-1 bg-gray-400 transform rotate-12"></div>
              
              {/* Markers */}
              {markers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${50 + (marker.lng * 10)}%`,
                    top: `${50 + (marker.lat * 10)}%`
                  }}
                >
                  <MapPin className="text-red-500" size={24} />
                  {marker.title && (
                    <div className="mt-1 px-2 py-1 bg-white rounded shadow text-xs">
                      {marker.title}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Current location marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          isOnline ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
        }`}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        
        <button
          onClick={downloadAreaForOffline}
          className="p-1 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          title="Download for offline use"
        >
          <Download size={16} className="text-gray-700" />
        </button>
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-500/20 backdrop-blur-sm rounded-lg p-2">
          <p className="text-yellow-700 text-xs text-center">
            You're offline. Showing cached map data.
          </p>
        </div>
      )}
    </div>
  );
};

export default OfflineMap;

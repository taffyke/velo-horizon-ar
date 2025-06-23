
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Download, Wifi, WifiOff, RefreshCw } from 'lucide-react';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Map: Connection restored - refreshing map data');
      refreshMapData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('Map: Connection lost - using cached tiles');
    };

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
      setLastRefresh(new Date());
      console.log('Map: Initial load complete');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const refreshMapData = async () => {
    if (!isOnline) return;
    
    setIsRefreshing(true);
    console.log('Map: Refreshing map tiles and data');
    
    // Simulate refreshing map tiles
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefresh(new Date());
      console.log('Map: Refresh complete');
    }, 2000);
  };

  const downloadAreaForOffline = () => {
    if (!isOnline) {
      console.log('Map: Cannot download - offline');
      return;
    }
    
    console.log('Map: Downloading current area for offline use...');
    // Simulate downloading map tiles for offline use
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      console.log('Map: Area downloaded for offline use');
    }, 3000);
  };

  const formatLastRefresh = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
        {!mapLoaded ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cycling-primary mx-auto mb-4"></div>
              <p className="text-gray-600">
                {isOnline ? 'Loading map...' : 'Loading cached map...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Map background with refresh overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br from-green-200 via-blue-100 to-green-100 transition-opacity ${
              isRefreshing ? 'opacity-50' : 'opacity-100'
            }`}>
              {/* Grid lines to simulate map tiles */}
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: isOnline ? '40px 40px' : '60px 60px' // Different grid for offline
              }}></div>
              
              {/* Simulated roads with real-time updates */}
              <div className={`absolute top-20 left-10 w-80 h-1 bg-gray-400 transform rotate-45 transition-all ${
                isOnline ? 'opacity-100' : 'opacity-60'
              }`}></div>
              <div className={`absolute top-40 left-20 w-60 h-1 bg-gray-400 transform -rotate-12 transition-all ${
                isOnline ? 'opacity-100' : 'opacity-60'
              }`}></div>
              <div className={`absolute bottom-20 right-10 w-40 h-1 bg-gray-400 transform rotate-12 transition-all ${
                isOnline ? 'opacity-100' : 'opacity-60'
              }`}></div>
              
              {/* Real-time traffic simulation (only when online) */}
              {isOnline && (
                <>
                  <div className="absolute top-32 left-32 w-20 h-1 bg-red-400 transform rotate-45 animate-pulse"></div>
                  <div className="absolute bottom-32 right-32 w-30 h-1 bg-yellow-400 transform -rotate-12 animate-pulse"></div>
                </>
              )}
              
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
                  <MapPin className={`${isOnline ? 'text-red-500' : 'text-red-400'} transition-colors`} size={24} />
                  {marker.title && (
                    <div className="mt-1 px-2 py-1 bg-white rounded shadow text-xs">
                      {marker.title}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Current location marker with real-time updates */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg ${
                  isOnline ? 'animate-pulse' : ''
                }`}></div>
                {isOnline && (
                  <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                )}
              </div>
              
              {/* Refresh overlay when updating */}
              {isRefreshing && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white/90 rounded-lg p-4 flex items-center space-x-2">
                    <RefreshCw className="animate-spin text-cycling-primary" size={20} />
                    <span className="text-sm font-medium">Updating map...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced status indicators */}
      <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs backdrop-blur-sm ${
          isOnline ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
        }`}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isOnline ? 'Live Updates' : 'Offline Mode'}</span>
        </div>
        
        {isOnline && (
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshMapData}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              title="Refresh map data"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={`text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={downloadAreaForOffline}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              title="Download for offline use"
              disabled={isRefreshing}
            >
              <Download size={16} className="text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Enhanced offline/update indicators */}
      {!isOnline && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-500/20 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 text-sm font-medium">Offline Mode</p>
              <p className="text-yellow-600 text-xs">
                Last updated: {formatLastRefresh(lastRefresh)}
              </p>
            </div>
            <WifiOff size={20} className="text-yellow-600" />
          </div>
        </div>
      )}

      {isOnline && lastRefresh && (
        <div className="absolute bottom-4 left-4 bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-1">
          <p className="text-green-700 text-xs">
            Updated: {formatLastRefresh(lastRefresh)}
          </p>
        </div>
      )}
    </div>
  );
};

export default OfflineMap;

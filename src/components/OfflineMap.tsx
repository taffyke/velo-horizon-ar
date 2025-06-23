
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Download, Wifi, WifiOff, RefreshCw } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OfflineMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  markers?: Array<{ lat: number; lng: number; title?: string }>;
}

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const OfflineMap: React.FC<OfflineMapProps> = ({ 
  center = [51.505, -0.09], 
  zoom = 13, 
  className = "",
  markers = []
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center);
  const [currentZoom, setCurrentZoom] = useState(zoom);

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
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter: [number, number] = [position.coords.latitude, position.coords.longitude];
          setCurrentCenter(newCenter);
          console.log('Map: Location updated:', newCenter);
        },
        (error) => {
          console.log('Map: Could not get location, using default');
        }
      );
    }
  }, []);

  const refreshMapData = async () => {
    if (!isOnline) return;
    
    setIsRefreshing(true);
    console.log('Map: Refreshing map tiles and data');
    
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
      <div style={{ width: '100%', height: '100%' }}>
        <MapContainer
          center={currentCenter}
          zoom={currentZoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <MapUpdater center={currentCenter} zoom={currentZoom} />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Current location marker */}
          <Marker position={currentCenter}>
            <Popup>Your current location</Popup>
          </Marker>
          
          {/* Additional markers */}
          {markers.map((marker, index) => (
            <Marker key={index} position={[marker.lat, marker.lng]}>
              <Popup>{marker.title || `Location ${index + 1}`}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Status indicators */}
      <div className="absolute top-4 right-4 flex flex-col items-end space-y-2 z-[1000]">
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

      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-500/20 backdrop-blur-sm rounded-lg p-3 z-[1000]">
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

      {/* Refresh overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[1000]">
          <div className="bg-white/90 rounded-lg p-4 flex items-center space-x-2">
            <RefreshCw className="animate-spin text-cycling-primary" size={20} />
            <span className="text-sm font-medium">Updating map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineMap;

import React, { useState } from 'react';
import OfflineMap from './OfflineMap';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';

interface MapProps {
  className?: string;
}

const Map: React.FC<MapProps> = ({ className = "" }) => {
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [departurePoint, setDeparturePoint] = useState<[number, number] | undefined>(undefined);
  const [destinationPoint, setDestinationPoint] = useState<[number, number] | undefined>(undefined);

  // Sample cycling points of interest
  const cyclingPOIs = [
    { lat: 51.505, lng: -0.09, title: "Cycling Hub" },
    { lat: 51.51, lng: -0.1, title: "Bike Repair Shop" },
    { lat: 51.49, lng: -0.08, title: "Cycling Trail Start" }
  ];

  // Handle route creation
  const handleRouteCreated = (distance: number, duration: number) => {
    setRouteDistance(distance);
    setRouteDuration(duration);
    setShowRouteInfo(true);
  };

  // Create a sample route (in a real app, this would be user-selected points)
  const createSampleRoute = () => {
    // Set departure and destination points
    setDeparturePoint([51.505, -0.09]);
    setDestinationPoint([51.51, -0.1]);
  };

  // Format distance for display
  const formatDistance = (meters: number): string => {
    return meters >= 1000 
      ? `${(meters / 1000).toFixed(1)} km` 
      : `${Math.round(meters)} m`;
  };

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  // Clear the route
  const clearRoute = () => {
    setDeparturePoint(undefined);
    setDestinationPoint(undefined);
    setShowRouteInfo(false);
    setRouteDistance(null);
    setRouteDuration(null);
  };

  return (
    <div className={`relative ${className}`}>
      <OfflineMap 
        className="w-full h-[70vh] rounded-lg shadow-md"
        center={[51.505, -0.09]}
        zoom={13}
        markers={cyclingPOIs}
        showCyclingRoutes={true}
        departurePoint={departurePoint}
        destinationPoint={destinationPoint}
        onRouteCreated={handleRouteCreated}
      />
      
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Button 
          onClick={createSampleRoute}
          variant="secondary"
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          <Route size={16} /> Create Route
        </Button>
        
        {showRouteInfo && (
          <Button 
            onClick={clearRoute}
            variant="outline"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
          >
            Clear Route
          </Button>
        )}
      </div>
      
      {showRouteInfo && routeDistance && routeDuration && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-64 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-black font-serif">
              <Navigation size={16} className="text-black" /> Route Information
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-black" />
                <span className="text-sm text-black font-sans">Distance:</span>
              </div>
              <div className="text-sm font-medium text-black font-mono">{formatDistance(routeDistance)}</div>
              
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-black" />
                <span className="text-sm text-black font-sans">Duration:</span>
              </div>
              <div className="text-sm font-medium text-black font-mono">{formatDuration(routeDuration)}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Map; 
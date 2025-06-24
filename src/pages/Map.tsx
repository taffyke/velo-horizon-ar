import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import MapContainer, { MapRef, TILE_SOURCES } from '@/components/MapContainer';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Navigation as NavigationIcon,
  Layers,
  Route,
  Bookmark,
  LocateFixed,
  X,
  ArrowRight,
  MoreHorizontal,
  Compass,
  MapPin
} from 'lucide-react';

// Sample cycling background images
const CYCLING_IMAGES = {
  default: '/images/cycling-bg.jpg'
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const Map = () => {
  const { toast } = useToast();
  const mapRef = useRef<MapRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('standard');
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [departureSearch, setDepartureSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [departurePoint, setDeparturePoint] = useState<{ lat: number, lng: number } | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<{ lat: number, lng: number } | null>(null);
  const [backgroundImage, setBackgroundImage] = useState('default');
  const [isRoutingActive, setIsRoutingActive] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLiveTrackingActive, setIsLiveTrackingActive] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  const mapLayers = [
    { id: 'standard', name: 'Standard', description: 'Default view' },
    { id: 'satellite', name: 'Satellite', description: 'Aerial imagery' },
    { id: 'terrain', name: 'Terrain', description: '3D elevation view' },
    { id: 'cycle', name: 'Cycling', description: 'Bike-friendly routes' }
  ];

  useEffect(() => {
    // Request location permissions when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setLocationPermissionDenied(false);
        },
        (error) => {
          console.error('Error getting initial location:', error);
          setLocationPermissionDenied(true);
          
          if (error.code === 1) { // PERMISSION_DENIED
            toast({
              title: "Location Permission Denied",
              description: "Please enable location services in your browser settings to use location features",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Location Error",
              description: "Please enable location services to use all features",
              variant: "destructive",
            });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const centerOnUserLocation = () => {
    if (locationPermissionDenied) {
      toast({
        title: "Location Permission Denied",
        description: "Please enable location services in your browser settings",
        variant: "destructive",
      });
      return;
    }
    
    // Use the map ref to center on location
    if (mapRef.current) {
      mapRef.current.centerOnLocation();
      toast({
        title: "Finding Location",
        description: "Centering map on your location",
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          
          toast({
            title: "Location Found",
            description: "Centering map on your location",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Could not get your location",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a location to search",
      });
      return;
    }
    
    // Use map ref to search
    if (mapRef.current) {
      mapRef.current.searchLocation(searchQuery);
      toast({
        title: "Search Results",
        description: `Found location for: ${searchQuery}`,
      });
    } else {
      toast({
        title: "Map Error",
        description: "Map is not ready yet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleRoutePanel = () => {
    setShowRoutePanel(!showRoutePanel);
  };

  const setDepartureToCurrentLocation = () => {
    if (locationPermissionDenied) {
      toast({
        title: "Location Permission Denied",
        description: "Please enable location services in your browser settings",
        variant: "destructive",
      });
      return;
    }
    
    if (currentLocation) {
      setDeparturePoint({ lat: currentLocation[0], lng: currentLocation[1] });
      toast({
        title: "Location Set",
        description: "Current location set as departure point",
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDeparturePoint({ lat: latitude, lng: longitude });
          setCurrentLocation([latitude, longitude]);
          
          toast({
            title: "Location Set",
            description: "Current location set as departure point",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Could not get your location",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const setDestinationToCurrentLocation = () => {
    if (locationPermissionDenied) {
      toast({
        title: "Location Permission Denied",
        description: "Please enable location services in your browser settings",
        variant: "destructive",
      });
      return;
    }
    
    if (currentLocation) {
      setDestinationPoint({ lat: currentLocation[0], lng: currentLocation[1] });
      toast({
        title: "Location Set",
        description: "Current location set as destination point",
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDestinationPoint({ lat: latitude, lng: longitude });
          setCurrentLocation([latitude, longitude]);
          
          toast({
            title: "Location Set",
            description: "Current location set as destination point",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Could not get your location",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleDepartureSearch = () => {
    // Implementation for departure search
    toast({
      title: "Searching",
      description: `Searching for: ${departureSearch}`,
    });

    // Simulate finding a location after search
    setTimeout(() => {
      // Sample location - in a real app this would come from a geocoding API
      const foundLocation = {
        lat: currentLocation ? currentLocation[0] + 0.01 : 51.505,
        lng: currentLocation ? currentLocation[1] + 0.01 : -0.09
      };
      
      setDeparturePoint(foundLocation);
      
      toast({
        title: "Location Found",
        description: `Found location: ${departureSearch}`,
      });
      
      // Add marker to map
      if (mapRef.current && departurePoint) {
        mapRef.current.addMarker([foundLocation.lat, foundLocation.lng], `Departure: ${departureSearch}`);
      }
    }, 1500);
  };

  const handleDestinationSearch = () => {
    // Implementation for destination search
    toast({
      title: "Searching",
      description: `Searching for: ${destinationSearch}`,
    });

    // Simulate finding a location after search
    setTimeout(() => {
      // Sample location - in a real app this would come from a geocoding API
      const foundLocation = {
        lat: currentLocation ? currentLocation[0] - 0.01 : 51.495,
        lng: currentLocation ? currentLocation[1] - 0.01 : -0.1
      };
      
      setDestinationPoint(foundLocation);
      
      toast({
        title: "Location Found",
        description: `Found location: ${destinationSearch}`,
      });
      
      // Add marker to map
      if (mapRef.current && destinationPoint) {
        mapRef.current.addMarker([foundLocation.lat, foundLocation.lng], `Destination: ${destinationSearch}`);
      }
    }, 1500);
  };

  const clearRoute = () => {
    setDeparturePoint(null);
    setDestinationPoint(null);
    setDepartureSearch('');
    setDestinationSearch('');
    setIsRoutingActive(false);
    setShowRouteInfo(false);
    
    toast({
      title: "Route Cleared",
      description: "All route points have been cleared",
    });
  };

  const createRoute = () => {
    if (departurePoint && destinationPoint) {
      setIsRoutingActive(true);
      setShowRouteInfo(true);
      
      // Simulate route calculation
      const distance = 10.5; // km
      const duration = 45 * 60; // seconds
      
      setRouteDistance(distance);
      setRouteDuration(duration);
      
      handleRouteCreated(distance, duration);
    }
  };

  const handleRouteCreated = (distance: number, duration: number) => {
    toast({
      title: "Route Created",
      description: `Distance: ${distance.toFixed(1)} km, Time: ${formatDuration(duration)}`,
    });
    
    setShowRoutePanel(false);
  };

  const handleLocationUpdate = (position: [number, number]) => {
    setCurrentLocation(position);
  };

  const handleTrackingToggle = (isActive: boolean) => {
    setIsLiveTrackingActive(isActive);
    
    if (isActive) {
      toast({
        title: "Live Tracking Enabled",
        description: "Your location is now being tracked in real-time",
      });
    }
  };

  const changeMapLayer = (layerId: string) => {
    if (mapRef.current) {
      mapRef.current.setLayer(layerId);
      setSelectedLayer(layerId);
      
      toast({
        title: "Map Layer Changed",
        description: `Switched to ${layerId} view`
      });
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main content with map */}
      <div className="flex-1 relative">
        {/* Map container */}
        <div className="absolute inset-0">
          <MapContainer ref={mapRef} />
        </div>
        
        {/* Search overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-10">
          <div className="flex items-center">
            <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations..."
                className="w-full h-10 px-10 rounded-l-full bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
              onClick={handleSearch}
              className="h-10 px-4 rounded-r-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
              Search
              </button>
          </div>
        </div>
        
        {/* Map controls */}
        <div className="absolute bottom-20 right-4 flex flex-col space-y-3 z-10 md:bottom-24">
              <button
                onClick={toggleRoutePanel}
            className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all ${
              showRoutePanel ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
            }`}
            title="Route Planner"
          >
            <Route className="h-5 w-5" />
          </button>
          
          <button
            onClick={centerOnUserLocation}
            className="p-3 rounded-full shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            title="My Location"
          >
            <LocateFixed className="h-5 w-5" />
          </button>
          
          <div className="relative group">
            <button
              className="p-3 rounded-full shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              title="Change Map Layer"
            >
              <Layers className="h-5 w-5" />
              </button>
            
            {/* Layer selector dropdown */}
            <div className="absolute bottom-0 right-full mb-0 mr-2 w-36 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2">
                {mapLayers.map(layer => (
                <button
                  key={layer.id}
                    onClick={() => changeMapLayer(layer.id)}
                    className={`w-full text-left px-3 py-2 rounded-md mb-1 last:mb-0 ${
                    selectedLayer === layer.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {layer.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* Route planning panel */}
        {showRoutePanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-full sm:w-80 md:w-96 bg-white dark:bg-gray-800 shadow-lg z-20 overflow-hidden"
          >
            <div className="flex flex-col h-full pb-16 md:pb-0">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Route Planner</h3>
                <button 
                  onClick={toggleRoutePanel}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Departure point */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Departure Point</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={departureSearch}
                      onChange={(e) => setDepartureSearch(e.target.value)}
                      placeholder="Enter departure location"
                      className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <button
                    onClick={setDepartureToCurrentLocation}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500"
                    title="Use current location"
                  >
                      <LocateFixed className="h-5 w-5" />
                  </button>
                  </div>
                  {departureSearch && (
                  <button
                    onClick={handleDepartureSearch}
                      className="mt-2 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                      Search
                  </button>
                  )}
                  {departurePoint && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Selected:</span> {departurePoint.lat.toFixed(6)}, {departurePoint.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
              </div>
              
                {/* Destination point */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Destination Point</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destinationSearch}
                      onChange={(e) => setDestinationSearch(e.target.value)}
                      placeholder="Enter destination location"
                      className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <button
                      onClick={setDestinationToCurrentLocation}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500"
                      title="Use current location"
                    >
                      <LocateFixed className="h-5 w-5" />
                    </button>
                  </div>
                  {destinationSearch && (
                    <button
                      onClick={handleDestinationSearch}
                      className="mt-2 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Search
                    </button>
                  )}
                  {destinationPoint && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Selected:</span> {destinationPoint.lat.toFixed(6)}, {destinationPoint.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={createRoute}
                    disabled={!departurePoint || !destinationPoint}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center space-x-2 ${
                      !departurePoint || !destinationPoint
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Route className="h-5 w-5" />
                    <span>Create Route</span>
                  </button>
                  
                  <button
                    onClick={clearRoute}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <X className="h-5 w-5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Route info panel */}
        {showRouteInfo && (
          <div className="absolute bottom-20 left-4 right-4 max-w-md mx-auto bg-black bg-opacity-80 text-white rounded-lg shadow-lg p-4 z-10 md:bottom-24">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Route Information</h3>
              <button
                onClick={() => setShowRouteInfo(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <span className="block text-gray-400 text-sm">Distance</span>
                <p className="text-lg font-medium">{routeDistance.toFixed(1)} km</p>
                </div>
                <div>
                <span className="block text-gray-400 text-sm">Duration</span>
                <p className="text-lg font-medium">{formatDuration(routeDuration)}</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                Start Navigation
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg">
                <Bookmark className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Location permission denied message */}
        {locationPermissionDenied && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md text-center">
            Location permission denied. Please enable location services.
          </div>
        )}
          </div>

      {/* Navigation bar - fixed at bottom */}
      <div className="w-full z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16">
          <Navigation />
      </div>
    </div>
  );
};

export default Map;

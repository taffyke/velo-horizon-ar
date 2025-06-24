
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import OfflineMap from '@/components/OfflineMap';
import WeatherWidget from '@/components/WeatherWidget';
import { 
  Search, 
  Plus, 
  Navigation as NavigationIcon,
  Layers,
  Route,
  Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Map = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('terrain');
  const [isNavigating, setIsNavigating] = useState(false);

  const mapLayers = [
    { id: 'terrain', name: 'Terrain', description: '3D elevation view' },
    { id: 'satellite', name: 'Satellite', description: 'Aerial imagery' },
    { id: 'cycling', name: 'Cycling', description: 'Bike-friendly routes' },
    { id: 'traffic', name: 'Traffic', description: 'Real-time conditions' }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a location to search",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Searching for:', searchQuery);
    toast({
      title: "Searching...",
      description: `Looking for "${searchQuery}"`,
    });
    
    // Simulate search results
    setTimeout(() => {
      toast({
        title: "Search Complete",
        description: `Found results for "${searchQuery}"`,
      });
    }, 2000);
  };

  const handleAddLocation = () => {
    // Get current location and show marker
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Location Found",
            description: "Current location displayed on map",
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Could not get current location",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleNavigation = () => {
    setIsNavigating(!isNavigating);
    toast({
      title: isNavigating ? "Navigation Stopped" : "Navigation Started",
      description: isNavigating ? "Turn-by-turn navigation disabled" : "Turn-by-turn navigation enabled",
    });
  };

  const handleLayerChange = (layerId: string) => {
    setSelectedLayer(layerId);
    const layer = mapLayers.find(l => l.id === layerId);
    toast({
      title: "Layer Changed",
      description: `Switched to ${layer?.name} view`,
    });
  };

  const handleCreateRoute = () => {
    toast({
      title: "Route Planning",
      description: "Click on the map to add waypoints for your route",
    });
  };

  const handleBookmark = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Location Bookmarked",
            description: "Current location saved to bookmarks",
          });
        },
        () => {
          toast({
            title: "Bookmark Error",
            description: "Could not bookmark current location",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-day relative">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 z-20 p-4"
        >
          <div className="glass-morphism rounded-xl p-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                <input
                  type="text"
                  placeholder="Search locations or routes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cycling-primary"
                />
              </div>
              <motion.button
                className="cycling-button p-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddLocation}
                title="Find current location"
              >
                <Plus size={20} />
              </motion.button>
            </div>

            {/* Layer Selection */}
            <div className="flex space-x-2 overflow-x-auto">
              {mapLayers.map((layer) => (
                <motion.button
                  key={layer.id}
                  onClick={() => handleLayerChange(layer.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedLayer === layer.id
                      ? 'bg-cycling-primary text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {layer.name}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Map Area */}
        <div className="flex-1 relative mt-40">
          <OfflineMap 
            className="absolute inset-0 rounded-t-3xl"
          />
        </div>

        {/* Weather Widget */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-64"
        >
          <WeatherWidget />
        </motion.div>

        {/* Route Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20"
        >
          <div className="glass-morphism rounded-xl p-4 space-y-3">
            <motion.button
              className={`p-3 w-full rounded-lg transition-all ${
                isNavigating 
                  ? 'bg-cycling-primary text-white' 
                  : 'cycling-button'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNavigation}
              title="Toggle Navigation"
            >
              <NavigationIcon size={20} />
            </motion.button>
            <motion.button
              className="glass-morphism p-3 text-white hover:bg-white/20 rounded-lg transition-all w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLayerChange(selectedLayer === 'cycling' ? 'terrain' : 'cycling')}
              title="Change Layer"
            >
              <Layers size={20} />
            </motion.button>
            <motion.button
              className="glass-morphism p-3 text-white hover:bg-white/20 rounded-lg transition-all w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRoute}
              title="Create Route"
            >
              <Route size={20} />
            </motion.button>
            <motion.button
              className="glass-morphism p-3 text-white hover:bg-white/20 rounded-lg transition-all w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookmark}
              title="Bookmark Location"
            >
              <Bookmark size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation Status */}
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 left-4 right-4 z-20"
          >
            <div className="glass-morphism rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <NavigationIcon className="text-cycling-primary animate-pulse" size={24} />
                <div>
                  <h3 className="text-white font-semibold">Navigation Active</h3>
                  <p className="text-white/60 text-sm">Turn-by-turn directions enabled</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <Navigation />
        </div>
      </div>
    </div>
  );
};

export default Map;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import OfflineMap from '@/components/OfflineMap';
import WeatherWidget from '@/components/WeatherWidget';
import { 
  Search, 
  Plus, 
  MapPin, 
  Navigation as NavigationIcon,
  Layers,
  Route,
  Bookmark
} from 'lucide-react';

const Map = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('terrain');

  const mapLayers = [
    { id: 'terrain', name: 'Terrain', description: '3D elevation view' },
    { id: 'satellite', name: 'Satellite', description: 'Aerial imagery' },
    { id: 'cycling', name: 'Cycling', description: 'Bike-friendly routes' },
    { id: 'traffic', name: 'Traffic', description: 'Real-time conditions' }
  ];

  const savedRoutes = [
    { name: 'Mountain Trail Loop', distance: '42.7 km', difficulty: 'Hard', markers: [{ lat: 0.1, lng: 0.1, title: 'Start' }] },
    { name: 'City Park Circuit', distance: '28.3 km', difficulty: 'Medium', markers: [{ lat: -0.1, lng: 0.1, title: 'Park' }] },
    { name: 'Riverside Path', distance: '35.6 km', difficulty: 'Easy', markers: [{ lat: 0.1, lng: -0.1, title: 'River' }] }
  ];

  const [selectedRoute, setSelectedRoute] = useState(savedRoutes[0]);

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
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cycling-primary"
                />
              </div>
              <motion.button
                className="cycling-button p-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
              </motion.button>
            </div>

            {/* Layer Selection */}
            <div className="flex space-x-2 overflow-x-auto">
              {mapLayers.map((layer) => (
                <motion.button
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
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
            markers={selectedRoute.markers}
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
              className="cycling-button p-3 w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Navigate"
            >
              <NavigationIcon size={20} />
            </motion.button>
            <motion.button
              className="glass-morphism p-3 text-white hover:bg-white/20 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Change Layer"
            >
              <Layers size={20} />
            </motion.button>
            <motion.button
              className="glass-morphism p-3 text-white hover:bg-white/20 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Create Route"
            >
              <Route size={20} />
            </motion.button>
            <motion.button
              className="glass-morphism p-3 text-white hover:bg-white/20 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Save Location"
            >
              <Bookmark size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Saved Routes Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-24 left-4 right-4 z-20"
        >
          <div className="glass-morphism rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Saved Routes</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {savedRoutes.map((route, index) => (
                <motion.div
                  key={route.name}
                  onClick={() => setSelectedRoute(route)}
                  className={`flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                    selectedRoute.name === route.name ? 'bg-white/10' : 'bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div>
                    <p className="text-white font-medium text-sm">{route.name}</p>
                    <p className="text-white/60 text-xs">{route.distance}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    route.difficulty === 'Hard' ? 'bg-red-500/20 text-red-300' :
                    route.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {route.difficulty}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <Navigation />
        </div>
      </div>
    </div>
  );
};

export default Map;

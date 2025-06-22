
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThreeScene from '@/components/ThreeScene';
import { useTheme } from '@/hooks/use-theme';

const Index = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const getBackgroundGradient = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return 'bg-gradient-dawn';
    if (hour >= 10 && hour < 17) return 'bg-gradient-day';
    if (hour >= 17 && hour < 21) return 'bg-gradient-dusk';
    return 'bg-gradient-night';
  };

  return (
    <div className={`min-h-screen ${getBackgroundGradient()} relative overflow-hidden`}>
      {/* Three.js Background Scene */}
      <div className="absolute inset-0 opacity-30">
        <ThreeScene className="w-full h-full" />
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <motion.h1 
              className="text-5xl md:text-7xl font-orbitron font-bold text-white drop-shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              CYCLETRACK
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl font-orbitron font-medium text-white/90 drop-shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              PRO
            </motion.p>
            <motion.p 
              className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              Cutting-edge offline-first cycling companion with 3D terrain visualization, 
              real-time GPS tracking, and intelligent route planning
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="cycling-button px-8 py-4 text-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Cycling
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/map')}
              className="glass-morphism px-8 py-4 text-lg font-semibold text-white rounded-lg hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Routes
            </motion.button>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-6 mt-12 text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cycling-primary rounded-full"></div>
              <span>Offline Maps</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cycling-secondary rounded-full"></div>
              <span>3D Terrain</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cycling-accent rounded-full"></div>
              <span>GPS Tracking</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-32 right-16 w-6 h-6 bg-cycling-primary/30 rounded-full"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-32 left-20 w-3 h-3 bg-cycling-secondary/40 rounded-full"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
};

export default Index;

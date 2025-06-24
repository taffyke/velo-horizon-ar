
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Activity, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThreeScene from '@/components/ThreeScene';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-cycling relative overflow-hidden">
      {/* 3D Background Scene */}
      <div className="absolute inset-0 opacity-30">
        <ThreeScene />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-orbitron font-bold text-white mb-4 sm:mb-6">
                CYCLE<span className="text-cycling-primary">TRACK</span>
                <span className="text-cycling-accent block text-xl sm:text-3xl md:text-4xl mt-1 sm:mt-2">PRO</span>
              </h1>
              
              <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Transform your cycling experience with advanced tracking, 
                real-time analytics, and professional insights.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
              >
                <Button
                  onClick={() => navigate('/auth')}
                  size="lg"
                  className="bg-cycling-primary hover:bg-cycling-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold group w-full sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="pb-8 sm:pb-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {[
                {
                  icon: Activity,
                  title: 'Live Tracking',
                  description: 'Real-time GPS tracking with advanced metrics'
                },
                {
                  icon: TrendingUp,
                  title: 'Analytics',
                  description: 'Detailed performance analysis and insights'
                },
                {
                  icon: Target,
                  title: 'Goal Setting',
                  description: 'Set and achieve your cycling objectives'
                },
                {
                  icon: Users,
                  title: 'Community',
                  description: 'Connect with fellow cycling enthusiasts'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="glass-morphism rounded-lg sm:rounded-xl p-3 sm:p-6 text-center"
                >
                  <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 bg-cycling-primary/20 rounded-lg flex items-center justify-center">
                    <feature.icon className="text-cycling-primary" size={16} />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm hidden sm:block">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;

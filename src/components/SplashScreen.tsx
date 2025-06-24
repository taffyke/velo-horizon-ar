import React from 'react';
import { Bike } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative mb-6">
        <div className="mb-8">
          <Bike size={80} className="text-white/80" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-white text-center">
          CYCLE<span className="text-cycling-primary">TRACK</span>
          <span className="text-cycling-accent block text-3xl md:text-4xl mt-2">PRO</span>
        </h1>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <div className="w-16 h-1 bg-cycling-primary rounded-full mb-4"></div>
        <p className="text-white/80 text-center">Advanced Cycling Analytics</p>
      </div>
      
      <div className="mt-12">
        <div className="w-12 h-1 bg-white/30 rounded-full mb-2"></div>
        <div className="w-24 h-1 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default SplashScreen; 
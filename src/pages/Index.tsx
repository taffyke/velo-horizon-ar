import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';
import { motion } from 'framer-motion';
import { Bike, Activity, Map, Trophy, User } from 'lucide-react';
import { ArrowRight, MapPin, Route, Shield } from 'lucide-react';
import Navigation from '@/components/Navigation';

// Cycling background images
const CYCLING_IMAGES = [
  '/assets/images/cycling-background-1.jpg',
  '/assets/images/cycling-background-2.jpg'
];

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState(0);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      // Auto-navigate to dashboard after splash screen
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 5000); // Increased to give users time to read the info

      return () => clearTimeout(timer);
    }
  }, [loading, navigate]);

  const features = [
    { 
      icon: Activity, 
      title: "Live Tracking", 
      description: "Real-time speed and distance monitoring with GPS fusion" 
    },
    { 
      icon: Map, 
      title: "Route Mapping", 
      description: "Plan and save your favorite cycling routes" 
    },
    { 
      icon: Trophy, 
      title: "Achievements", 
      description: "Earn badges and track your cycling milestones" 
    },
    { 
      icon: User, 
      title: "Performance Stats", 
      description: "Detailed analytics of your cycling performance" 
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-cycling">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between py-16 gap-8">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold text-black font-serif mb-4">
              Track Your Cycling Journey
            </h1>
            <p className="text-xl text-black font-sans mb-8">
              Plan routes, track performance, and explore new cycling adventures with Cycle Track.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/map" className="cycling-button-primary px-6 py-3 flex items-center gap-2">
                <span className="text-black font-sans">Explore Map</span>
                <ArrowRight size={20} className="text-black" />
              </Link>
              <Link to="/routes" className="cycling-button-secondary px-6 py-3 flex items-center gap-2">
                <span className="text-black font-sans">View Routes</span>
                <Route size={20} className="text-black" />
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative h-80 md:h-[500px] w-full rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1470&auto=format&fit=crop"
              alt="Cyclist on mountain trail"
              className="rounded-2xl object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-black font-serif">
            Why Choose Cycle Track
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
              <div className="w-12 h-12 bg-cycling-primary/20 rounded-full flex items-center justify-center mb-4">
                <MapPin size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black font-serif">Offline Maps</h3>
              <p className="text-black font-sans">
                Download routes and maps for offline use. Never get lost, even without cell service.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
              <div className="w-12 h-12 bg-cycling-primary/20 rounded-full flex items-center justify-center mb-4">
                <Route size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black font-serif">Smart Routing</h3>
              <p className="text-black font-sans">
                Discover cycling-friendly routes with real-time traffic updates and elevation data.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
              <div className="w-12 h-12 bg-cycling-primary/20 rounded-full flex items-center justify-center mb-4">
                <Activity size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black font-serif">Performance Tracking</h3>
              <p className="text-black font-sans">
                Monitor your speed, distance, and calories burned in real-time during your rides.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center">
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-8 rounded-xl">
            <h2 className="text-3xl font-bold mb-4 text-black font-serif">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8 text-black font-sans">
              Join thousands of cyclists who trust Cycle Track for their cycling adventures.
            </p>
            <Link to="/map" className="cycling-button-primary px-8 py-4 inline-flex items-center gap-2">
              <span className="text-black font-sans">Get Started Now</span>
              <ArrowRight size={20} className="text-black" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-50">
        <Navigation />
    </div>
    </main>
  );
};

export default Index;

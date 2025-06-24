import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { 
  Trophy, 
  Award, 
  Zap, 
  Map, 
  Clock, 
  Mountain, 
  Calendar,
  Plus,
  X,
  Save,
  ArrowRight
} from 'lucide-react';

// Cycling background images
const CYCLING_IMAGES = [
  '/assets/images/cycling-background-1.jpg',
  '/assets/images/cycling-background-2.jpg'
];

// Achievement categories
const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'distance', name: 'Distance' },
  { id: 'speed', name: 'Speed' },
  { id: 'elevation', name: 'Elevation' },
  { id: 'time', name: 'Time' },
  { id: 'custom', name: 'Custom' }
];

const Achievements = () => {
  const [backgroundImage, setBackgroundImage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    category: 'custom',
    icon: 'trophy',
    color: 'blue'
  });
  
  // Empty achievements array for new users
  const achievements: any[] = [];

  const handleCreateAchievement = () => {
    // In a real app, this would save to the database
    console.log('Creating new achievement:', newAchievement);
    setShowCreateModal(false);
    // Reset form
    setNewAchievement({
      title: '',
      description: '',
      category: 'custom',
      icon: 'trophy',
      color: 'blue'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-cycling relative">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
        style={{ 
          backgroundImage: `url(${CYCLING_IMAGES[backgroundImage]})`,
          transition: 'background-image 1s ease-in-out'
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-orbitron font-bold text-black mb-2">
            Achievements
          </h1>
          <p className="text-black/80">
            Create and track your cycling goals
          </p>
        </motion.div>
        
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-cycling-primary text-black'
                  : 'bg-white/10 text-black/80 hover:bg-white/20'
              }`}
            >
              {category.name}
            </button>
          ))}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-cycling-accent/80 text-black hover:bg-cycling-accent flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Create</span>
          </button>
        </motion.div>
        
        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism rounded-xl p-8 text-center"
        >
          <Trophy className="mx-auto text-cycling-accent/50 mb-6" size={64} />
          <h2 className="text-2xl font-bold text-black mb-3 font-serif">Start Your Journey</h2>
          <p className="text-black/70 mb-6 max-w-md mx-auto font-sans">
            Create your first achievement to start tracking your cycling goals. Choose from predefined categories or create custom goals.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-cycling-primary text-black rounded-lg hover:bg-cycling-primary/90 transition-colors inline-flex items-center space-x-2 font-sans"
          >
            <Plus size={20} />
            <span>Create Your First Achievement</span>
          </button>
        </motion.div>
      </div>
      
      {/* Create Achievement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="glass-morphism rounded-xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-black font-serif">Create Achievement</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-black/70 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-black/80 text-sm mb-1 font-sans">Title</label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-black focus:outline-none focus:border-cycling-primary font-sans"
                  placeholder="e.g. Mountain Explorer"
                />
              </div>
              
              <div>
                <label className="block text-black/80 text-sm mb-1 font-sans">Description</label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-black focus:outline-none focus:border-cycling-primary h-20 resize-none font-sans"
                  placeholder="e.g. Complete 5 mountain rides"
                />
              </div>
              
              <div>
                <label className="block text-black/80 text-sm mb-1 font-sans">Category</label>
                <select
                  value={newAchievement.category}
                  onChange={(e) => setNewAchievement({...newAchievement, category: e.target.value})}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-black focus:outline-none focus:border-cycling-primary font-sans"
                >
                  {CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-black/80 text-sm mb-1 font-sans">Icon</label>
                <select
                  value={newAchievement.icon}
                  onChange={(e) => setNewAchievement({...newAchievement, icon: e.target.value})}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-black focus:outline-none focus:border-cycling-primary font-sans"
                >
                  <option value="trophy">Trophy</option>
                  <option value="award">Award</option>
                  <option value="zap">Lightning</option>
                  <option value="map">Map</option>
                  <option value="clock">Clock</option>
                  <option value="mountain">Mountain</option>
                  <option value="calendar">Calendar</option>
                </select>
              </div>
              
              <div>
                <label className="block text-black/80 text-sm mb-1 font-sans">Color</label>
                <select
                  value={newAchievement.color}
                  onChange={(e) => setNewAchievement({...newAchievement, color: e.target.value})}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-black focus:outline-none focus:border-cycling-primary font-sans"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                  <option value="orange">Orange</option>
                  <option value="teal">Teal</option>
                  <option value="indigo">Indigo</option>
                  <option value="pink">Pink</option>
                  <option value="cycling">Cycling</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleCreateAchievement}
                className="px-4 py-2 rounded-lg bg-cycling-primary text-black hover:bg-cycling-primary/80 flex items-center space-x-1 font-sans"
                disabled={!newAchievement.title || !newAchievement.description}
              >
                <Save size={16} />
                <span>Create Achievement</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
        <Navigation />
      </div>
    </div>
  );
};

export default Achievements; 
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  Edit,
  Camera,
  Bike,
  Weight,
  Ruler,
  Activity
} from 'lucide-react';

// Cycling background images
const CYCLING_IMAGES = [
  '/assets/images/cycling-background-1.jpg',
  '/assets/images/cycling-background-2.jpg'
];

const Profile = () => {
  const { profile, cyclingData, loading, updateProfile, updateCyclingData } = useUserProfile();
  const [backgroundImage, setBackgroundImage] = useState(0);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    date_of_birth: '',
    height_cm: 0,
    weight_kg: 0,
    experience_years: 0,
    preferred_cycling_type: 'road',
    fitness_level: 'intermediate'
  });
  
  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        country: profile.country || '',
        city: profile.city || '',
        date_of_birth: profile.date_of_birth || '',
      }));
    }
    if (cyclingData) {
      setFormData(prev => ({
        ...prev,
        height_cm: cyclingData.height_cm || 0,
        weight_kg: cyclingData.weight_kg || 0,
        experience_years: cyclingData.experience_years || 0,
        preferred_cycling_type: cyclingData.preferred_cycling_type || 'road',
        fitness_level: cyclingData.fitness_level || 'intermediate',
      }));
    }
  }, [profile, cyclingData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    // Update profile data
    const profileData = {
      full_name: formData.full_name,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
      date_of_birth: formData.date_of_birth
    };
    
    // Update cycling data
    const cyclingDataUpdate = {
      height_cm: Number(formData.height_cm),
      weight_kg: Number(formData.weight_kg),
      experience_years: Number(formData.experience_years),
      preferred_cycling_type: formData.preferred_cycling_type,
      fitness_level: formData.fitness_level
    };
    
    await updateProfile(profileData);
    await updateCyclingData(cyclingDataUpdate);
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cycling flex items-center justify-center">
        <div className="glass-morphism rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cycling-primary mx-auto"></div>
          <p className="text-white text-center mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

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
      
      <div className="container mx-auto px-4 py-6 relative z-10 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
            Your Profile
          </h1>
          <p className="text-white/80">
            Manage your personal information and cycling preferences
          </p>
        </motion.div>
        
        {/* Profile Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-white/60" />
              )}
            </div>
            
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-cycling-primary flex items-center justify-center text-white">
              <Camera size={16} />
            </button>
          </div>
        </motion.div>
        
        {/* Edit/Save Button */}
        <div className="flex justify-end mb-4">
          {editMode ? (
            <button 
              onClick={handleSave}
              className="cycling-button px-4 py-2 flex items-center space-x-1"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          ) : (
            <button 
              onClick={() => setEditMode(true)}
              className="glass-morphism px-4 py-2 text-white hover:bg-white/20 rounded-lg flex items-center space-x-1 transition-all"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
        
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <User className="text-cycling-primary mr-2" size={20} />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/70 text-sm mb-1">Full Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                />
              ) : (
                <p className="text-white">{profile?.full_name || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Email</label>
              <p className="text-white">{profile?.email || 'Not set'}</p>
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Phone</label>
              {editMode ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                />
              ) : (
                <p className="text-white">{profile?.phone || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Date of Birth</label>
              {editMode ? (
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                />
              ) : (
                <p className="text-white">{profile?.date_of_birth || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Country</label>
              {editMode ? (
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                />
              ) : (
                <p className="text-white">{profile?.country || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">City</label>
              {editMode ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                />
              ) : (
                <p className="text-white">{profile?.city || 'Not set'}</p>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Cycling Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-morphism rounded-xl p-6 mb-20"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Bike className="text-cycling-accent mr-2" size={20} />
            Cycling Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/70 text-sm mb-1">Height (cm)</label>
              {editMode ? (
                <input
                  type="number"
                  name="height_cm"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                />
              ) : (
                <p className="text-white">{cyclingData?.height_cm || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Weight (kg)</label>
              {editMode ? (
                <input
                  type="number"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                />
              ) : (
                <p className="text-white">{cyclingData?.weight_kg || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Experience (years)</label>
              {editMode ? (
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                />
              ) : (
                <p className="text-white">{cyclingData?.experience_years || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Preferred Cycling Type</label>
              {editMode ? (
                <select
                  name="preferred_cycling_type"
                  value={formData.preferred_cycling_type}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                >
                  <option value="road">Road</option>
                  <option value="mountain">Mountain</option>
                  <option value="gravel">Gravel</option>
                  <option value="commuting">Commuting</option>
                  <option value="touring">Touring</option>
                </select>
              ) : (
                <p className="text-white capitalize">{cyclingData?.preferred_cycling_type || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-1">Fitness Level</label>
              {editMode ? (
                <select
                  name="fitness_level"
                  value={formData.fitness_level}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cycling-primary"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professional">Professional</option>
                </select>
              ) : (
                <p className="text-white capitalize">{cyclingData?.fitness_level || 'Not set'}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
        <Navigation />
      </div>
    </div>
  );
};

export default Profile; 
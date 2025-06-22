
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useTheme } from '@/hooks/use-theme';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Smartphone,
  Bell,
  Shield,
  Download,
  User,
  Palette,
  Activity
} from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { profile, cyclingData, updateProfile, updateCyclingData, loading } = useUserProfile();
  const [localProfile, setLocalProfile] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    country: profile?.country || '',
    city: profile?.city || '',
  });
  const [localCyclingData, setLocalCyclingData] = useState({
    weight_kg: cyclingData?.weight_kg || '',
    height_cm: cyclingData?.height_cm || '',
    fitness_level: cyclingData?.fitness_level || 'beginner',
    preferred_cycling_type: cyclingData?.preferred_cycling_type || 'road',
  });

  React.useEffect(() => {
    if (profile) {
      setLocalProfile({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        city: profile.city || '',
      });
    }
  }, [profile]);

  React.useEffect(() => {
    if (cyclingData) {
      setLocalCyclingData({
        weight_kg: cyclingData.weight_kg?.toString() || '',
        height_cm: cyclingData.height_cm?.toString() || '',
        fitness_level: cyclingData.fitness_level || 'beginner',
        preferred_cycling_type: cyclingData.preferred_cycling_type || 'road',
      });
    }
  }, [cyclingData]);

  const handleProfileSave = (field: string, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
    updateProfile({ [field]: value });
  };

  const handleCyclingDataSave = (field: string, value: string | number) => {
    const numericFields = ['weight_kg', 'height_cm'];
    const finalValue = numericFields.includes(field) && typeof value === 'string' 
      ? parseFloat(value) || null 
      : value;
    
    setLocalCyclingData(prev => ({ ...prev, [field]: value.toString() }));
    updateCyclingData({ [field]: finalValue });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cycling flex items-center justify-center">
        <div className="glass-morphism rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cycling-primary mx-auto"></div>
          <p className="text-white text-center mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          label: 'Theme',
          value: theme,
          type: 'select',
          options: [
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'auto', label: 'Auto', icon: Smartphone }
          ],
          onChange: setTheme
        }
      ]
    },
    {
      title: 'Profile',
      icon: User,
      items: [
        { 
          label: 'Full Name', 
          value: localProfile.full_name, 
          type: 'text',
          onChange: (value: string) => handleProfileSave('full_name', value)
        },
        { 
          label: 'Email', 
          value: profile?.email || '', 
          type: 'readonly'
        },
        { 
          label: 'Phone', 
          value: localProfile.phone, 
          type: 'text',
          onChange: (value: string) => handleProfileSave('phone', value)
        },
        { 
          label: 'Country', 
          value: localProfile.country, 
          type: 'text',
          onChange: (value: string) => handleProfileSave('country', value)
        },
        { 
          label: 'City', 
          value: localProfile.city, 
          type: 'text',
          onChange: (value: string) => handleProfileSave('city', value)
        }
      ]
    },
    {
      title: 'Cycling Data',
      icon: Activity,
      items: [
        { 
          label: 'Weight (kg)', 
          value: localCyclingData.weight_kg, 
          type: 'number',
          onChange: (value: string) => handleCyclingDataSave('weight_kg', value)
        },
        { 
          label: 'Height (cm)', 
          value: localCyclingData.height_cm, 
          type: 'number',
          onChange: (value: string) => handleCyclingDataSave('height_cm', value)
        },
        { 
          label: 'Fitness Level', 
          value: localCyclingData.fitness_level, 
          type: 'select',
          options: [
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
            { value: 'professional', label: 'Professional' }
          ],
          onChange: (value: string) => handleCyclingDataSave('fitness_level', value)
        },
        { 
          label: 'Preferred Type', 
          value: localCyclingData.preferred_cycling_type, 
          type: 'select',
          options: [
            { value: 'road', label: 'Road' },
            { value: 'mountain', label: 'Mountain' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'electric', label: 'Electric' },
            { value: 'bmx', label: 'BMX' }
          ],
          onChange: (value: string) => handleCyclingDataSave('preferred_cycling_type', value)
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-cycling relative">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-white/80">
            Customize your cycling experience
          </p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6 mb-20">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="glass-morphism rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <section.icon className="text-cycling-primary" size={24} />
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                  >
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.type === 'select' && item.options && (
                        <select
                          value={item.value}
                          onChange={(e) => item.onChange?.(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cycling-primary"
                        >
                          {item.options.map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-800">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {item.type === 'text' && (
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => item.onChange?.(e.target.value)}
                          onBlur={(e) => item.onChange?.(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cycling-primary w-32"
                        />
                      )}

                      {item.type === 'number' && (
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => item.onChange?.(e.target.value)}
                          onBlur={(e) => item.onChange?.(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cycling-primary w-32"
                        />
                      )}

                      {item.type === 'readonly' && (
                        <span className="text-white/60 text-sm">{item.value}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-morphism rounded-xl p-6 mb-20 text-center"
        >
          <h3 className="text-lg font-semibold text-white mb-2">CycleTrack PRO</h3>
          <p className="text-white/60 text-sm mb-4">Version 1.0.0</p>
          <div className="flex justify-center space-x-4 text-sm text-white/60">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
            <button className="hover:text-white transition-colors">Support</button>
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

export default Settings;


import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useTheme } from '@/hooks/use-theme';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Smartphone,
  Bell,
  Shield,
  Download,
  User,
  Palette
} from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();

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
        { label: 'Name', value: 'Cyclist Pro', type: 'text' },
        { label: 'Email', value: 'cyclist@example.com', type: 'text' },
        { label: 'Weight', value: '70 kg', type: 'text' },
        { label: 'Height', value: '175 cm', type: 'text' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Ride Reminders', value: true, type: 'toggle' },
        { label: 'Achievement Alerts', value: true, type: 'toggle' },
        { label: 'Weather Updates', value: false, type: 'toggle' },
        { label: 'Social Updates', value: true, type: 'toggle' }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        { label: 'Location Sharing', value: false, type: 'toggle' },
        { label: 'Activity Visibility', value: 'Friends Only', type: 'select', options: [
          { value: 'public', label: 'Public' },
          { value: 'friends', label: 'Friends Only' },
          { value: 'private', label: 'Private' }
        ]},
        { label: 'Data Backup', value: true, type: 'toggle' }
      ]
    },
    {
      title: 'Data & Storage',
      icon: Download,
      items: [
        { label: 'Auto-sync', value: true, type: 'toggle' },
        { label: 'Offline Maps', value: '2.3 GB', type: 'info' },
        { label: 'Export Data', value: 'GPX, KML, CSV', type: 'action' },
        { label: 'Clear Cache', value: 'Free up space', type: 'action' }
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
                      {item.type === 'info' && (
                        <p className="text-sm text-white/60">{item.value}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.type === 'toggle' && (
                        <motion.button
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            item.value ? 'bg-cycling-primary' : 'bg-white/20'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
                            animate={{ x: item.value ? 24 : 2 }}
                          />
                        </motion.button>
                      )}

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
                          defaultValue={item.value}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cycling-primary w-32"
                        />
                      )}

                      {item.type === 'action' && (
                        <motion.button
                          className="cycling-button px-4 py-2 text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Action
                        </motion.button>
                      )}

                      {item.type === 'info' && (
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
          <h3 className="text-lg font-semibold text-white mb-2">CycleTrack Pro</h3>
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

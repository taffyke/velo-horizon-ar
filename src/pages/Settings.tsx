import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  HelpCircle, 
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleNotifications = () => setNotifications(!notifications);
  const toggleLocationTracking = () => setLocationTracking(!locationTracking);
  const toggleOfflineMode = () => setOfflineMode(!offlineMode);
  const toggleUnits = () => setUnits(units === 'metric' ? 'imperial' : 'metric');
  
  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    // Add your edit profile logic here
  };
  
  const handleHelpSupport = () => {
    console.log('Help & Support clicked');
    // Add your help and support navigation logic here
  };
  
  const handlePrivacyPolicy = () => {
    console.log('Privacy Policy clicked');
    // Add your privacy policy navigation logic here
  };
  
  const handleLogout = () => {
    console.log('Logout clicked');
    // Add your logout logic here
  };

  return (
    <div className="min-h-screen bg-gradient-cycling">
      <div className="container mx-auto px-4 py-8 pb-24">
        <h1 className="text-3xl font-bold mb-6 text-black font-serif">Settings</h1>
        
        {/* User Profile */}
        <Card className="mb-6 bg-white/10 backdrop-blur-sm border-none">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-cycling-primary/20 flex items-center justify-center mr-4">
                <User className="h-8 w-8 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black font-serif">John Rider</h2>
                <p className="text-sm text-black/70 font-sans">john.rider@example.com</p>
              </div>
              <button 
                onClick={handleEditProfile}
                className="ml-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-black rounded-lg transition-all font-sans text-sm active:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer transform hover:scale-105 active:scale-95"
              >
                Edit Profile
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* App Settings */}
        <Card className="mb-6 bg-white/10 backdrop-blur-sm border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-serif text-black">App Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-center">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-black mr-3" />
                  ) : (
                    <Sun className="h-5 w-5 text-black mr-3" />
                  )}
                  <span className="text-black font-sans">Dark Mode</span>
                </div>
                <button onClick={toggleDarkMode} className="focus:outline-none">
                  {darkMode ? (
                    <ToggleRight className="h-6 w-6 text-cycling-primary" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-black/50" />
                  )}
                </button>
              </div>
              
              {/* Notifications */}
              <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-black mr-3" />
                  <span className="text-black font-sans">Notifications</span>
                </div>
                <button onClick={toggleNotifications} className="focus:outline-none">
                  {notifications ? (
                    <ToggleRight className="h-6 w-6 text-cycling-primary" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-black/50" />
                  )}
                </button>
              </div>
              
              {/* Location Tracking */}
              <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-black mr-3" />
                  <span className="text-black font-sans">Location Tracking</span>
                </div>
                <button onClick={toggleLocationTracking} className="focus:outline-none">
                  {locationTracking ? (
                    <ToggleRight className="h-6 w-6 text-cycling-primary" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-black/50" />
                  )}
                </button>
              </div>
              
              {/* Offline Mode */}
              <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-black mr-3" />
                  <span className="text-black font-sans">Offline Mode</span>
                </div>
                <button onClick={toggleOfflineMode} className="focus:outline-none">
                  {offlineMode ? (
                    <ToggleRight className="h-6 w-6 text-cycling-primary" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-black/50" />
                  )}
                </button>
              </div>
              
              {/* Units */}
              <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" onClick={toggleUnits}>
                <div className="flex items-center">
                  <span className="h-5 w-5 text-black mr-3 font-mono text-center">km</span>
                  <span className="text-black font-sans">Units</span>
                </div>
                <div className="flex items-center">
                  <span className="text-black/70 text-sm font-mono mr-2">
                    {units === 'metric' ? 'Metric (km)' : 'Imperial (mi)'}
                  </span>
                  <ChevronRight className="h-5 w-5 text-black/50" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Support */}
        <Card className="mb-6 bg-white/10 backdrop-blur-sm border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-serif text-black">Support</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <button 
                onClick={handleHelpSupport}
                className="w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-black mr-3" />
                    <span className="text-black font-sans">Help & Support</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-black/50" />
                </div>
              </button>
              
              <button 
                onClick={handlePrivacyPolicy}
                className="w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-black mr-3" />
                    <span className="text-black font-sans">Privacy Policy</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-black/50" />
                </div>
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 text-black mr-3" />
                    <span className="text-black font-sans">Log Out</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-black/50" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-black/50 text-xs font-sans">
          <p>Cycle Track v1.0.0</p>
          <p className="mt-1">© 2023 Cycle Track. All rights reserved.</p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-50">
        <Navigation />
      </div>
    </div>
  );
};

export default Settings;

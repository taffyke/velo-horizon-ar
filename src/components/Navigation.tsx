import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiMap, FiActivity, FiSettings, FiUser } from 'react-icons/fi';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { icon: FiHome, label: 'Home', path: '/dashboard' },
    { icon: FiMap, label: 'Map', path: '/map' },
    { icon: FiActivity, label: 'Activity', path: '/tracking' },
    { icon: FiUser, label: 'Profile', path: '/profile' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ];
  
  return (
    <nav className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-around px-2">
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
            isActive(item.path) 
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <item.icon size={24} className={isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : ''} />
          <span className="text-xs mt-1 font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;

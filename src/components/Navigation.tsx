
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Map, 
  Navigation as NavigationIcon, 
  History, 
  Settings 
} from 'lucide-react';

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/tracking', icon: NavigationIcon, label: 'Live' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className={`glass-morphism rounded-xl p-1 sm:p-2 ${className}`}>
      <div className="flex space-x-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item relative flex-1 ${isActive ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavItem"
                  className="absolute inset-0 bg-cycling-primary/20 rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center py-1 px-1 sm:py-2 sm:px-3">
                <Icon size={16} className={`sm:size-5 ${isActive ? 'text-cycling-primary' : 'text-current'}`} />
                <span className={`text-xs mt-0.5 sm:mt-1 ${isActive ? 'text-cycling-primary' : 'text-current'} hidden xs:block`}>
                  {item.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AchievementCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  progress?: number;
  unlocked?: boolean;
  date?: string;
  className?: string;
  readonly?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  progress = 0,
  unlocked = false,
  date,
  className = '',
  readonly = true
}) => {
  const iconColors: Record<string, string> = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
    orange: 'text-orange-400',
    teal: 'text-teal-400',
    indigo: 'text-indigo-400',
    pink: 'text-pink-400',
    cycling: 'text-cycling-primary'
  };
  
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-400/10',
    green: 'bg-green-400/10',
    yellow: 'bg-yellow-400/10',
    purple: 'bg-purple-400/10',
    red: 'bg-red-400/10',
    orange: 'bg-orange-400/10',
    teal: 'bg-teal-400/10',
    indigo: 'bg-indigo-400/10',
    pink: 'bg-pink-400/10',
    cycling: 'bg-cycling-primary/10'
  };
  
  const iconColor = iconColors[color] || 'text-cycling-primary';
  const bgColor = bgColors[color] || 'bg-cycling-primary/10';
  
  return (
    <motion.div
      className={`glass-morphism rounded-xl p-5 ${className} ${unlocked ? '' : 'opacity-60'}`}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={iconColor} size={24} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-white">{title}</h3>
            {unlocked && (
              <div className="flex items-center">
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                  Unlocked
                </span>
              </div>
            )}
          </div>
          
          <p className="text-white/70 text-sm mt-1">{description}</p>
          
          {progress > 0 && progress < 100 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Progress</span>
                <span className="text-white/80">{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${unlocked ? 'bg-green-400' : iconColor}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {unlocked && date && (
            <p className="text-white/50 text-xs mt-3">Achieved on {date}</p>
          )}
          
          {!readonly && !unlocked && (
            <div className="mt-3 flex justify-end">
              <button 
                className="text-xs text-white/50 hover:text-white transition-colors"
                title="Edit achievement"
              >
                Create custom goal
              </button>
            </div>
          )}
        </div>
      </div>
      
      {unlocked && (
        <div className="absolute -top-1 -right-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 15, 
              delay: 0.2 
            }}
            className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AchievementCard; 
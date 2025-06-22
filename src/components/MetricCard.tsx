
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  icon: Icon,
  change,
  className = ''
}) => {
  return (
    <motion.div
      className={`metric-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-cycling-primary/10 rounded-lg">
          <Icon className="text-cycling-primary" size={24} />
        </div>
        {change && (
          <div className={`text-sm font-medium ${
            change.type === 'increase' ? 'text-green-500' : 'text-red-500'
          }`}>
            {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  time: string;
  speed: number;
  acceleration?: number;
  elevation?: number;
  heartRate?: number;
}

interface CyclingChartProps {
  data: DataPoint[];
  showAcceleration?: boolean;
  showElevation?: boolean;
  showHeartRate?: boolean;
  height?: number;
  className?: string;
}

const CyclingChart: React.FC<CyclingChartProps> = ({
  data,
  showAcceleration = false,
  showElevation = false,
  showHeartRate = false,
  height = 200,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Find max values for scaling
    const maxSpeed = Math.max(...data.map(d => d.speed), 40);
    const maxAcceleration = Math.max(...data.filter(d => d.acceleration !== undefined).map(d => d.acceleration || 0), 5);
    const maxElevation = Math.max(...data.filter(d => d.elevation !== undefined).map(d => d.elevation || 0), 100);
    const maxHeartRate = Math.max(...data.filter(d => d.heartRate !== undefined).map(d => d.heartRate || 0), 180);
    
    // Chart dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      
      // Speed labels
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(maxSpeed * (4 - i) / 4)} km/h`, padding.left - 5, y + 3);
    }
    
    // Vertical grid lines
    const timeStep = Math.max(1, Math.floor(data.length / 6));
    for (let i = 0; i < data.length; i += timeStep) {
      const x = padding.left + (chartWidth * i / (data.length - 1));
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
      
      // Time labels
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(data[i].time, x, padding.top + chartHeight + 15);
    }
    
    // Draw speed line
    ctx.strokeStyle = '#0891b2'; // cycling-primary
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding.left + (chartWidth * i / (data.length - 1));
      const y = padding.top + chartHeight - (chartHeight * point.speed / maxSpeed);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Add gradient fill under speed line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(8, 145, 178, 0.2)');
    gradient.addColorStop(1, 'rgba(8, 145, 178, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding.left + (chartWidth * i / (data.length - 1));
      const y = padding.top + chartHeight - (chartHeight * point.speed / maxSpeed);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Draw acceleration line if enabled
    if (showAcceleration && data.some(d => d.acceleration !== undefined)) {
      ctx.strokeStyle = '#f59e0b'; // cycling-accent
      ctx.lineWidth = 2;
      ctx.beginPath();
      let started = false;
      
      data.forEach((point, i) => {
        if (point.acceleration !== undefined) {
          const x = padding.left + (chartWidth * i / (data.length - 1));
          const y = padding.top + chartHeight - (chartHeight * point.acceleration / maxAcceleration);
          
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }
    
    // Draw elevation line if enabled
    if (showElevation && data.some(d => d.elevation !== undefined)) {
      ctx.strokeStyle = '#10b981'; // cycling-secondary
      ctx.lineWidth = 2;
      ctx.beginPath();
      let started = false;
      
      data.forEach((point, i) => {
        if (point.elevation !== undefined) {
          const x = padding.left + (chartWidth * i / (data.length - 1));
          const y = padding.top + chartHeight - (chartHeight * point.elevation / maxElevation);
          
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }
    
    // Draw heart rate line if enabled
    if (showHeartRate && data.some(d => d.heartRate !== undefined)) {
      ctx.strokeStyle = '#ef4444'; // red-500
      ctx.lineWidth = 2;
      ctx.beginPath();
      let started = false;
      
      data.forEach((point, i) => {
        if (point.heartRate !== undefined) {
          const x = padding.left + (chartWidth * i / (data.length - 1));
          const y = padding.top + chartHeight - (chartHeight * point.heartRate / maxHeartRate);
          
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }
    
    // Draw legend
    const legendX = padding.left;
    const legendY = padding.top - 5;
    
    // Speed legend
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(legendX, legendY, 10, 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Speed', legendX + 15, legendY + 3);
    
    // Acceleration legend
    if (showAcceleration) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(legendX + 70, legendY, 10, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('Acceleration', legendX + 85, legendY + 3);
    }
    
    // Elevation legend
    if (showElevation) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(legendX + 160, legendY, 10, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('Elevation', legendX + 175, legendY + 3);
    }
    
    // Heart rate legend
    if (showHeartRate) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(legendX + 230, legendY, 10, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('Heart Rate', legendX + 245, legendY + 3);
    }
    
  }, [data, showAcceleration, showElevation, showHeartRate, height]);
  
  // Generate sample data if none provided
  if (data.length === 0) {
    const sampleData: DataPoint[] = [];
    for (let i = 0; i < 24; i++) {
      sampleData.push({
        time: `${i}:00`,
        speed: 15 + Math.random() * 10 + (i < 12 ? i : 24 - i),
        acceleration: showAcceleration ? 1 + Math.random() * 2 : undefined,
        elevation: showElevation ? 100 + Math.sin(i / 3) * 50 : undefined,
        heartRate: showHeartRate ? 120 + Math.random() * 30 : undefined
      });
    }
    return (
      <CyclingChart 
        data={sampleData} 
        showAcceleration={showAcceleration} 
        showElevation={showElevation}
        showHeartRate={showHeartRate}
        height={height}
        className={className}
      />
    );
  }
  
  return (
    <motion.div 
      className={`w-full ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: `${height}px`,
          display: 'block'
        }}
      />
    </motion.div>
  );
};

export default CyclingChart; 
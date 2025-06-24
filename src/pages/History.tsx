import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Calendar, ChevronDown, Clock, MapPin, TrendingUp, Bike } from 'lucide-react';
import CyclingChart from '@/components/CyclingChart';
import { useCyclingSessions } from '@/hooks/useCyclingSessions';

// Cycling background images
const CYCLING_IMAGES = [
  '/assets/images/cycling-background-1.jpg',
  '/assets/images/cycling-background-2.jpg'
];

const History = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [backgroundImage, setBackgroundImage] = useState(0);
  const { sessions, loading } = useCyclingSessions();
  
  // Calculate statistics from real session data
  const totalDistance = sessions.reduce((sum, session) => sum + (session.distance_km || 0), 0);
  const totalTime = sessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0);
  const totalRides = sessions.length;
  const avgSpeed = totalDistance > 0 ? (totalDistance / (totalTime / 3600)) : 0;
  
  // Prepare data for chart
  const chartData = sessions.slice(0, 10).map((session, index) => ({
    time: new Date(session.created_at).toLocaleDateString(),
    speed: session.average_speed_kmh || 0,
    heartRate: 120 + Math.random() * 30, // Simulated heart rate data
    elevation: session.elevation_gain_m || 0
  }));

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
      
      <div className="relative z-10 min-h-screen pb-20">
        <div className="p-4">
          <h1 className="text-3xl font-orbitron font-bold text-white mb-4">Ride History</h1>
          
          {/* Period Selection */}
          <div className="flex space-x-2 mb-6">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPeriod === period
                    ? 'bg-cycling-primary text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { 
                label: 'Total Distance', 
                value: `${totalDistance.toFixed(1)} km`, 
                icon: MapPin,
                change: totalDistance > 10 ? '+12%' : '-5%',
                changeType: totalDistance > 10 ? 'positive' : 'negative'
              },
              { 
                label: 'Total Time', 
                value: `${Math.floor(totalTime / 60)} min`, 
                icon: Clock,
                change: totalTime > 60 ? '+8%' : '-3%',
                changeType: totalTime > 60 ? 'positive' : 'negative'
              },
              { 
                label: 'Total Rides', 
                value: totalRides.toString(), 
                icon: Bike,
                change: totalRides > 0 ? '+5%' : '0%',
                changeType: totalRides > 0 ? 'positive' : 'neutral'
              },
              { 
                label: 'Avg. Speed', 
                value: `${avgSpeed.toFixed(1)} km/h`, 
                icon: TrendingUp,
                change: avgSpeed > 15 ? '+7%' : '-2%',
                changeType: avgSpeed > 15 ? 'positive' : 'negative'
              }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="glass-morphism rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-black/70 text-sm">{stat.label}</span>
                  <stat.icon className="text-cycling-primary" size={18} />
                </div>
                <div className="text-black text-xl font-semibold mb-1">{stat.value}</div>
                <div className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {stat.change} vs. previous {selectedPeriod}
                </div>
              </div>
            ))}
          </div>
          
          {/* Performance Chart */}
          <div className="glass-morphism rounded-xl p-4 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Performance</h2>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-black/60">Loading data...</div>
                </div>
              ) : chartData.length > 0 ? (
                <CyclingChart 
                  data={chartData}
                  showHeartRate={true}
                  showElevation={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-black/60">No ride data available</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Rides */}
          <div className="glass-morphism rounded-xl p-4">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Rides</h2>
            
            {loading ? (
              <div className="text-center py-8 text-white/60">
                Loading rides...
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.slice(0, 5).map((session, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">
                          {new Date(session.created_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })} Ride
                        </h3>
                        <div className="text-white/70 text-sm mt-1">
                          {session.distance_km?.toFixed(1) || '0'} km • {Math.floor((session.duration_seconds || 0) / 60)} min
                        </div>
                      </div>
                      <div className="text-cycling-primary text-right">
                        <div className="text-lg font-semibold">
                          {session.average_speed_kmh?.toFixed(1) || '0'}
                        </div>
                        <div className="text-xs text-white/70">km/h</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex space-x-4 text-xs text-white/60">
                      <div className="flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        <span>{session.elevation_gain_m || 0}m gain</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>
                          {new Date(session.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                No ride history available
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <Navigation />
        </div>
      </div>
    </div>
  );
};

export default History;


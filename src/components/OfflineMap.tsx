import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiNavigation2, FiLayers, FiX, FiInfo } from 'react-icons/fi';
import { calculateDistance } from '../utils/calculations';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom location marker icon
const locationIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `
    <div class="relative">
      <div class="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
      <div class="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full border-2 border-blue-500"></div>
    </div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

type Position = {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  altitude?: number | null;
  timestamp?: number;
};

type RouteInfo = {
  start: Position;
  end: Position;
  distance: number;
  routeCoordinates: Position[];
};

const TILE_URLS = {
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  cycle: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
};

const DEFAULT_CENTER: Position = { lat: 0, lng: 0 };
const DEFAULT_ZOOM = 14;

const OfflineMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastPositions, setLastPositions] = useState<Position[]>([]);
  const [mapLayer, setMapLayer] = useState<string>('standard');
  const [showLayerOptions, setShowLayerOptions] = useState(false);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [routeStart, setRouteStart] = useState<Position | null>(null);
  const [routeEnd, setRouteEnd] = useState<Position | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const locationMarkerRef = useRef<L.Marker | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [tileError, setTileError] = useState(false);

  // Helper to destroy map instance to prevent memory leaks
  const destroyMap = useCallback(() => {
    if (mapRef.current) {
      // Remove all event listeners
      mapRef.current.off();
      
      // Remove all layers
      mapRef.current.eachLayer((layer) => {
        mapRef.current?.removeLayer(layer);
      });
      
      // Remove all controls
      const controlsToRemove = [];
      mapRef.current.eachControl((control) => {
        controlsToRemove.push(control);
      });
      
      controlsToRemove.forEach(control => {
        mapRef.current?.removeControl(control);
      });
      
      // Finally remove the map
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // Properly destroy map to prevent memory leaks
      destroyMap();
    };
  }, [destroyMap]);

  // Initialize map
  useEffect(() => {
    // Destroy any existing map instance before creating a new one
    destroyMap();
    
    // Create map container if it doesn't exist
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Create new map instance
    const map = L.map('map', {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true, // Use canvas for better performance
      maxBoundsViscosity: 1.0,
    });
    
    // Add tile layer with error handling
    const tileLayer = L.tileLayer(TILE_URLS[mapLayer as keyof typeof TILE_URLS], {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });
    
    tileLayer.on('tileerror', () => {
      setTileError(true);
      // Try to use a fallback tile server
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    });
    
    tileLayer.addTo(map);
    
    // Add zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    
    // Add attribution control
    L.control.attribution({ position: 'bottomleft' }).addTo(map);
    
    // Store map reference
    mapRef.current = map;
    
    // Try to get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, speed } = position.coords;
        const pos = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          altitude: altitude,
          speed: speed || 0,
          timestamp: position.timestamp,
        };
        
        setCurrentPosition(pos);
        
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], DEFAULT_ZOOM);
          
          // Add user location marker
          if (locationMarkerRef.current) {
            mapRef.current.removeLayer(locationMarkerRef.current);
          }
          
          locationMarkerRef.current = L.marker([latitude, longitude], {
            icon: locationIcon,
            zIndexOffset: 1000,
          }).addTo(mapRef.current);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        if (error.code === 1) {
          setPermissionDenied(true);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
    
    // Add resize handler
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mapLayer, destroyMap]);

  // Handle map layer change
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });
    
    L.tileLayer(TILE_URLS[mapLayer as keyof typeof TILE_URLS], {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);
    
  }, [mapLayer]);

  // Handle tracking toggle
  const toggleTracking = () => {
    if (isTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
    } else {
      try {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
            const { latitude, longitude, accuracy, altitude, speed } = position.coords;
            const newPosition = {
              lat: latitude,
              lng: longitude,
              accuracy: accuracy,
              altitude: altitude,
              speed: speed || 0,
              timestamp: position.timestamp,
            };
            
            setCurrentPosition(newPosition);
            setLastPositions((prev) => [...prev, newPosition].slice(-20));
            
            if (mapRef.current) {
              // Update user location marker
              if (locationMarkerRef.current) {
                locationMarkerRef.current.setLatLng([latitude, longitude]);
              } else {
                locationMarkerRef.current = L.marker([latitude, longitude], {
                  icon: locationIcon,
                  zIndexOffset: 1000,
                }).addTo(mapRef.current);
              }
            }
          },
          (error) => {
            console.error('Tracking error:', error);
            if (error.code === 1) {
              setPermissionDenied(true);
              setIsTracking(false);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
        
        watchIdRef.current = watchId;
        setIsTracking(true);
      } catch (error) {
        console.error('Error starting tracking:', error);
        setIsTracking(false);
      }
    }
  };

  // Center map on current location
  const centerOnLocation = () => {
    if (currentPosition && mapRef.current) {
      mapRef.current.setView([currentPosition.lat, currentPosition.lng], DEFAULT_ZOOM);
    } else {
      // Try to get current position first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], DEFAULT_ZOOM);
          }
          
          const pos = {
            lat: latitude,
            lng: longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed || 0,
            timestamp: position.timestamp,
          };
          
          setCurrentPosition(pos);
          
          // Add user location marker
          if (mapRef.current) {
            if (locationMarkerRef.current) {
              locationMarkerRef.current.setLatLng([latitude, longitude]);
            } else {
              locationMarkerRef.current = L.marker([latitude, longitude], {
                icon: locationIcon,
                zIndexOffset: 1000,
              }).addTo(mapRef.current);
            }
        }
      },
      (error) => {
          console.error('Error getting location:', error);
          if (error.code === 1) {
            setPermissionDenied(true);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  // Toggle layer options
  const toggleLayerOptions = () => {
    setShowLayerOptions(!showLayerOptions);
    if (showRouteOptions) setShowRouteOptions(false);
  };

  // Toggle route options
  const toggleRouteOptions = () => {
    setShowRouteOptions(!showRouteOptions);
    if (showLayerOptions) setShowLayerOptions(false);
  };

  // Create route
  const createRoute = () => {
    setIsCreatingRoute(true);
    setRouteStart(null);
    setRouteEnd(null);
    setRouteInfo(null);
    
    // Clean up any existing route elements
    if (startMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    
    if (endMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }
    
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    
    if (mapRef.current) {
      // Setup click handler for start and end points
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        const clickedPosition = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        };
        
        if (!routeStart) {
          setRouteStart(clickedPosition);
          
          if (mapRef.current) {
            if (startMarkerRef.current) {
              mapRef.current.removeLayer(startMarkerRef.current);
            }
            
            startMarkerRef.current = L.marker([clickedPosition.lat, clickedPosition.lng], {
              draggable: true,
            })
              .addTo(mapRef.current)
              .bindPopup('Starting point')
              .openPopup();
              
            startMarkerRef.current.on('dragend', (event) => {
              const marker = event.target;
              const position = marker.getLatLng();
              setRouteStart({ lat: position.lat, lng: position.lng });
              
              // Recalculate route if end point exists
              if (routeEnd) {
                calculateRouteInfo({ lat: position.lat, lng: position.lng }, routeEnd);
              }
            });
          }
        } else if (!routeEnd) {
          setRouteEnd(clickedPosition);
          
          if (mapRef.current) {
            if (endMarkerRef.current) {
              mapRef.current.removeLayer(endMarkerRef.current);
            }
            
            endMarkerRef.current = L.marker([clickedPosition.lat, clickedPosition.lng], {
              draggable: true,
            })
              .addTo(mapRef.current)
              .bindPopup('Destination point')
              .openPopup();
              
            endMarkerRef.current.on('dragend', (event) => {
              const marker = event.target;
              const position = marker.getLatLng();
              setRouteEnd({ lat: position.lat, lng: position.lng });
              
              // Recalculate route
              if (routeStart) {
                calculateRouteInfo(routeStart, { lat: position.lat, lng: position.lng });
              }
            });
            
            // Calculate route info
            calculateRouteInfo(routeStart, clickedPosition);
          }
          
          // Remove click handler after setting both points
          mapRef.current.off('click', handleMapClick);
        }
      };
      
      mapRef.current.on('click', handleMapClick);
    }
  };

  // Calculate route info
  const calculateRouteInfo = (start: Position, end: Position) => {
    try {
      // Create a straight line for now (in a real app, you'd use a routing API)
      const routeCoordinates = [start, end];
      const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
      
      setRouteInfo({
        start,
        end,
        distance,
        routeCoordinates,
      });
      
      // Draw route on map
      if (mapRef.current) {
        if (routeLayerRef.current) {
          mapRef.current.removeLayer(routeLayerRef.current);
        }
        
        routeLayerRef.current = L.polyline(
          routeCoordinates.map((pos) => [pos.lat, pos.lng]),
          {
            color: '#3b82f6',
            weight: 5,
            opacity: 0.7,
            lineJoin: 'round',
          }
        ).addTo(mapRef.current);
        
        // Fit map to route bounds
        const bounds = L.latLngBounds(
          routeCoordinates.map((pos) => [pos.lat, pos.lng])
        );
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  // Cancel route creation
  const cancelRouteCreation = () => {
    setIsCreatingRoute(false);
    setRouteStart(null);
    setRouteEnd(null);
    setRouteInfo(null);
    
    // Clean up
    if (startMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    
    if (endMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }
    
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    
    // Remove any click handlers
    if (mapRef.current) {
      mapRef.current.off('click');
    }
  };

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(2)} km`;
  };

  // Format speed
  const formatSpeed = (speed: number | undefined) => {
    if (speed === undefined) return 'N/A';
    const speedKmh = speed * 3.6; // Convert m/s to km/h
    return `${speedKmh.toFixed(1)} km/h`;
  };

  return (
    <div className="w-full h-full relative">
      <div id="map" className="w-full h-full z-10"></div>
      
      {/* Permission denied message */}
      {permissionDenied && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Location permission denied. Please enable location services.
      </div>
      )}
      
      {/* Tile loading error message */}
      {tileError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Map tiles failed to load. Using fallback map.
        </div>
      )}
      
      {/* Tracking info panel */}
      {isTracking && currentPosition && (
        <div className="absolute top-4 left-4 route-info-panel z-30 max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Live Tracking</h3>
            <button
              onClick={() => setIsTracking(false)}
              className="text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Speed</span>
              <p>{formatSpeed(currentPosition.speed)}</p>
            </div>
            <div>
              <span className="text-gray-400">Accuracy</span>
              <p>{currentPosition.accuracy ? `${currentPosition.accuracy.toFixed(1)} m` : 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-400">Altitude</span>
              <p>{currentPosition.altitude ? `${currentPosition.altitude.toFixed(1)} m` : 'N/A'}</p>
            </div>
            {lastPositions.length > 1 && (
              <div>
                <span className="text-gray-400">Trip Distance</span>
                <p>{formatDistance(
                  lastPositions.reduce((total, pos, i, arr) => {
                    if (i === 0) return total;
                    return total + calculateDistance(
                      arr[i-1].lat, arr[i-1].lng, pos.lat, pos.lng
                    );
                  }, 0)
                )}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Route info panel */}
      {routeInfo && (
        <div className="absolute top-4 left-4 route-info-panel z-30 max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Route Information</h3>
            <button
              onClick={cancelRouteCreation}
              className="text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Distance</span>
              <p className="font-medium">{formatDistance(routeInfo.distance)}</p>
      </div>
            <div>
              <span className="text-gray-400">Estimated Time</span>
              <p className="font-medium">
                {`${Math.floor(routeInfo.distance / 0.2)} mins`}
                <span className="text-xs text-gray-400 ml-1">(at 12 km/h)</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute bottom-24 right-4 flex flex-col space-y-3 z-20">
        <button
          className={`map-control-button ${isTracking ? 'active' : ''}`}
          onClick={toggleTracking}
          title={isTracking ? 'Stop Tracking' : 'Start Tracking'}
        >
          <FiNavigation2 size={20} />
        </button>
        
        <button
          className="map-control-button"
          onClick={centerOnLocation}
          title="Center on my location"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </button>
        
        <button
          className={`map-control-button ${showLayerOptions ? 'active' : ''}`}
          onClick={toggleLayerOptions}
          title="Change Map Layer"
        >
          <FiLayers size={20} />
        </button>
        
        <button
          className={`map-control-button ${isCreatingRoute ? 'active' : ''}`}
          onClick={toggleRouteOptions}
          title="Route Planner"
        >
          <FiInfo size={20} />
        </button>
      </div>

      {/* Layer options */}
      {showLayerOptions && (
        <div className="absolute bottom-24 right-16 bg-black bg-opacity-80 rounded-lg p-2 z-20">
          <div className="flex flex-col space-y-2">
            <button
              className={`px-3 py-1 rounded ${mapLayer === 'standard' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setMapLayer('standard')}
            >
              Standard
            </button>
            <button
              className={`px-3 py-1 rounded ${mapLayer === 'cycle' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setMapLayer('cycle')}
            >
              Cycle
            </button>
            <button
              className={`px-3 py-1 rounded ${mapLayer === 'satellite' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setMapLayer('satellite')}
            >
              Satellite
            </button>
            <button
              className={`px-3 py-1 rounded ${mapLayer === 'terrain' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setMapLayer('terrain')}
            >
              Terrain
            </button>
          </div>
        </div>
      )}
      
      {/* Route options */}
      {showRouteOptions && (
        <div className="absolute bottom-24 right-16 bg-black bg-opacity-80 rounded-lg p-2 z-20">
          <div className="flex flex-col space-y-2">
            <button
              className="px-3 py-1 rounded bg-blue-600"
              onClick={createRoute}
            >
              Create Route
            </button>
            {isCreatingRoute && (
              <button
                className="px-3 py-1 rounded hover:bg-gray-700"
                onClick={cancelRouteCreation}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineMap;

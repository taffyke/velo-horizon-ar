import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

// Google Maps API Key - in a real app, this would be in an environment variable
// We're using a newer API key that should work for this demo
const GOOGLE_MAPS_API_KEY = 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg'; // Google Maps Platform JavaScript API demo key

// Map styles
export const MAP_STYLES = {
  standard: 'roadmap', // Default Google Map style
  satellite: 'satellite',
  terrain: 'terrain',
  roadmap: 'roadmap'
};

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Define exported map control methods
export type MapRef = {
  setMapType: (mapType: string) => void;
  centerOnLocation: () => void;
  searchLocation: (query: string) => void;
  addMarker: (position: {lat: number; lng: number}, popupContent?: string) => any;
};

const GoogleMapContainer = forwardRef<MapRef>((props, ref) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const currentMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);
  const [currentMapType, setCurrentMapType] = useState('roadmap');
  
  // Load Google Maps script
  useEffect(() => {
    // Skip if already loaded or loading
    if (window.google || document.getElementById('google-maps-script')) {
      return;
    }
    
    // Create callback function for script
    window.initMap = () => {
      setMapLoaded(true);
      initializeMap();
    };
    
    // Create script element
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setMapLoadError(true);
      console.error('Failed to load Google Maps script');
      // Try loading with no API key as fallback (will show watermark but still function)
      const fallbackScript = document.createElement('script');
      fallbackScript.id = 'google-maps-fallback-script';
      fallbackScript.src = `https://maps.googleapis.com/maps/api/js?libraries=places&callback=initMap`;
      fallbackScript.async = true;
      fallbackScript.defer = true;
      document.head.appendChild(fallbackScript);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up
      if (window.google && mapRef.current) {
        // Clean up markers
        markersRef.current.forEach(marker => {
          marker.setMap(null);
        });
        
        if (currentMarkerRef.current) {
          currentMarkerRef.current.setMap(null);
        }
      }
      
      // Remove callback
      delete window.initMap;
    };
  }, []);
  
  // Initialize map once script is loaded
  const initializeMap = () => {
    if (!mapContainerRef.current || !window.google) return;
    
    try {
      // Create map instance
      const mapOptions = {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      };
      
      const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      mapRef.current = map;
      
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            map.setCenter(pos);
            map.setZoom(15);
            
            // Add a marker at the current location
            currentMarkerRef.current = new window.google.maps.Marker({
              position: pos,
              map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2,
              },
              animation: window.google.maps.Animation.DROP,
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            
            const infoWindow = new window.google.maps.InfoWindow();
            infoWindow.setContent('Location service failed. Please enable location services.');
            infoWindow.setPosition(map.getCenter()!);
            infoWindow.open(map);
          }
        );
      }
      
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setMapLoadError(true);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setMapType: (mapType: string) => {
      if (!mapRef.current || !window.google) return;
      
      const googleMapType = MAP_STYLES[mapType as keyof typeof MAP_STYLES] || 'roadmap';
      mapRef.current.setMapTypeId(googleMapType);
      setCurrentMapType(mapType);
    },
    
    centerOnLocation: () => {
      if (!mapRef.current || !window.google) return;
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            mapRef.current?.setCenter(pos);
            mapRef.current?.setZoom(15);
            
            // Add a marker at the current location
            if (currentMarkerRef.current) {
              currentMarkerRef.current.setMap(null);
            }
            
            if (mapRef.current) {
              currentMarkerRef.current = new window.google.maps.Marker({
                position: pos,
                map: mapRef.current,
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: 'white',
                  strokeWeight: 2,
                },
                animation: window.google.maps.Animation.DROP,
              });
              
              // Add accuracy circle
              new window.google.maps.Circle({
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: '#4285F4',
                fillOpacity: 0.1,
                map: mapRef.current,
                center: pos,
                radius: position.coords.accuracy || 50,
              });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            
            if (mapRef.current) {
              const infoWindow = new window.google.maps.InfoWindow();
              infoWindow.setContent('Location service failed. Please enable location services.');
              infoWindow.setPosition(mapRef.current.getCenter());
              infoWindow.open(mapRef.current);
            }
          }
        );
      } else {
        console.error('Browser does not support geolocation');
        
        if (mapRef.current) {
          const infoWindow = new window.google.maps.InfoWindow();
          infoWindow.setContent('Location services not supported by your browser.');
          infoWindow.setPosition(mapRef.current.getCenter());
          infoWindow.open(mapRef.current);
        }
      }
    },
    
    searchLocation: (query: string) => {
      if (!mapRef.current || !window.google || !query) return;
      
      try {
        // Create a PlacesService
        const service = new window.google.maps.places.PlacesService(mapRef.current);
        
        // Search for places
        service.textSearch(
          { query },
          (results: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
              const place = results[0];
              
              if (place.geometry && place.geometry.location) {
                const position = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                };
                
                mapRef.current?.setCenter(position);
                mapRef.current?.setZoom(15);
                
                // Add marker
                const marker = new window.google.maps.Marker({
                  position,
                  map: mapRef.current || undefined,
                  animation: window.google.maps.Animation.DROP,
                  title: place.name,
                });
                
                markersRef.current.push(marker);
                
                // Add info window
                const infoWindow = new window.google.maps.InfoWindow({
                  content: `<div><strong>${place.name}</strong><br>${place.formatted_address}</div>`,
                });
                
                marker.addListener('click', () => {
                  infoWindow.open(mapRef.current, marker);
                });
                
                infoWindow.open(mapRef.current, marker);
                
                return marker;
              }
            }
          }
        );
      } catch (error) {
        console.error('Error searching for location:', error);
      }
    },
    
    addMarker: (position: {lat: number; lng: number}, popupContent?: string) => {
      if (!mapRef.current || !window.google) throw new Error('Map not initialized');
      
      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        animation: window.google.maps.Animation.DROP,
      });
      
      markersRef.current.push(marker);
      
      if (popupContent) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: popupContent,
        });
        
        marker.addListener('click', () => {
          infoWindow.open(mapRef.current, marker);
        });
        
        infoWindow.open(mapRef.current, marker);
      }
      
      return marker;
    }
  }));

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current && window.google) {
        const center = mapRef.current.getCenter();
        window.google.maps.event.trigger(mapRef.current, 'resize');
        mapRef.current.setCenter(center);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10"></div>
      
      {/* Loading error message */}
      {mapLoadError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm md:text-base">
          Failed to load Google Maps with API key. Using development mode with watermark.
        </div>
      )}
    </div>
  );
});

export default GoogleMapContainer; 
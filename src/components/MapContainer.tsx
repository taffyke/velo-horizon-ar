import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiNavigation2, FiLayers } from 'react-icons/fi';

// Fix Leaflet marker icons
// @ts-ignore - _getIconUrl exists at runtime but TypeScript doesn't know about it
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

// Map tile sources
export const TILE_SOURCES = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  },
  terrain: {
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  },
  cycle: {
    url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
    attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22
  }
};

// Define exported map control methods
export type MapRef = {
  setLayer: (layerName: string) => void;
  centerOnLocation: () => void;
  searchLocation: (query: string) => void;
  addMarker: (position: [number, number], popupContent?: string) => L.Marker;
};

const MapContainer = forwardRef<MapRef>((props, ref) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [tileLoadError, setTileLoadError] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('standard');

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setLayer: (layerName: string) => {
      if (!mapRef.current) return;
      
      // If layer name is valid
      if (TILE_SOURCES[layerName as keyof typeof TILE_SOURCES]) {
        // Remove existing tile layer
        if (tileLayerRef.current) {
          mapRef.current.removeLayer(tileLayerRef.current);
        }
        
        // Add new tile layer
        const source = TILE_SOURCES[layerName as keyof typeof TILE_SOURCES];
        tileLayerRef.current = L.tileLayer(source.url, {
          attribution: source.attribution,
          maxZoom: source.maxZoom
        }).addTo(mapRef.current);
        
        setCurrentLayer(layerName);
      }
    },
    
    centerOnLocation: () => {
      if (!mapRef.current) return;
      
      mapRef.current.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true,
        timeout: 10000
      });
    },
    
    searchLocation: (query: string) => {
      if (!mapRef.current || !query) return;
      
      // Simulate geocoding (in real app would use a geocoding service)
      // Here just adding a marker to a random nearby position
      const center = mapRef.current.getCenter();
      const lat = center.lat + (Math.random() * 0.02 - 0.01);
      const lng = center.lng + (Math.random() * 0.02 - 0.01);
      
      // Add marker
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }
      
      markerRef.current = L.marker([lat, lng])
        .addTo(mapRef.current)
        .bindPopup(`Search result: ${query}`)
        .openPopup();
      
      // Center map on marker
      mapRef.current.setView([lat, lng], 16);
      
      return markerRef.current;
    },
    
    addMarker: (position: [number, number], popupContent?: string) => {
      if (!mapRef.current) throw new Error('Map not initialized');
      
      const marker = L.marker(position)
        .addTo(mapRef.current);
      
      if (popupContent) {
        marker.bindPopup(popupContent).openPopup();
      }
      
      return marker;
    }
  }));

  useEffect(() => {
    // Only initialize map if it doesn't exist
    if (!mapRef.current && mapContainerRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [0, 0],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
        maxBoundsViscosity: 1.0
      });

      // Add default tile layer with error handling
      const defaultSource = TILE_SOURCES.standard;
      const defaultTileLayer = L.tileLayer(defaultSource.url, {
        attribution: defaultSource.attribution,
        maxZoom: defaultSource.maxZoom,
      }).addTo(map);
      
      tileLayerRef.current = defaultTileLayer;
      
      defaultTileLayer.on('tileerror', () => {
        setTileLoadError(true);
        // Add fallback for tile errors
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);
      });

      // Add zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Store map reference
      mapRef.current = map;

      // Try to get user location
      map.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true,
        timeout: 10000,
      });

      // Handle location found
      map.on('locationfound', (e) => {
        // Add marker at user location
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        
        markerRef.current = L.marker(e.latlng, {
          icon: locationIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        // Add accuracy circle
        const accuracyCircle = L.circle(e.latlng, {
          radius: e.accuracy / 2,
          weight: 1,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
        }).addTo(map);
      });

      // Handle location error
      map.on('locationerror', (e) => {
        console.error('Location error:', e.message);
        
        // Set default view if location not found
        map.setView([0, 0], 2);
        
        // Show error message
        L.popup()
          .setLatLng(map.getCenter())
          .setContent('Location access denied or unavailable. Please enable location services.')
          .openOn(map);
      });

      // Handle resize events
      const handleResize = () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize({ animate: true });
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Also invalidate size after a short delay to ensure proper rendering
      setTimeout(() => {
        handleResize();
      }, 300);

      // Clean up on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        
        if (mapRef.current) {
          mapRef.current.off();
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, []);

  // Force map resize when container becomes visible
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current, { 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10"></div>
      
      {/* Tile loading error message */}
      {tileLoadError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm md:text-base">
          Map tiles failed to load. Using fallback map.
        </div>
      )}
    </div>
  );
});

export default MapContainer; 
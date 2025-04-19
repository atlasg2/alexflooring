import { useState, useEffect, useRef, useMemo } from 'react';
import { throttle, trackComponentLifecycle } from '@/utils/performance';

// Need to declare google maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    mapMarkers?: any[];
  }
}

export interface ReviewWithLocation {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  image?: string;
  date?: string;
  latitude?: string;
  longitude?: string;
  source?: string;
}

// Get the Google Maps API key from the environment if available
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD21wkThWPi7nAp8v1samUle57-Qyy2Gvk";

interface GoogleMapWithPinsProps {
  reviews: ReviewWithLocation[];
  height?: string;
  width?: string;
  centerLat?: number;
  centerLng?: number;
  defaultZoom?: number;
}

const GoogleMapWithPins = ({ 
  reviews,
  height = "500px",
  width = "100%",
  centerLat = 29.9511, 
  centerLng = -90.0715,
  defaultZoom = 11
}: GoogleMapWithPinsProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Load Google Maps API - with performance tracking
  useEffect(() => {
    // Track this component for debugging memory leaks
    return trackComponentLifecycle('GoogleMapWithPins', () => {
      // Only load if we haven't already
      if (!window.google && !document.getElementById('google-maps-script')) {
        // Keep a global copy of markers to ensure proper cleanup
        window.mapMarkers = [];
        
        // Set up the callback before creating the script
        window.initMap = () => {
          setMapLoaded(true);
        };
        
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
        script.async = true; // Keep async to prevent render blocking
        script.defer = true;
        
        document.head.appendChild(script);
      } else if (window.google) {
        // If already loaded
        setMapLoaded(true);
      }
    }, () => {
      // Cleanup function - runs when component unmounts
      console.log('GoogleMapWithPins unmounting - cleaning up resources');
      
      // Remove any markers we created to prevent memory leaks
      if (markers && markers.length > 0) {
        markers.forEach(marker => {
          if (marker && marker.setMap) marker.setMap(null);
        });
        setMarkers([]);
      }
      
      // Also clean global markers
      if (window.mapMarkers && window.mapMarkers.length > 0) {
        window.mapMarkers.forEach(marker => {
          if (marker && marker.setMap) marker.setMap(null);
        });
        window.mapMarkers = [];
      }
      
      // Remove the global callback when component unmounts
      if (window.initMap) {
        window.initMap = undefined as any;
      }
    });
  }, []);
  
  // Initialize map when API is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    // Create map centered on New Orleans
    const mapOptions = {
      center: { lat: centerLat, lng: centerLng },
      zoom: defaultZoom,
      mapTypeControl: true,
      streetViewControl: false,
    };
    
    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);
  }, [mapLoaded, centerLat, centerLng, defaultZoom]);
  
  // Add pins when map and reviews are available
  useEffect(() => {
    if (!map || !reviews.length) return;
    
    // Clear any existing markers
    if (markers.length > 0) {
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
    }
    
    // Create bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers: any[] = [];
    
    // Create markers for each review with valid coordinates
    reviews.forEach(review => {
      if (!review.latitude || !review.longitude) return;
      
      const lat = parseFloat(review.latitude);
      const lng = parseFloat(review.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      const position = { lat, lng };
      
      // All reviews are 5-star, so we use green for all pins
      const pinColor = 'green';
      
      // Create marker
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: `${review.name} - ${review.rating}★`,
        label: {
          text: review.rating.toString(),
          color: 'white'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: pinColor,
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: 'white',
          scale: 10
        }
      });
      
      // Create info window with review details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="max-width: 200px; padding: 5px;">
            <strong>${review.name}</strong>
            <div style="color: #FFD700;">
              ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
            </div>
            <div style="font-size: 12px; margin: 5px 0;">
              "${review.quote.length > 100 ? review.quote.substring(0, 100) + '...' : review.quote}"
            </div>
            <div style="font-size: 11px; color: #666;">
              ${review.location} · ${review.date ? new Date(review.date).toLocaleDateString() : ''}
            </div>
          </div>
        `
      });
      
      // Add click listener
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      newMarkers.push(marker);
      bounds.extend(position);
    });
    
    // Fit map to bounds if we have markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Don't zoom in too far on small datasets
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
    
    setMarkers(newMarkers);
  }, [map, reviews]);
  
  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: width, 
        height: height, 
        borderRadius: '0.5rem' 
      }}
    >
      {!mapLoaded && (
        <div className="flex items-center justify-center h-full">
          Loading map...
        </div>
      )}
    </div>
  );
};

export default GoogleMapWithPins;
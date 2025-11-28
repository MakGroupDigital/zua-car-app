'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Navigation, X, Loader2, Fuel, Car, Phone, Star, CheckCircle2, Footprints, Play, Pause, RotateCcw, Navigation2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useLocation } from '@/hooks/use-location';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Leaflet
const L = typeof window !== 'undefined' ? require('leaflet') : null;

interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
  email?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  fuelTypes?: string[];
  imageUrl?: string;
  isOpen?: boolean;
  createdAt: any;
}

export default function StationsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [isGeneratingStations, setIsGeneratingStations] = useState(false);
  const [showTransportDialog, setShowTransportDialog] = useState(false);
  const [transportMode, setTransportMode] = useState<'driving' | 'walking'>('driving');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationData, setNavigationData] = useState<{
    distance: number;
    duration: number;
    remainingDistance: number;
    remainingDuration: number;
  } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [hasArrived, setHasArrived] = useState(false);

  const { location, isLoading: isLocationLoading, requestLocation, permissionStatus } = useLocation();

  // Fetch stations from Firebase
  const stationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'stations'),
      orderBy('name')
    );
  }, [firestore]);

  const { data: stations, isLoading: isStationsLoading } = useCollection<Station>(stationsQuery);

  // Generate demo stations around user location if none exist
  const generateDemoStations = async (centerLat: number, centerLng: number) => {
    if (!firestore || isGeneratingStations) return;

    try {
      // Check if stations already exist
      const stationsSnapshot = await getDocs(collection(firestore, 'stations'));
      if (stationsSnapshot.size > 0) {
        console.log('Stations already exist, skipping generation');
        return;
      }

      setIsGeneratingStations(true);

      const demoStations = [
        {
          name: 'Station Total Express',
          address: 'Avenue de la République, Kinshasa',
          city: 'Kinshasa',
          phoneNumber: '+243 900 123 456',
          latitude: centerLat + 0.01,
          longitude: centerLng + 0.01,
          rating: 4.5,
          reviewCount: 23,
          fuelTypes: ['Essence', 'Diesel', 'GPL'],
          isOpen: true,
        },
        {
          name: 'Station Shell Premium',
          address: 'Boulevard du 30 Juin, Kinshasa',
          city: 'Kinshasa',
          phoneNumber: '+243 900 234 567',
          latitude: centerLat - 0.008,
          longitude: centerLng + 0.015,
          rating: 4.8,
          reviewCount: 45,
          fuelTypes: ['Essence', 'Diesel', 'Super'],
          isOpen: true,
        },
        {
          name: 'Station Mobil Central',
          address: 'Avenue Kasa-Vubu, Kinshasa',
          city: 'Kinshasa',
          phoneNumber: '+243 900 345 678',
          latitude: centerLat + 0.015,
          longitude: centerLng - 0.012,
          rating: 4.2,
          reviewCount: 18,
          fuelTypes: ['Essence', 'Diesel'],
          isOpen: true,
        },
        {
          name: 'Station BP Moderne',
          address: 'Route de Matadi, Kinshasa',
          city: 'Kinshasa',
          phoneNumber: '+243 900 456 789',
          latitude: centerLat - 0.012,
          longitude: centerLng - 0.008,
          rating: 4.6,
          reviewCount: 32,
          fuelTypes: ['Essence', 'Diesel', 'GPL', 'Super'],
          isOpen: true,
        },
        {
          name: 'Station Engen',
          address: 'Avenue de la Gare, Kinshasa',
          city: 'Kinshasa',
          phoneNumber: '+243 900 567 890',
          latitude: centerLat + 0.005,
          longitude: centerLng + 0.02,
          rating: 4.9,
          reviewCount: 67,
          fuelTypes: ['Essence', 'Diesel', 'Super'],
          isOpen: true,
        },
        {
          name: 'Station Puma Energy',
          address: 'Boulevard Lumumba, Kinshasa',
          city: 'Kinshasa',
          phoneNumber: '+243 900 678 901',
          latitude: centerLat - 0.02,
          longitude: centerLng + 0.005,
          rating: 4.3,
          reviewCount: 28,
          fuelTypes: ['Essence', 'Diesel'],
          isOpen: true,
        },
      ];

      // Save stations to Firebase
      for (const station of demoStations) {
        const stationId = `station_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const stationRef = doc(firestore, 'stations', stationId);
        await setDoc(stationRef, {
          ...station,
          createdAt: serverTimestamp(),
        });
      }

      toast({
        title: 'Stations ajoutées !',
        description: `${demoStations.length} stations-service de démonstration ont été ajoutées autour de votre position.`,
      });

      console.log(`Generated ${demoStations.length} demo stations`);
    } catch (error: any) {
      console.error('Error generating demo stations:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de générer les stations de démonstration',
      });
    } finally {
      setIsGeneratingStations(false);
    }
  };

  // Auto-generate stations when user location is available and no stations exist
  useEffect(() => {
    if (!userLocation || !firestore || isGeneratingStations) return;

    const checkAndGenerate = async () => {
      try {
        const stationsSnapshot = await getDocs(collection(firestore, 'stations'));
        if (stationsSnapshot.size === 0) {
          console.log('No stations found, generating demo stations...');
          await generateDemoStations(userLocation.lat, userLocation.lng);
        }
      } catch (error) {
        console.error('Error checking stations:', error);
      }
    };

    // Small delay to ensure Firebase is ready
    const timer = setTimeout(checkAndGenerate, 1000);
    return () => clearTimeout(timer);
  }, [userLocation, firestore]);

  // Initialize Leaflet map when location is available
  useEffect(() => {
    if (showLocationPrompt || !userLocation || !L || !mapRef.current) return;

    const initMap = () => {
      if (!mapRef.current || !L) return;

      try {
        // Create map instance
        const map = L.map(mapRef.current, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 13,
        });

        // Add custom styled tile layer with app colors
        // Using CartoDB Positron style (light, modern)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        // Add user location marker with app primary color (default: car icon)
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: '<div style="width: 40px; height: 40px; background: hsl(210, 100%, 20%); border: 4px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5S16.67 13 17.5 13s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Votre position');
        userMarkerRef.current = userMarker;

        mapInstanceRef.current = map;
        setIsMapLoading(false);
        setMapReady(true);
        console.log('Leaflet map initialized successfully');
      } catch (error: any) {
        console.error('Error initializing map:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: `Impossible d'initialiser la carte: ${error?.message || 'Erreur inconnue'}`,
        });
        setIsMapLoading(false);
      }
    };

    // Load Leaflet CSS if not already loaded
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Small delay to ensure DOM is ready
    setTimeout(initMap, 100);
  }, [userLocation, showLocationPrompt, toast]);

  // Add station markers to map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !stations || stations.length === 0 || !L) {
      console.log('Markers not ready:', { mapReady, hasMap: !!mapInstanceRef.current, stationsCount: stations?.length || 0, hasL: !!L });
      return;
    }

    console.log('Adding markers for', stations.length, 'stations');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create route layer group if it doesn't exist
    if (!routeLayerRef.current && mapInstanceRef.current) {
      routeLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    stations.forEach((station, index) => {
      if (station.latitude && station.longitude && !isNaN(station.latitude) && !isNaN(station.longitude)) {
        // Custom station icon with app accent color (fuel pump icon)
        const stationIcon = L.divIcon({
          className: 'custom-station-marker',
          html: `<div style="width: 40px; height: 40px; background: hsl(198, 100%, 49%); border: 4px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([station.latitude, station.longitude], { icon: stationIcon })
          .addTo(mapInstanceRef.current!)
          .bindPopup(`
            <div style="min-width: 200px;">
              <strong style="color: hsl(210, 100%, 20%); font-size: 16px;">${station.name}</strong><br>
              <span style="color: #666; font-size: 14px;">${station.address}</span>
              ${station.rating ? `<br><span style="color: #ffa500;">⭐ ${station.rating.toFixed(1)}</span>` : ''}
            </div>
          `)
          .on('click', () => {
            setSelectedStation(station);
            mapInstanceRef.current?.setView([station.latitude, station.longitude], 15);
          });

        markersRef.current.push(marker);
        console.log(`Marker ${index + 1} added for ${station.name} at [${station.latitude}, ${station.longitude}]`);
      } else {
        console.warn(`Invalid coordinates for station ${station.name}:`, station.latitude, station.longitude);
      }
    });

    console.log(`Total markers added: ${markersRef.current.length}`);
  }, [mapReady, stations, L]);

  // Handle location request
  const handleRequestLocation = async () => {
    if (permissionStatus === 'granted') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowLocationPrompt(false);
          // Automatically show route dialog if a station is selected
          if (selectedStation) {
            setShowTransportDialog(true);
          }
        },
        (error) => {
          toast({
            variant: 'destructive',
            title: 'Erreur de localisation',
            description: 'Impossible d\'obtenir votre position. Veuillez activer la localisation dans les paramètres.',
            duration: 3000,
          });
        }
      );
    } else {
      const permission = await requestLocation();
      if (permission === 'granted') {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setShowLocationPrompt(false);
            // Automatically show route dialog if a station is selected
            if (selectedStation) {
              setShowTransportDialog(true);
            }
          },
          (error) => {
            toast({
              variant: 'destructive',
              title: 'Erreur de localisation',
              description: 'Impossible d\'obtenir votre position.',
              duration: 3000,
            });
          }
        );
      }
    }
  };

  // Calculate route to station using OSRM
  const calculateRoute = async (mode: 'driving' | 'walking' = 'driving') => {
    if (!selectedStation || !userLocation || !mapInstanceRef.current || !L) return null;

    setIsLoadingRoute(true);

    try {
      const profile = mode === 'driving' ? 'driving' : 'walking';
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${profile}/${userLocation.lng},${userLocation.lat};${selectedStation.longitude},${selectedStation.latitude}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error('Impossible de calculer l\'itinéraire');
      }

      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]); // Convert [lng, lat] to [lat, lng]

        // Clear previous route
        if (routeLayerRef.current) {
          routeLayerRef.current.clearLayers();
        }

        // Draw route with app accent color
        const polyline = L.polyline(coordinates as [number, number][], {
          color: 'hsl(198, 100%, 49%)', // Accent color
          weight: 6,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeLayerRef.current!);

        // Fit map to route
        mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        const routeData = {
          distance: route.distance, // in meters
          duration: route.duration, // in seconds
          remainingDistance: route.distance,
          remainingDuration: route.duration,
        };

        setNavigationData(routeData);
        setShowRoute(true);
        setIsLoadingRoute(false);

        return routeData;
      } else {
        throw new Error('Aucun itinéraire trouvé');
      }
    } catch (error: any) {
      console.error('Error calculating route:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de calculer l\'itinéraire.',
      });
      setIsLoadingRoute(false);
      return null;
    }
  };

  // Show transport mode selection dialog
  const handleShowRoute = () => {
    if (!selectedStation || !userLocation) return;
    setShowTransportDialog(true);
  };

  // Start navigation with selected transport mode
  const handleStartNavigation = async () => {
    setShowTransportDialog(false);
    setIsLoadingRoute(true);
    const routeData = await calculateRoute(transportMode);
    if (routeData) {
      // Don't start navigation automatically, just show the route
      // User can click "Commencer la navigation" to start GPS tracking
    }
  };

  // Start GPS tracking when user clicks "Commencer la navigation"
  const handleStartGPSNavigation = () => {
    if (!selectedStation || !userLocation || !navigationData) return;
    
    console.log('Starting GPS navigation with transportMode:', transportMode);
    setIsNavigating(true);
    setHasArrived(false);
    
    // Update user marker icon based on transport mode immediately
    if (userMarkerRef.current && mapInstanceRef.current && L) {
      const isWalking = transportMode === 'walking';
      console.log('Updating initial marker icon, isWalking:', isWalking);
      
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div style="width: ${isWalking ? '32px' : '40px'}; height: ${isWalking ? '32px' : '40px'}; background: hsl(210, 100%, 20%); border: 4px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
          ${isWalking 
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21ZM14 10V12H22V10H14ZM16 20H18V16H22V14H18V10H16V14H12V16H16V20Z"/></svg>'
            : '<svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5S16.67 13 17.5 13s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>'
          }
        </div>`,
        iconSize: [isWalking ? 32 : 40, isWalking ? 32 : 40],
        iconAnchor: [isWalking ? 16 : 20, isWalking ? 16 : 20],
      });
      userMarkerRef.current.setIcon(userIcon);
      userMarkerRef.current.setPopupContent(isWalking ? 'Votre position (à pied)' : 'Votre position (en voiture)');
    }
    
    startNavigationTracking();
  };

  // Start GPS tracking for navigation
  const startNavigationTracking = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'La géolocalisation n\'est pas disponible',
      });
      return;
    }

    // Capture transportMode at the start of navigation
    const currentTransportMode = transportMode;
    console.log('Starting navigation tracking with mode:', currentTransportMode);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentPosition(newPosition);

        // Update user location marker
        if (mapInstanceRef.current && L) {
          // Remove old user marker if it exists
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Add new user marker with icon based on transport mode
          // Use the captured transportMode from closure
          const isWalking = currentTransportMode === 'walking';
          console.log('Updating marker icon, transportMode:', currentTransportMode, 'isWalking:', isWalking);
          
          const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div style="width: ${isWalking ? '32px' : '40px'}; height: ${isWalking ? '32px' : '40px'}; background: hsl(210, 100%, 20%); border: 4px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
              ${isWalking 
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21ZM14 10V12H22V10H14ZM16 20H18V16H22V14H18V10H16V14H12V16H16V20Z"/></svg>'
                : '<svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5S16.67 13 17.5 13s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>'
              }
            </div>`,
            iconSize: [isWalking ? 32 : 40, isWalking ? 32 : 40],
            iconAnchor: [isWalking ? 16 : 20, isWalking ? 16 : 20],
          });
          const newMarker = L.marker([newPosition.lat, newPosition.lng], { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(isWalking ? 'Votre position (à pied)' : 'Votre position (en voiture)');
          userMarkerRef.current = newMarker;
        }

        // Update map center to follow user
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([newPosition.lat, newPosition.lng], 16);
        }

        // Calculate remaining distance and time
        if (selectedStation) {
          await updateNavigationProgress(newPosition, currentTransportMode);
        }
      },
      (error) => {
        let errorMessage = 'Impossible de suivre votre position';
        
        if (error) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Autorisation de localisation refusée';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position non disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Délai d\'attente dépassé';
              break;
            default:
              errorMessage = error.message || 'Erreur de géolocalisation';
          }
          
          console.error('GPS tracking error:', {
            code: error.code,
            message: error.message,
            error: error
          });
        } else {
          console.error('GPS tracking error: Unknown error');
        }
        
        toast({
          variant: 'destructive',
          title: 'Erreur GPS',
          description: errorMessage,
          duration: 3000,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
  };

  // Update navigation progress
  const updateNavigationProgress = async (currentPos: { lat: number; lng: number }, mode: 'driving' | 'walking' = transportMode) => {
    if (!selectedStation || !navigationData) return;

    try {
      const profile = mode === 'driving' ? 'driving' : 'walking';
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${profile}/${currentPos.lng},${currentPos.lat};${selectedStation.longitude},${selectedStation.latitude}?overview=full&geometries=geojson`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const remainingDistance = route.distance; // in meters
          const remainingDuration = route.duration; // in seconds

          setNavigationData(prev => prev ? {
            ...prev,
            remainingDistance,
            remainingDuration,
          } : null);

          // Check if arrived (within 50 meters)
          if (remainingDistance < 50) {
            if (!hasArrived) {
              setHasArrived(true);
              setIsNavigating(false);
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                setWatchId(null);
              }
              toast({
                title: '🎉 Vous êtes arrivé !',
                description: `Vous êtes arrivé à ${selectedStation.name}`,
                duration: 10000,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating navigation:', error);
    }
  };

  // Stop navigation
  const handleStopNavigation = () => {
    setIsNavigating(false);
    setHasArrived(false);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    // Restore user marker to initial location
    if (userLocation && mapInstanceRef.current && L && userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }
    
    setNavigationData(null);
    toast({
      title: 'Navigation arrêtée',
      description: 'Le suivi GPS a été désactivé',
    });
  };

  // Clear route
  const handleClearRoute = () => {
    handleStopNavigation();
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }
    setShowRoute(false);
    setSelectedStation(null);
    setNavigationData(null);
    
    // Reset map view
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }
  };

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Location Prompt Screen
  if (showLocationPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-2 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <MapPin className="h-16 w-16 text-primary relative z-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Où vous trouvez-vous ?
              </h2>
              <p className="text-muted-foreground">
                Nous avons besoin de votre localisation pour vous montrer les stations-service les plus proches de vous.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                onClick={handleRequestLocation}
                disabled={isLocationLoading}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg h-12 text-base"
              >
                {isLocationLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Localisation en cours...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 mr-2" />
                    Partager ma localisation
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/home')}
                className="w-full"
              >
                Annuler
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Votre localisation est utilisée uniquement pour trouver les stations proches</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg sticky top-0 z-20">
        <Button variant="ghost" size="icon" onClick={() => router.push('/home')} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <Fuel className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Stations
          </h1>
        </div>
        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/stations/nouveau')}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          >
            <Fuel className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        )}
        {showRoute && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearRoute}
            className="hover:bg-primary/10"
          >
            <X className="h-6 w-6 text-primary" />
          </Button>
        )}
      </header>

      {/* Map Container */}
      <div className="relative" style={{ height: 'calc(100vh - 250px)', minHeight: '600px', width: '100%' }}>
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '600px',
            position: 'relative',
            zIndex: 1
          }}
        />
        
        {isMapLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
            </div>
          </div>
        )}
        
        {/* Selected Station Info Card */}
        {selectedStation && !showRoute && (
          <div className="absolute bottom-4 left-4 right-4 z-10 max-w-md mx-auto">
            <Card className="shadow-2xl border-2 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{selectedStation.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedStation.address}, {selectedStation.city}</span>
                    </div>
                    {selectedStation.fuelTypes && selectedStation.fuelTypes.length > 0 && (
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        <Fuel className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">{selectedStation.fuelTypes.join(', ')}</span>
                      </div>
                    )}
                    {selectedStation.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{selectedStation.rating.toFixed(1)}</span>
                        {selectedStation.reviewCount && (
                          <span className="text-xs text-muted-foreground">({selectedStation.reviewCount} avis)</span>
                        )}
                      </div>
                    )}
                    {selectedStation.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <a href={`tel:${selectedStation.phoneNumber}`} className="text-primary hover:underline">
                          {selectedStation.phoneNumber}
                        </a>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleShowRoute}
                    disabled={isLoadingRoute}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                  >
                    {isLoadingRoute ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Itinéraire
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Card - Active Navigation */}
        {isNavigating && selectedStation && navigationData && (
          <div className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
            <Card className="shadow-2xl border-2 border-accent bg-gradient-to-br from-accent/20 to-primary/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation2 className="h-5 w-5 text-accent animate-pulse" />
                      <div>
                        <h3 className="font-bold text-lg">Navigation active</h3>
                        <p className="text-xs text-muted-foreground">
                          Mode: {transportMode === 'driving' ? '🚗 Voiture' : '🚶 À pied'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleStopNavigation}
                      className="h-8 w-8"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="bg-background/80 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Distance restante</span>
                      <span className="font-bold text-lg text-primary">
                        {navigationData.remainingDistance < 1000
                          ? `${Math.round(navigationData.remainingDistance)} m`
                          : `${(navigationData.remainingDistance / 1000).toFixed(1)} km`}
                      </span>
                    </div>
                  </div>

                  {hasArrived && (
                    <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-center">
                      <p className="font-bold text-green-700">🎉 Vous êtes arrivé !</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{selectedStation.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Route Info Card - Before Navigation */}
        {showRoute && !isNavigating && selectedStation && navigationData && (
          <div className="absolute bottom-4 left-4 right-4 z-10 max-w-md mx-auto">
            <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Itinéraire vers {selectedStation.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearRoute}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="bg-background/80 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Mode de transport</span>
                      <span className="text-xs font-medium text-primary">
                        {transportMode === 'driving' ? '🚗 Voiture' : '🚶 À pied'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Distance totale</span>
                      <span className="font-bold text-primary">
                        {navigationData.distance < 1000
                          ? `${Math.round(navigationData.distance)} m`
                          : `${(navigationData.distance / 1000).toFixed(1)} km`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-muted-foreground">Votre position</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent"></div>
                      <span className="font-medium">{selectedStation.name}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartGPSNavigation}
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Commencer la navigation
                  </Button>

                  {selectedStation.phoneNumber && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`tel:${selectedStation.phoneNumber}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Transport Mode Selection Dialog */}
      <Dialog open={showTransportDialog} onOpenChange={setShowTransportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Choisir le mode de transport
            </DialogTitle>
            <DialogDescription>
              Sélectionnez votre mode de transport pour calculer l'itinéraire optimal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              variant={transportMode === 'driving' ? 'default' : 'outline'}
              className={`w-full h-20 flex-col gap-2 ${
                transportMode === 'driving'
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                  : ''
              }`}
              onClick={() => setTransportMode('driving')}
            >
              <Car className="h-8 w-8" />
              <span className="font-semibold">En voiture</span>
            </Button>
            <Button
              variant={transportMode === 'walking' ? 'default' : 'outline'}
              className={`w-full h-20 flex-col gap-2 ${
                transportMode === 'walking'
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                  : ''
              }`}
              onClick={() => setTransportMode('walking')}
            >
              <Footprints className="h-8 w-8" />
              <span className="font-semibold">À pied</span>
            </Button>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTransportDialog(false);
                setTransportMode('driving'); // Reset to default
              }}
              className="flex-1 border-2 hover:bg-muted"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleStartNavigation}
              disabled={isLoadingRoute}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg"
            >
              {isLoadingRoute ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calcul...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Commencer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stations List (Bottom Sheet) */}
      {!showRoute && (
        <div className="bg-background border-t border-primary/20 p-4 max-h-48 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <h3 className="font-bold mb-3 text-primary">Stations disponibles ({stations?.length || 0})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {isStationsLoading ? (
                <div className="col-span-full flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : stations && stations.length > 0 ? (
                stations.map((station) => (
                  <Card
                    key={station.id}
                    className={cn(
                      "cursor-pointer hover:shadow-lg transition-shadow border-2",
                      selectedStation?.id === station.id
                        ? "border-primary bg-primary/5"
                        : "border-primary/20"
                    )}
                    onClick={() => {
                      setSelectedStation(station);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([station.latitude, station.longitude], 15);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate">{station.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{station.city}</p>
                          {station.fuelTypes && station.fuelTypes.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate">{station.fuelTypes.join(', ')}</p>
                          )}
                          {station.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{station.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <Navigation className="h-4 w-4 text-primary flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-muted-foreground">
                  Aucune station disponible
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

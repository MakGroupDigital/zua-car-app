import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  location: LocationData | null;
  currentTime: string;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied';
  requestLocation: () => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Reverse geocoding function
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationData> => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Zua-Car App',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la localisation');
      }

      const data = await response.json();
      const address = data.address || {};

      return {
        city: address.city || address.town || address.village || address.municipality || 'Ville inconnue',
        country: address.country || 'Pays inconnu',
        latitude: lat,
        longitude: lng,
      };
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      // Fallback to coordinates if reverse geocoding fails
      return {
        city: 'Localisation',
        country: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        latitude: lat,
        longitude: lng,
      };
    }
  }, []);

  // Fetch location
  const fetchLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setError('La géolocalisation n\'est pas supportée');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationData = await reverseGeocode(latitude, longitude);
          setLocation(locationData);
          setPermissionStatus('granted');
        } catch (err: any) {
          setError(err.message || 'Erreur lors de la récupération de la localisation');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        if (err.code === 1) {
          // Permission denied
          setPermissionStatus('denied');
          setError('Autorisation de localisation refusée');
        } else if (err.code === 2) {
          setError('Position non disponible');
        } else {
          setError('Erreur de géolocalisation');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [reverseGeocode]);

  // Check permission status
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setPermissionStatus('denied');
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    // Try to check permission status using Permissions API
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          setPermissionStatus('granted');
          fetchLocation();
        } else if (result.state === 'denied') {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('prompt');
        }

        result.addEventListener('change', () => {
          if (result.state === 'granted') {
            setPermissionStatus('granted');
            fetchLocation();
          } else if (result.state === 'denied') {
            setPermissionStatus('denied');
          } else {
            setPermissionStatus('prompt');
          }
        });
      }).catch(() => {
        // Fallback if permissions API is not available or fails
        setPermissionStatus('prompt');
      });
    } else {
      // Fallback: try to get location directly to check permission
      setPermissionStatus('prompt');
    }
  }, [fetchLocation]);

  // Request location permission
  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setError('La géolocalisation n\'est pas supportée');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Try to get location - this will trigger permission prompt if needed
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationData = await reverseGeocode(latitude, longitude);
          setLocation(locationData);
          setPermissionStatus('granted');
        } catch (err: any) {
          setError(err.message || 'Erreur lors de la récupération de la localisation');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        if (err.code === 1) {
          // Permission denied
          setPermissionStatus('denied');
          setError('Autorisation de localisation refusée. Veuillez l\'activer dans les paramètres de votre navigateur.');
        } else if (err.code === 2) {
          setError('Position non disponible');
          setPermissionStatus('denied');
        } else {
          setError('Erreur de géolocalisation');
          setPermissionStatus('prompt');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Always get fresh location
      }
    );
  }, [reverseGeocode]);

  return {
    location,
    currentTime,
    isLoading,
    error,
    permissionStatus,
    requestLocation,
  };
}


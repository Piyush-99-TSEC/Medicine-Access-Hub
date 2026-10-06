import { useState, useEffect } from 'react';
import { USER_LOCATION } from '../mock/mockData';

/**
 * useGeolocation — reads the browser's GPS position via navigator.geolocation.
 * Falls back to the mock USER_LOCATION (used throughout the prototype) if
 * permission is denied or the API is unavailable, so the app always has a
 * usable coordinate to centre the map and compute search radii.
 */
export function useGeolocation() {
  const [location, setLocation] = useState(USER_LOCATION);
  const [source, setSource] = useState('mock'); // 'gps' | 'mock'
  const [permissionState, setPermissionState] = useState('unknown'); // 'granted' | 'denied' | 'unavailable' | 'unknown'

  useEffect(() => {
    // The demo pharmacies are all in Bandra, so real GPS is opt-in (VITE_USE_GPS=true).
    if (import.meta.env.VITE_USE_GPS !== 'true') return;
    
    if (!('geolocation' in navigator)) {
      setPermissionState('unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSource('gps');
        setPermissionState('granted');
      },
      () => {
        setPermissionState('denied');
        // keep mock USER_LOCATION as a graceful fallback
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  return { location, source, permissionState };
}

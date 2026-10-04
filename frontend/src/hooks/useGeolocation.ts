import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  lat: number;
  lng: number;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionState: 'granted' | 'prompt' | 'denied' | 'unsupported';
  isSimulated: boolean;
}

// Default fallback coordinates (Central Park / scenic green space default)
const DEFAULT_FALLBACK = {
  lat: 40.785091,
  lng: -73.968285,
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: DEFAULT_FALLBACK.lat,
    lng: DEFAULT_FALLBACK.lng,
    accuracy: null,
    loading: true,
    error: null,
    permissionState: 'prompt',
    isSimulated: true,
  });

  const requestPosition = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((prev) => ({
        ...prev,
        loading: false,
        permissionState: 'unsupported',
        error: 'Geolocation is not supported by your browser. Using local fallback location.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));


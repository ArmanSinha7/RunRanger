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

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          loading: false,
          error: null,
          permissionState: 'granted',
          isSimulated: false,
        });
      },
      (err) => {
        let msg = 'Unable to retrieve location.';
        let perm: GeolocationState['permissionState'] = 'prompt';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Running in local fallback location mode.';
          perm = 'denied';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location unavailable. Running in local fallback location mode.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Running in local fallback location mode.';
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          error: msg,
          permissionState: perm,
          isSimulated: true,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    requestPosition();
  }, [requestPosition]);

  const setManualLocation = useCallback((lat: number, lng: number) => {
    setState({
      lat,
      lng,
      accuracy: null,
      loading: false,
      error: null,
      permissionState: 'granted',
      isSimulated: true,
    });
  }, []);

  return {
    ...state,
    refresh: requestPosition,
    setManualLocation,
  };
}

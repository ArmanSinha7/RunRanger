export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDurationLong(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins} min`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
}

export function formatPace(totalSeconds: number, distanceKm: number): string {
  if (distanceKm <= 0.05 || totalSeconds <= 0) {
    return "--'--\" /km";
  }
  const secPerKm = totalSeconds / distanceKm;
  if (secPerKm > 1800) {
    return "--'--\" /km";
  }
  const paceMins = Math.floor(secPerKm / 60);
  const paceSecs = Math.floor(secPerKm % 60);
  return `${paceMins}'${paceSecs.toString().padStart(2, '0')}" /km`;
}


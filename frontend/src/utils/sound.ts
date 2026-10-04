/**
 * Distraction-free haptic and audio signals for outdoor runners.
 * Completely zero-cost and offline using browser native APIs.
 */

export function triggerHaptic(pattern: number | number[] = 200) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
}

export function playSuccessChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a gentle two-tone chime (E5 -> G#5)
    const now = ctx.currentTime;
    

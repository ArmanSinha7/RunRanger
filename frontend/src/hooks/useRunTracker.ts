import { useState, useEffect, useRef, useCallback } from 'react';
import type { Mission } from '../types/mission';
import { playCheckpointChime, triggerHaptic } from '../utils/sound';

export interface RunTrackerState {
  status: 'idle' | 'running' | 'paused' | 'finished';
  elapsedSeconds: number;
  distanceKm: number;
  completedCheckpoints: number[];
  currentCheckpointIndex: number;
  isSimulatedSpeed: boolean;
}

export function useRunTracker(mission: Mission | null) {
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]);
  const [isSimulatedSpeed, setIsSimulatedSpeed] = useState(false);

  const timerRef = useRef<number | null>(null);
  const missionRef = useRef(mission);
  missionRef.current = mission;

  // Compute active checkpoint
  const currentCheckpointIndex = (() => {
    if (!mission || mission.checkpoints.length === 0) return -1;
    // Find first checkpoint that isn't completed yet
    for (let i = 0; i < mission.checkpoints.length; i++) {
      if (!completedCheckpoints.includes(i)) {
        return i;
      }
    }
    return mission.checkpoints.length - 1;
  })();


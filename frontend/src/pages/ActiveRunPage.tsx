import React, { useState } from 'react';
import { Play, Pause, CheckCircle2, Lock, FastForward, Flag, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import type { MissionResponse, RouteResponse } from '../types/mission';
import { CheckpointCard } from '../components/CheckpointCard';
import { MapView } from '../components/MapView';
import { formatSeconds, formatDistance, formatPace } from '../utils/formatters';

interface ActiveRunPageProps {
  missionData: MissionResponse;
  routeData?: RouteResponse | null;
  status: 'idle' | 'running' | 'paused' | 'finished';
  elapsedSeconds: number;
  distanceKm: number;
  completedCheckpoints: number[];
  currentCheckpointIndex: number;
  isSimulatedSpeed: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onToggleCheckpoint: (idx: number) => void;
  onToggleSimSpeed: () => void;
  onShowFocus: () => void;
}

export const ActiveRunPage: React.FC<ActiveRunPageProps> = ({
  missionData,
  routeData,
  status,
  elapsedSeconds,
  distanceKm,
  completedCheckpoints,
  currentCheckpointIndex,
  isSimulatedSpeed,
  onPause,
  onResume,
  onFinish,
  onToggleCheckpoint,
  onToggleSimSpeed,
  onShowFocus,
}) => {
  const { mission } = missionData;
  const [showRouteMap, setShowRouteMap] = useState<boolean>(false);
  const totalPlannedSec = missionData.request.duration_min * 60;
  const progressRatio = Math.min(elapsedSeconds / Math.max(totalPlannedSec, 60), 1.0);
  const percent = Math.round(progressRatio * 100);

  const currentCp = mission.checkpoints[currentCheckpointIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
            {status === 'paused' ? 'Run Paused' : 'Mission in Progress'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSimSpeed}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
              isSimulatedSpeed
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Accelerate timer for Hacktoberfest demo purposes"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{isSimulatedSpeed ? '10x Speed Active' : 'Demo 10x Speed'}</span>
          </button>


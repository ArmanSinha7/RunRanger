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

          <button
            onClick={onShowFocus}
            className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Pocket Mode</span>
          </button>
        </div>
      </div>

      {/* Main Telemetry Cluster */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121c17] border border-[#24352d] text-center space-y-6 shadow-xl">
        {/* Mission Title */}
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          {mission.title}
        </div>

        {/* Big Stopwatch Display */}
        <div className="space-y-1">
          <div className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tight text-white">
            {formatSeconds(elapsedSeconds)}
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Target: ~{missionData.request.duration_min} min ({percent}% elapsed)
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1b2b22] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Distance & Pace Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#18261f] border border-[#263c30]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
              Distance
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-300">
              {formatDistance(distanceKm)}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              Goal: {formatDistance(mission.estimated_distance_km)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#18261f] border border-[#263c30]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
              Estimated Pace
            </span>
            <span className="text-2xl font-bold font-mono text-teal-300">
              {formatPace(elapsedSeconds, distanceKm)}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              Aerobic Target
            </span>
          </div>
        </div>
      </div>

      {/* Current / Next Outdoor Checkpoint Prompt */}
      {currentCp && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#16271e] to-[#111f17] border border-emerald-600/60 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Active Outdoor Target (~min {currentCp.at_minute})
            </span>
            <span className="text-xs text-zinc-400">
              {completedCheckpoints.length} of {mission.checkpoints.length} completed
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {currentCp.title}
            </h3>
            <p className="text-sm text-zinc-200 leading-relaxed">
              "{currentCp.instruction}"
            </p>
          </div>

          <button
            onClick={() => onToggleCheckpoint(currentCheckpointIndex)}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              completedCheckpoints.includes(currentCheckpointIndex)
                ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {completedCheckpoints.includes(currentCheckpointIndex)
                ? 'Observation Checked ✓'
                : 'Mark Checkpoint Completed'}
            </span>
          </button>
        </div>
      )}

      {/* Route & Road Map Toggle */}
      {routeData && routeData.geometry.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#121c17] border border-[#24352d] space-y-3 shadow-lg">
          <button
            onClick={() => setShowRouteMap((prev) => !prev)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform" />
              <div>
                <span className="text-sm font-bold text-white block">
                  {showRouteMap ? 'Hide Road Map' : 'View Street Route & Map'}
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  Road-snapped • Follows public sidewalks and designated paths
                </span>
              </div>
            </div>
            {showRouteMap ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showRouteMap && (
            <div className="space-y-3 pt-3 border-t border-[#203027]">
              <MapView
                geometry={routeData.geometry}
                checkpoints={routeData.checkpoints}
                missionCheckpoints={mission.checkpoints}
                heightClass="h-64 sm:h-72"
              />

              {routeData.streets && routeData.streets.length > 0 && (
                <div className="p-3 rounded-xl bg-[#16271e] border border-emerald-800/60 text-xs space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-300 block">
                    Streets & Pathways Sequence:
                  </span>
                  <div className="text-zinc-200 flex flex-wrap items-center gap-1.5 leading-relaxed">
                    {routeData.streets.map((st, i) => (
                      <React.Fragment key={i}>
                        <span className="px-2 py-0.5 rounded bg-zinc-800/80 font-medium text-emerald-200 border border-zinc-700/80">
                          {st}
                        </span>
                        {i < routeData.streets!.length - 1 && (
                          <span className="text-zinc-500 font-bold">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Checkpoints Overview List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          All Mission Checkpoints (Tap to check)
        </h4>
        <div className="space-y-2">
          {mission.checkpoints.map((cp, idx) => (
            <CheckpointCard
              key={idx}
              checkpoint={cp}
              index={idx}
              completed={completedCheckpoints.includes(idx)}
              interactive={true}
              onToggle={onToggleCheckpoint}
              isActive={idx === currentCheckpointIndex}
            />
          ))}
        </div>
      </div>


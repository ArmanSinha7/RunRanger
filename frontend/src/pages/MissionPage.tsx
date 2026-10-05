import React, { useState } from 'react';
import { Lock, Sparkles, Navigation, AlertCircle, Compass } from 'lucide-react';
import type { MissionResponse, RouteResponse } from '../types/mission';
import { MapView } from '../components/MapView';
import { CheckpointCard } from '../components/CheckpointCard';
import { formatDistance } from '../utils/formatters';

interface MissionPageProps {
  missionData: MissionResponse;
  routeData: RouteResponse | null;
  onLockAndStart: () => void;
  onBack: () => void;
  isLoadingRoute?: boolean;
  onRefreshRoute: (provider: 'local' | 'osrm') => void;
}

export const MissionPage: React.FC<MissionPageProps> = ({
  missionData,
  routeData,
  onLockAndStart,
  onBack,
  onRefreshRoute,
}) => {
  const { mission, mode, notice, generation_ms } = missionData;
  const [activeProvider, setActiveProvider] = useState<'local' | 'osrm'>(
    routeData?.provider || 'osrm'
  );

  const handleProviderChange = (prov: 'local' | 'osrm') => {
    setActiveProvider(prov);
    onRefreshRoute(prov);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Notice Banner if fallback or info */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-relaxed">{notice}</div>
        </div>
      )}

      {/* Header & Mode Badge */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-bold">
              Your Outdoor Mission
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                mode === 'ai'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              {mode === 'ai' ? `Gemma 3:4b (${generation_ms}ms)` : 'Demo Mode (Sample)'}
            </span>
          </div>

          <button
            onClick={onBack}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            ← Change parameters
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {mission.title}
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
          {mission.summary}
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <div className="p-3 rounded-xl bg-[#141e18] border border-[#22332a]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">
              Duration
            </span>
            <span className="text-lg font-bold text-white font-mono">
              ~{missionData.request.duration_min} min
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#141e18] border border-[#22332a]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">
              Road Distance
            </span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {formatDistance(routeData?.distance_km ?? mission.estimated_distance_km)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#141e18] border border-[#22332a]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">
              Intensity
            </span>
            <span className="text-lg font-bold text-teal-300 capitalize">
              {mission.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Pre-Run Coach Tip */}
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
            Pre-Run Field Advice
          </span>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {mission.pre_run_tip}
          </p>
        </div>
      </div>

      {/* Warmup Guidance */}
      <div className="p-3.5 rounded-xl bg-[#141e18] border border-[#22332a] flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="font-bold text-emerald-400 uppercase text-xs">Warmup:</span>
          <span>{mission.warmup}</span>
        </div>
      </div>

      {/* Route & Interactive Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Pedestrian Route & Map
            </h2>
          </div>


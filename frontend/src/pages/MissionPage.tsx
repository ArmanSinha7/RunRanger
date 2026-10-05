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


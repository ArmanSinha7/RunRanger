import React, { useState } from 'react';
import { Lock, Eye, Sun } from 'lucide-react';
import { triggerHaptic } from '../utils/sound';

interface FocusOverlayProps {
  onUnlock: () => void;
  missionTitle: string;
  nextCheckpointTitle?: string;
  screenOffMessage?: string;
}

export const FocusOverlay: React.FC<FocusOverlayProps> = ({
  onUnlock,
  missionTitle,
  nextCheckpointTitle,
  screenOffMessage = 'Your mission is ready. Lock your phone and go outside.',
}) => {
  const [pocketDim, setPocketDim] = useState(false);

  const handlePocketToggle = () => {
    setPocketDim(!pocketDim);
    triggerHaptic(50);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 transition-colors select-none ${
        pocketDim ? 'bg-black text-zinc-700' : 'bg-[#090f0c] text-white'
      }`}
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-800 flex items-center justify-center">
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-semibold block">
              Focus Mode Active
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {missionTitle}
            </span>
          </div>
        </div>

        <button
          onClick={handlePocketToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
        >
          {pocketDim ? <Sun className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span>{pocketDim ? 'Exit Dim' : 'Battery Saver Dim'}</span>
        </button>
      </div>

      {/* Center Statement */}
      <div className="max-w-md mx-auto text-center my-auto space-y-6">
        <div className="text-6xl animate-bounce">🏃</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-300">
          Your mission has begun.
        </h1>
        <p className="text-lg sm:text-xl text-zinc-300 font-medium">
          You don't need to stare at this screen.
        </p>
        <p className="text-sm sm:text-base text-emerald-400/90 font-mono bg-emerald-950/40 p-4 rounded-xl border border-emerald-900/60">
          "{screenOffMessage}"
        </p>

        {nextCheckpointTitle && (
          <div className="pt-2 text-xs sm:text-sm text-zinc-400">
            <span className="text-zinc-500 uppercase tracking-wider block mb-1">Up Next</span>
            <span className="text-emerald-200 font-semibold">{nextCheckpointTitle}</span>
          </div>
        )}
      </div>


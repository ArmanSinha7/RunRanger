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


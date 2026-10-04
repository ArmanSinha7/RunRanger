import React from 'react';
import { X, ShieldCheck, Compass, Trees, Cpu } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121c17] border border-[#24352d] w-full max-w-2xl rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#24352d]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center">
              <Trees className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                About RunRanger
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                Hacktoberfest 2026: “Touch Grass” Challenge
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Philosophy Card */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
            <Compass className="w-4 h-4" />
            <span>The Core Philosophy</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed italic">
            “What if an AI assistant's job was to make itself unnecessary?”
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Most fitness apps try to keep your eyes glued to leaderboards, advertisements, and glowing screens. RunRanger inverts this completely: the AI spends 5 seconds generating a tailored outdoor mission, and then explicitly tells you to lock your phone and go touch grass.
          </p>
        </div>


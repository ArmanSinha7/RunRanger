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

        {/* 4 Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            How It Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-[#16221c] border border-[#24352d]">
              <span className="font-bold text-emerald-400 block mb-1">1. Pick Your Run</span>
              <p className="text-xs text-zinc-300">
                Choose your activity, target duration, terrain, and how you feel today.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#16221c] border border-[#24352d]">
              <span className="font-bold text-emerald-400 block mb-1">2. Get Your Mission</span>
              <p className="text-xs text-zinc-300">
                Local Gemma 3 4B creates real-world checkpoints, nature observations, and pacing bursts.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#16221c] border border-[#24352d]">
              <span className="font-bold text-emerald-400 block mb-1">3. Put Phone Away</span>
              <p className="text-xs text-zinc-300">
                Hit "Lock Phone & Start". Pocket your phone. Run with your senses open.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#16221c] border border-[#24352d]">
              <span className="font-bold text-emerald-400 block mb-1">4. Touch Grass & Reflect</span>
              <p className="text-xs text-zinc-300">
                Finish your run, view your local stats, and get an on-device reflection from Gemma.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Zero Cost Badges */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Absolute Guarantees
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  100% Privacy-First & Local
                </span>
                <p className="text-xs text-zinc-400">
                  Your activity and location data stay on your device unless you explicitly choose to export them. No accounts, no analytics, no tracking pixels, no telemetry.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <Cpu className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Zero Cost & Genuine Open-Weight AI
                </span>
                <p className="text-xs text-zinc-400">
                  Powered by Ollama + Gemma 3 4B running on your local machine. No OpenAI, Anthropic, or Gemini cloud API keys. If Ollama isn't installed, Demo Mode delivers deterministic offline sample missions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Got it, let's run!
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Compass, Sparkles, Activity, ShieldCheck, HelpCircle } from 'lucide-react';
import type { Health } from '../types/health';

interface NavbarProps {
  currentTab: 'landing' | 'create' | 'mission' | 'active' | 'post' | 'dashboard';
  setTab: (tab: 'landing' | 'create' | 'dashboard') => void;
  health: Health | null;
  onOpenHowItWorks: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  health,
  onOpenHowItWorks,
}) => {
  const isAIMode = health?.mode === 'ai';

  return (
    <header className="sticky top-0 z-40 bg-[#0d1310]/90 backdrop-blur-md border-b border-[#1f2e26]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setTab('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                RunRanger
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Touch Grass
              </span>
            </div>
            <p className="text-xs text-emerald-300/60 font-medium hidden sm:block">
              Open-Weight AI Running Companion
            </p>
          </div>
        </button>

        {/* Navigation & Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setTab('create')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'create'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            Start Run
          </button>

          <button
            onClick={() => setTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'dashboard'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* AI / Demo Mode Pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isAIMode
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
            }`}
            title={health?.message || 'AI Status'}
          >
            {isAIMode ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gemma 3 (Local)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Mode</span>
              </>
            )}
          </div>

          <button
            onClick={onOpenHowItWorks}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="How It Works & Philosophy"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

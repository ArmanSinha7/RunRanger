import React from 'react';
import { ArrowRight, Compass, ShieldCheck, Cpu, Trees, Sparkles, MapPin, Lock } from 'lucide-react';
import type { Health } from '../types/health';

interface LandingPageProps {
  onStart: () => void;
  onHowItWorks: () => void;
  health: Health | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onHowItWorks }) => {
  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-10 max-w-4xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local AI • Open Weight • Privacy First • Free</span>
        </div>

        {/* Title & Hero Statement */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            RunRanger
          </h1>
          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
            Plan less. Run more.
          </p>
          <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto font-normal leading-relaxed">
            An AI running companion designed to get you <span className="text-emerald-400 font-semibold">off your phone</span>.
            Turn every run into a real-world outdoor exploration mission.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-950/60 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <span>Start a Run</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onHowItWorks}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#16221c] hover:bg-[#1f3027] text-zinc-200 hover:text-white border border-[#24352d] font-semibold text-sm transition-all cursor-pointer"
          >
            How it works
          </button>
        </div>

        {/* Quick Core Philosophy Pill */}
        <div className="pt-2 text-xs font-mono text-emerald-400/80">
          OPEN APP → GET MISSION → GO OUTSIDE
        </div>
      </div>

      {/* 4 Steps Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#121c17] border border-[#24352d] space-y-2 hover:border-emerald-700/60 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-3">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">1. Pick your run</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Select duration, terrain, and how you feel. No account or complicated planning required.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121c17] border border-[#24352d] space-y-2 hover:border-emerald-700/60 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">2. Get your mission</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Gemma 3 4B crafts unique nature observations, pacing bursts, and scenic checkpoints.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121c17] border border-[#24352d] space-y-2 hover:border-emerald-700/60 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">3. Put phone away</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Hit Lock & Start. Pocket your screen. Run with your head up and senses alive.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121c17] border border-[#24352d] space-y-2 hover:border-emerald-700/60 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-3">
            <Trees className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">4. Touch grass</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Return refreshed. Save your local progress and get a concise on-device reflection.
          </p>
        </div>
      </div>

      {/* Touch Grass Theme Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#14261d] to-[#0f1a14] border border-[#284234] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Hacktoberfest 2026 Open-Source AI Challenge
            </span>
            <h2 className="text-2xl font-bold text-white">
              “What if an AI assistant's job was to make itself unnecessary?”
            </h2>
          </div>
          <div className="shrink-0">
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700/60 text-xs font-semibold text-emerald-300">
              Week 1: Touch Grass
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          RunRanger uses open-weight AI locally because the app is designed for outdoor environments, where connectivity may be unreliable and runners should never need to send personal activity or location data to commercial cloud AI providers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero paid APIs or cloud databases</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Cpu className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Local Gemma 3 4B via Ollama</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>OpenStreetMap & OSRM routing</span>
          </div>
        </div>
      </div>

      {/* Quick Start Card */}
      <div className="text-center pt-2">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <span>Ready to lace up? Generate your first mission</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

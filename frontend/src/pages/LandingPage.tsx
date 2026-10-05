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


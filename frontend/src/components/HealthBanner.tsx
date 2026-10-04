import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Terminal, X } from 'lucide-react';
import type { Health } from '../types/health';

interface HealthBannerProps {
  health: Health | null;
}

export const HealthBanner: React.FC<HealthBannerProps> = ({ health }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!health || dismissed) return null;

  const isAIMode = health.mode === 'ai';

  return (
    <div
      className={`border-b transition-all ${
        isAIMode
          ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200'
          : 'bg-amber-950/40 border-amber-900/60 text-amber-200'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          {isAIMode ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold">
              {isAIMode ? 'AI Mode' : 'Demo Mode'}:
            </span>
            <span className="text-zinc-300">
              {isAIMode
                ? 'Gemma 3 4B is running locally via Ollama. 100% private, on-device AI.'
                : health.ollama_running
                ? `Ollama detected, but model ${health.model} isn't pulled. Using deterministic sample missions.`
                : 'Local sample missions active. Zero dependencies required to demo.'}
            </span>

            {!isAIMode && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 font-mono text-[11px] text-zinc-300 border border-zinc-700">
                <Terminal className="w-3 h-3 text-emerald-400" />
                ollama pull gemma3:4b
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-zinc-400 hover:text-zinc-200 p-1 rounded transition-colors cursor-pointer shrink-0 ml-2"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

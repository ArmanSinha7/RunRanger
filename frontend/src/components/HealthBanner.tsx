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


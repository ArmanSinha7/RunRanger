import React from 'react';
import type { Badge } from '../types/run';
import { Lock } from 'lucide-react';

interface BadgeListProps {
  badges: Badge[];
}

export const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
            badge.earned
              ? 'bg-[#15231c] border-emerald-600/60 shadow-md shadow-emerald-950/40'
              : 'bg-[#121815] border-zinc-800/80 opacity-60 grayscale'
          }`}
        >
          <div className="relative mb-2">
            <span className="text-3xl select-none">{badge.emoji}</span>
            {!badge.earned && (
              <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-700 rounded-full p-0.5 text-zinc-400">
                <Lock className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          <span className="font-semibold text-xs sm:text-sm text-zinc-100 mb-1">
            {badge.name}
          </span>
          <span className="text-[11px] text-zinc-400 leading-tight">
            {badge.description}
          </span>
        </div>
      ))}
    </div>
  );
};

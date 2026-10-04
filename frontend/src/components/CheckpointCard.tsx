import React from 'react';
import { Eye, Zap, Trees, Smile, Navigation, Heart, CheckCircle2, Circle } from 'lucide-react';
import type { Checkpoint, CheckpointType } from '../types/mission';

interface CheckpointCardProps {
  checkpoint: Checkpoint;
  index: number;
  completed?: boolean;
  onToggle?: (index: number) => void;
  interactive?: boolean;
  isActive?: boolean;
}

const TYPE_CONFIG: Record<
  CheckpointType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  observation: { label: 'Observation', icon: Eye, color: 'text-sky-400 bg-sky-950/60 border-sky-800' },
  fitness: { label: 'Fitness', icon: Zap, color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
  nature: { label: 'Nature', icon: Trees, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
  mindfulness: { label: 'Mindfulness', icon: Heart, color: 'text-purple-400 bg-purple-950/60 border-purple-800' },
  social: { label: 'Social', icon: Smile, color: 'text-pink-400 bg-pink-950/60 border-pink-800' },
  exploration: { label: 'Exploration', icon: Navigation, color: 'text-orange-400 bg-orange-950/60 border-orange-800' },
};

export const CheckpointCard: React.FC<CheckpointCardProps> = ({
  checkpoint,
  index,
  completed = false,
  onToggle,
  interactive = false,
  isActive = false,
}) => {
  const config = TYPE_CONFIG[checkpoint.type] || TYPE_CONFIG.observation;
  const Icon = config.icon;

  return (
    <div
      onClick={() => interactive && onToggle?.(index)}
      className={`relative p-4 rounded-xl border transition-all ${
        interactive ? 'cursor-pointer hover:border-emerald-600/70' : ''
      } ${
        completed
          ? 'bg-emerald-950/30 border-emerald-800/80 opacity-75'
          : isActive
          ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/30'
          : 'bg-[#15201a] border-[#24352d]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Index marker or check toggle */}
          <div className="pt-0.5 shrink-0">
            {interactive ? (
              <button
                type="button"
                className="focus:outline-none cursor-pointer"
                aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-500 hover:text-emerald-400 transition-colors" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                {index + 1}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`font-semibold text-sm sm:text-base ${completed ? 'line-through text-zinc-400' : 'text-zinc-100'}`}>
                {checkpoint.title}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                ~{checkpoint.at_minute} min
              </span>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${completed ? 'text-zinc-500' : 'text-zinc-300'}`}>
              {checkpoint.instruction}
            </p>
          </div>
        </div>

        {/* Type Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${config.color}`}>
          <Icon className="w-3 h-3" />
          <span className="hidden sm:inline">{config.label}</span>
        </div>
      </div>
    </div>
  );
};

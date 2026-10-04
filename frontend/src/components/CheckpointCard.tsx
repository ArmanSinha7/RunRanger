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


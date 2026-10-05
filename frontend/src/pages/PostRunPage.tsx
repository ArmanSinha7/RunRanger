import React, { useState } from 'react';
import { Trophy, Sparkles, CheckCircle2, Loader2, Save, Compass } from 'lucide-react';
import type { MissionResponse, RouteResponse } from '../types/mission';
import type { Feeling, ReflectionResponse } from '../types/run';
import { MapView } from '../components/MapView';
import { formatSeconds, formatDistance, formatPace } from '../utils/formatters';

interface PostRunPageProps {
  missionData: MissionResponse;
  routeData?: RouteResponse | null;
  elapsedSeconds: number;
  distanceKm: number;
  completedCheckpoints: number[];
  onSaveRun: (feeling: Feeling, note: string, reflection: string) => Promise<void>;
  onGenerateReflection: (feeling: Feeling, note: string) => Promise<ReflectionResponse>;
  onGoToDashboard: () => void;
  onNewRun: () => void;
}

const FEELING_OPTIONS: { emoji: string; label: string; value: Feeling }[] = [
  { emoji: '😀', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😓', label: 'Hard', value: 'hard' },
  { emoji: '🤩', label: 'Amazing', value: 'amazing' },
];

export const PostRunPage: React.FC<PostRunPageProps> = ({
  missionData,
  routeData,
  elapsedSeconds,
  distanceKm,
  completedCheckpoints,
  onSaveRun,
  onGenerateReflection,
  onGoToDashboard,
  onNewRun,
}) => {
  const { mission } = missionData;
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling>('great');
  const [note, setNote] = useState<string>('');
  const [isGeneratingReflection, setIsGeneratingReflection] = useState<boolean>(false);
  const [reflectionData, setReflectionData] = useState<ReflectionResponse | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const totalCps = mission.checkpoints.length;
  const doneCps = completedCheckpoints.length;
  const completionRate = Math.round((doneCps / Math.max(totalCps, 1)) * 100);

  const handleGenerateReflection = async () => {
    setIsGeneratingReflection(true);
    try {
      const resp = await onGenerateReflection(selectedFeeling, note);
      setReflectionData(resp);
    } catch {
      // Fallback local reflection
      setReflectionData({
        mode: 'demo',
        reflection: `You maintained a steady effort across ${formatDistance(distanceKm)} and checked off ${doneCps} of ${totalCps} outdoor checkpoints. Solid effort!`,
        next_run: 'Try increasing duration by 5 minutes next time or tackling a trail route.',
      });
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const reflText = reflectionData
        ? `${reflectionData.reflection} ${reflectionData.next_run}`
        : '';
      await onSaveRun(selectedFeeling, note, reflText);
      setIsSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-4 rounded-3xl bg-emerald-950/80 border border-emerald-700/60 shadow-xl shadow-emerald-950/40 text-4xl mb-1 animate-bounce">
          🎉
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          RUN COMPLETE!
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 font-medium">
          You laced up, touched grass, and explored the real world.
        </p>
      </div>


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

      {/* Metrics Card */}
      <div className="p-6 rounded-3xl bg-[#121c17] border border-[#24352d] shadow-xl space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-[#16241d] border border-[#23382c]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">
              Duration
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {formatSeconds(elapsedSeconds)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#16241d] border border-[#23382c]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">
              Distance
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {formatDistance(distanceKm)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#16241d] border border-[#23382c]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">
              Avg Pace
            </span>
            <span className="text-xl font-bold font-mono text-teal-300">
              {formatPace(elapsedSeconds, distanceKm)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#16241d] border border-[#23382c]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">
              Checkpoints
            </span>
            <span className="text-xl font-bold font-mono text-amber-400">
              {doneCps} / {totalCps}
            </span>
          </div>
        </div>

        {/* Challenge Completion Highlight */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
                Outdoor Challenges Rating
              </span>
              <span className="text-sm font-semibold text-white">
                {completionRate}% Completed
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {doneCps === totalCps ? 'Flawless Run 🌟' : 'Solid Effort 👍'}
          </span>
        </div>
      </div>

      {/* Route Map Summary */}
      {routeData && routeData.geometry.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#121c17] border border-[#24352d] space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Completed Pedestrian Route
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
              {formatDistance(routeData.distance_km)} Road Distance
            </span>
          </div>

          <MapView
            geometry={routeData.geometry}
            checkpoints={routeData.checkpoints}
            missionCheckpoints={mission.checkpoints}
            heightClass="h-60 sm:h-72"
          />

          {routeData.streets && routeData.streets.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#15241c] border border-emerald-800/50 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Roads & Areas Explored
              </span>
              <p className="text-zinc-300 leading-relaxed font-medium">
                {routeData.streets.join(' → ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Feeling & Feedback Form */}
      <div className="p-6 rounded-3xl bg-[#121c17] border border-[#24352d] space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            How did that feel?
          </h3>
          <p className="text-xs text-zinc-400">
            Tell Gemma 3 how your body and mind felt during the run.
          </p>
        </div>


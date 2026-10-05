import React, { useState } from 'react';
import { Compass, Sparkles, Loader2, Shuffle } from 'lucide-react';
import type { Activity, Difficulty, Goal, Environment, MissionRequest } from '../types/mission';
import type { Health } from '../types/health';

interface CreateRunPageProps {
  onGenerate: (req: MissionRequest) => Promise<void>;
  isLoading: boolean;
  health: Health | null;
}

const ACTIVITIES: { id: Activity; label: string; icon: string }[] = [
  { id: 'running', label: 'Running', icon: '🏃' },
  { id: 'jogging', label: 'Jogging', icon: '👟' },
  { id: 'walking', label: 'Walking', icon: '🚶' },
];

const DURATIONS: { value: number; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy', label: 'Easy', desc: 'Gentle aerobic flow & relaxed pace' },
  { id: 'moderate', label: 'Moderate', desc: 'Balanced rhythm with intermittent bursts' },
  { id: 'challenging', label: 'Challenging', desc: 'Push your limits & longer sustained efforts' },
];

const GOALS: { id: Goal; label: string; icon: string }[] = [
  { id: 'fitness', label: 'Fitness', icon: '⚡' },
  { id: 'exploration', label: 'Exploration', icon: '🗺️' },
  { id: 'nature', label: 'Nature', icon: '🌲' },
  { id: 'stress_relief', label: 'Stress Relief', icon: '🧘' },
  { id: 'adventure', label: 'Adventure', icon: '🧭' },
  { id: 'random', label: 'Surprise Me', icon: '🎲' },
];

const ENVIRONMENTS: { id: Environment; label: string; icon: string }[] = [
  { id: 'park', label: 'Park', icon: '🌳' },
  { id: 'trail', label: 'Trail', icon: '🥾' },
  { id: 'campus', label: 'Campus', icon: '🏛️' },
  { id: 'neighborhood', label: 'Neighborhood', icon: '🏡' },
  { id: 'anywhere', label: 'Anywhere', icon: '🌍' },
];

const MOOD_SUGGESTIONS = [
  'I want to clear my head.',
  'I want something challenging.',
  'I want to explore unseen corners.',
  'I just feel lazy and need momentum.',
  'Looking for quiet nature sounds.',
];

export const CreateRunPage: React.FC<CreateRunPageProps> = ({
  onGenerate,
  isLoading,
  health,
}) => {
  const [activity, setActivity] = useState<Activity>('running');
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [goal, setGoal] = useState<Goal>('exploration');
  const [environment, setEnvironment] = useState<Environment>('anywhere');
  const [mood, setMood] = useState<string>('');
  const [preferDemo, setPreferDemo] = useState<boolean>(health?.mode === 'demo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate({
      activity,
      duration_min: duration,
      difficulty,
      goal,
      environment,
      mood,
      prefer_demo: preferDemo,
    });
  };

  const handleRandomize = () => {
    const randomActivity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)].id;
    const randomDuration = DURATIONS[Math.floor(Math.random() * DURATIONS.length)].value;
    const randomDiff = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)].id;
    const randomGoal = GOALS[Math.floor(Math.random() * GOALS.length)].id;
    const randomEnv = ENVIRONMENTS[Math.floor(Math.random() * ENVIRONMENTS.length)].id;
    setActivity(randomActivity);
    setDuration(randomDuration);
    setCustomDuration(false);
    setDifficulty(randomDiff);
    setGoal(randomGoal);
    setEnvironment(randomEnv);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Your Mission
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure your run. RunRanger turns it into an outdoor mission.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16221c] border border-[#24352d] text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-[#1e3027] transition-all cursor-pointer"
          title="Randomize parameters"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Surprise Run</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Activity */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            1. Activity
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {ACTIVITIES.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => setActivity(act.id)}
                className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activity === act.id
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-[#141e18] border-[#22332a] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a2821]'
                }`}
              >
                <span className="text-2xl">{act.icon}</span>
                <span className="text-xs sm:text-sm font-semibold">{act.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Duration */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              2. Target Duration
            </label>
            <span className="text-xs font-mono font-bold text-zinc-300">
              {duration} minutes
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map((dur) => (
              <button
                key={dur.value}
                type="button"
                onClick={() => {
                  setDuration(dur.value);
                  setCustomDuration(false);
                }}
                className={`py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  duration === dur.value && !customDuration
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                    : 'bg-[#141e18] border-[#22332a] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>

          {/* Custom Duration Slider */}
          <div className="pt-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-500">10m</span>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={duration}
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  setCustomDuration(true);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500">90m</span>
            </div>
          </div>
        </div>

        {/* 3. Difficulty */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            3. Intensity Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  difficulty === diff.id
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-[#141e18] border-[#22332a] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a2821]'
                }`}
              >
                <span className="font-bold text-sm block mb-0.5">{diff.label}</span>
                <span className="text-[11px] text-zinc-400 block leading-tight">{diff.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Goal */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            4. Mission Focus
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={`py-2.5 px-3 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  goal === g.id
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                    : 'bg-[#141e18] border-[#22332a] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{g.icon}</span>
                <span className="text-xs sm:text-sm font-semibold">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Environment */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            5. Terrain / Environment
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {ENVIRONMENTS.map((env) => (
              <button
                key={env.id}
                type="button"
                onClick={() => setEnvironment(env.id)}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                  environment === env.id
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                    : 'bg-[#141e18] border-[#22332a] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-lg">{env.icon}</span>
                <span className="text-[11px] font-semibold">{env.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Mood / Feeling Prompt */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>6. What are you feeling today? (Optional)</span>
            <span className="text-[11px] text-zinc-500 font-normal">Gemma 3 tunes to this</span>
          </label>

          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g. I want to clear my head, or I feel energetic..."
            maxLength={180}
            className="w-full px-4 py-3 rounded-xl bg-[#141e18] border border-[#22332a] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            {MOOD_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMood(sug)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#18261f] border border-[#273d32] text-zinc-400 hover:text-emerald-300 hover:border-emerald-600 transition-colors cursor-pointer"
              >
                "{sug}"
              </button>
            ))}
          </div>
        </div>

        {/* AI Mode Selector Toggle */}
        <div className="p-3.5 rounded-2xl bg-[#121c17] border border-[#22332a] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-semibold text-zinc-200 block">
                {preferDemo ? 'Sample Demo Missions' : 'Local AI (Gemma 3 4B)'}
              </span>
              <span className="text-[11px] text-zinc-400">
                {preferDemo
                  ? 'Fast, deterministic sample missions from local templates'
                  : 'Gemma 3 running on your machine via Ollama'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreferDemo(!preferDemo)}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer underline underline-offset-4"
          >
            Switch to {preferDemo ? 'AI Mode' : 'Demo Mode'}
          </button>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-950/60 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                {preferDemo ? 'Loading Sample Mission...' : 'Crafting Mission with Gemma 3...'}
              </span>
            </>
          ) : (
            <>
              <Compass className="w-5 h-5" />
              <span>Generate My Run</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

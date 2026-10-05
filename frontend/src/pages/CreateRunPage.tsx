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


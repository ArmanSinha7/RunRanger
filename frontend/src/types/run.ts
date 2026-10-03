import type { MissionMode } from './mission';

export type Feeling = 'amazing' | 'great' | 'good' | 'okay' | 'hard';

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
}

export interface WeekStats {
  runs: number;
  distance_km: number;
  active_sec: number;
}

export interface Stats {
  total_runs: number;
  total_distance_km: number;
  total_active_sec: number;
  challenges_completed: number;
  longest_run_km: number;
  current_streak_days: number;
  favorite_activity: string | null;
  difficulty_progression: string[];
  this_week: WeekStats;
  personal_bests: Record<string, number>;
  badges: Badge[];
}


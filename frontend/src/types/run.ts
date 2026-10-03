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

export interface RunCreate {
  mission_title: string;
  activity: string;
  difficulty: string;
  goal: string;
  environment: string;
  planned_minutes: number;
  duration_sec: number;
  distance_km: number;
  checkpoints_total: number;
  checkpoints_done: number;
  finished_early?: boolean;
  feeling?: Feeling | null;
  note?: string | null;
  reflection?: string | null;
  mode: MissionMode;
  mission: Record<string, unknown>;
}

export interface Run extends RunCreate {
  id: number;
  created_at: string;
}

export interface RunUpdate {
  feeling?: Feeling | null;
  note?: string | null;
  reflection?: string | null;
}

export interface ReflectionRequest {
  mission_title: string;
  activity: string;
  planned_minutes: number;
  duration_sec: number;
  distance_km: number;
  checkpoints_total: number;
  checkpoints_done: number;
  completed_challenges?: string[];
  feeling: Feeling;
  note?: string;
  finished_early?: boolean;
}

export interface ReflectionResponse {
  mode: MissionMode;
  model?: string | null;
  reflection: string;
  next_run: string;
}

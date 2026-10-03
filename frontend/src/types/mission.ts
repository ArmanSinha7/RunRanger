export type Activity = 'running' | 'walking' | 'jogging';
export type Difficulty = 'easy' | 'moderate' | 'challenging';
export type Goal = 'fitness' | 'exploration' | 'nature' | 'stress_relief' | 'adventure' | 'random';
export type Environment = 'campus' | 'park' | 'neighborhood' | 'trail' | 'anywhere';
export type CheckpointType = 'observation' | 'fitness' | 'nature' | 'mindfulness' | 'social' | 'exploration';
export type RouteStyle = 'loop' | 'out_and_back' | 'wander';
export type MissionMode = 'ai' | 'demo';

export interface Checkpoint {
  title: string;
  instruction: string;
  type: CheckpointType;
  at_minute: number;
}

export interface Mission {
  title: string;
  summary: string;
  warmup: string;
  estimated_distance_km: number;
  difficulty: Difficulty;
  route_style: RouteStyle;
  pre_run_tip: string;
  checkpoints: Checkpoint[];
  cooldown: string;
  screen_off_message: string;
}

export interface MissionRequest {
  activity: Activity;
  duration_min: number;
  difficulty: Difficulty;
  goal: Goal;
  environment: Environment;
  mood: string;
  prefer_demo?: boolean;
}

export interface MissionResponse {
  mode: MissionMode;
  model: string | null;
  mission: Mission;
  request: MissionRequest;
  notice: string | null;
  generation_ms: number | null;
  attempts: number;
}


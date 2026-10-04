import type { MissionResponse } from '../types/mission';

const LAST_MISSION_KEY = 'runranger_last_mission';
const ACTIVE_RUN_KEY = 'runranger_active_run_state';
const USER_PREFS_KEY = 'runranger_user_prefs';

export interface UserPrefs {
  preferDemo: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  darkMap: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
  preferDemo: false,
  hapticsEnabled: true,
  soundEnabled: true,
  darkMap: true,
};

export function saveLastMission(mission: MissionResponse): void {
  try {
    localStorage.setItem(LAST_MISSION_KEY, JSON.stringify(mission));
  } catch {
    // Ignore storage quota errors
  }
}

export function getLastMission(): MissionResponse | null {
  try {
    const raw = localStorage.getItem(LAST_MISSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


import type { Health } from '../types/health';
import type { MissionRequest, MissionResponse, RouteRequest, RouteResponse } from '../types/mission';
import type { ReflectionRequest, ReflectionResponse, Run, RunCreate, RunUpdate, Stats } from '../types/run';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.detail) {
        errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // Not JSON
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export async function fetchHealth(): Promise<Health> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await handleResponse<Health>(res);
  } catch (err) {
    return {
      ok: false,
      mode: 'demo',
      ollama_running: false,
      model: 'gemma3:4b',
      model_installed: false,
      message: 'Backend server not responding. Operating in offline demo mode.',
    };
  }
}


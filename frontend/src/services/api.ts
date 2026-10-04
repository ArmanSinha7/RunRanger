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

export async function createMission(req: MissionRequest): Promise<MissionResponse> {
  const res = await fetch(`${API_BASE}/missions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return handleResponse<MissionResponse>(res);
}

export async function fetchRoute(req: RouteRequest): Promise<RouteResponse> {
  const res = await fetch(`${API_BASE}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return handleResponse<RouteResponse>(res);
}

export async function listRuns(limit = 50): Promise<Run[]> {
  const res = await fetch(`${API_BASE}/runs?limit=${limit}`);
  return handleResponse<Run[]>(res);
}

export async function saveRun(run: RunCreate): Promise<Run> {
  const res = await fetch(`${API_BASE}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(run),
  });
  return handleResponse<Run>(res);
}

export async function updateRun(id: number, patch: RunUpdate): Promise<Run> {
  const res = await fetch(`${API_BASE}/runs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse<Run>(res);
}

export async function deleteRun(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/runs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete run ${id}`);
  }
}


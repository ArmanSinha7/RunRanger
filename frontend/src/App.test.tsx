import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const MOCK_MISSION_RESPONSE = {
  mode: 'demo',
  model: null,
  mission: {
    title: 'Autumn Meadow Sprint',
    summary: 'A crisp 20-minute mission with nature exploration checkpoints.',
    warmup: '5 minutes easy brisk walking',
    estimated_distance_km: 2.8,
    difficulty: 'moderate',
    route_style: 'loop',
    pre_run_tip: 'Keep shoulders loose and breathe deep.',
    checkpoints: [
      {
        title: 'Ancient Pine',
        instruction: 'Locate an evergreen tree with pinecones.',
        type: 'nature',
        at_minute: 5,
      },
      {
        title: 'Tempo Burst',
        instruction: 'Pick up your cadence for 45 seconds.',
        type: 'fitness',
        at_minute: 12,
      },
    ],
    cooldown: '3 minutes walking',
    screen_off_message: 'Mission primed. Put your phone away and run.',
  },
  request: {
    activity: 'running',
    duration_min: 20,
    difficulty: 'moderate',
    goal: 'nature',
    environment: 'park',
    mood: '',
    prefer_demo: true,
  },
  notice: null,
  generation_ms: 12,
  attempts: 1,
};

const MOCK_ROUTE_RESPONSE = {
  provider: 'local',
  geometry: [
    [40.785, -73.968],
    [40.787, -73.966],
    [40.785, -73.968],
  ],
  checkpoints: [
    [40.7855, -73.9675],
    [40.7865, -73.9665],
  ],
  distance_km: 2.8,
  notice: 'Local loop computed.',
};

describe('RunRanger Frontend Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (url.includes('/api/health')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              mode: 'demo',
              ollama_running: false,
              model: 'gemma3:4b',
              model_installed: false,
              message: 'Demo Mode — local sample missions',
            }),
        });
      }
      if (url.includes('/api/stats')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total_runs: 0,
              total_distance_km: 0,
              total_active_sec: 0,
              challenges_completed: 0,
              longest_run_km: 0,
              current_streak_days: 0,
              favorite_activity: null,
              difficulty_progression: [],
              this_week: { runs: 0, distance_km: 0, active_sec: 0 },
              personal_bests: {},
              badges: [
                {
                  id: 'first_run',
                  emoji: '🌱',
                  name: 'First Run',
                  description: 'Complete your first mission',
                  earned: false,
                },
              ],
            }),
        });
      }
      if (url.includes('/api/runs')) {
        if (opts?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            status: 201,
            json: () =>
              Promise.resolve({
                id: 1,
                created_at: new Date().toISOString(),
                ...JSON.parse((opts?.body as string) || '{}'),
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('/api/missions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_MISSION_RESPONSE),
        });
      }
      if (url.includes('/api/route')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_ROUTE_RESPONSE),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
  });

  it('renders landing page with RunRanger title and Touch Grass badges', async () => {
    render(<App />);
    expect(screen.getAllByText(/RunRanger/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Plan less\. Run more\./i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Start a Run/i })).toBeDefined();
    expect(screen.getByText(/Local AI • Open Weight • Privacy First • Free/i)).toBeDefined();
  });

  it('displays the 4 key steps to get user off their phone', async () => {
    render(<App />);
    expect(screen.getByText(/1\. Pick your run/i)).toBeDefined();
    expect(screen.getByText(/2\. Get your mission/i)).toBeDefined();
    expect(screen.getByText(/3\. Put phone away/i)).toBeDefined();
    expect(screen.getByText(/4\. Touch grass/i)).toBeDefined();
  });

  it('transitions to Create Run page when Start a Run is clicked', async () => {
    render(<App />);
    const startBtn = screen.getByRole('button', { name: /Start a Run/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText(/Create Your Mission/i)).toBeDefined();
      expect(screen.getByText(/1\. Activity/i)).toBeDefined();
      expect(screen.getByText(/2\. Target Duration/i)).toBeDefined();
      expect(screen.getByText(/Generate My Run/i)).toBeDefined();
    });
  });

  it('generates a mission and shows the mission screen with checkpoints and Lock & Start CTA', async () => {
    render(<App />);
    // Navigate to create page
    fireEvent.click(screen.getByRole('button', { name: /Start a Run/i }));

    await waitFor(() => {
      expect(screen.getByText(/Generate My Run/i)).toBeDefined();
    });

    // Click Generate Run
    fireEvent.click(screen.getByText(/Generate My Run/i));

    await waitFor(() => {
      expect(screen.getByText(/Autumn Meadow Sprint/i)).toBeDefined();
      expect(screen.getByText(/Ancient Pine/i)).toBeDefined();
      expect(screen.getByText(/LOCK PHONE & START/i)).toBeDefined();
    });
  });
});

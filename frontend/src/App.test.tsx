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


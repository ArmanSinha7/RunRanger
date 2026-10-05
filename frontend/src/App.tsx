import { useState, useEffect, useCallback } from 'react';
import type { Health } from './types/health';
import type { MissionRequest, MissionResponse, RouteResponse } from './types/mission';
import type { Run, Stats, ReflectionResponse, Feeling } from './types/run';
import { Navbar } from './components/Navbar';
import { HealthBanner } from './components/HealthBanner';
import { FocusOverlay } from './components/FocusOverlay';
import { HowItWorksModal } from './components/HowItWorksModal';
import { LandingPage } from './pages/LandingPage';
import { CreateRunPage } from './pages/CreateRunPage';
import { MissionPage } from './pages/MissionPage';
import { ActiveRunPage } from './pages/ActiveRunPage';
import { PostRunPage } from './pages/PostRunPage';
import { DashboardPage } from './pages/DashboardPage';
import { useGeolocation } from './hooks/useGeolocation';
import { useRunTracker } from './hooks/useRunTracker';
import {
  fetchHealth,
  createMission,
  fetchRoute,
  listRuns,
  saveRun,
  deleteRun,
  deleteAllRuns,
  fetchStats,
  fetchReflection,
} from './services/api';
import { saveLastMission, getLastMission } from './services/storage';

type Tab = 'landing' | 'create' | 'mission' | 'active' | 'post' | 'dashboard';

export default function App() {
  const [tab, setTab] = useState<Tab>('landing');
  const [health, setHealth] = useState<Health | null>(null);
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [missionData, setMissionData] = useState<MissionResponse | null>(null);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const geo = useGeolocation();
  const tracker = useRunTracker(missionData?.mission || null);

  // Load health & initial data
  const loadInitialData = useCallback(async () => {
    try {
      const h = await fetchHealth();
      setHealth(h);
    } catch {
      // Offline fallback
    }

    try {
      const [st, rn] = await Promise.all([fetchStats(), listRuns()]);
      setStats(st);
      setRuns(rn);
    } catch {
      // Offline fallback
    }

    const cached = getLastMission();
    if (cached && !missionData) {
      setMissionData(cached);
    }
  }, [missionData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Request Route for a Mission
  const loadRouteForMission = useCallback(
    async (mission: MissionResponse, provider: 'local' | 'osrm' = 'osrm') => {
      setIsLoadingRoute(true);
      try {
        const fractions = mission.mission.checkpoints.map(
          (c) => c.at_minute / Math.max(mission.request.duration_min, 1)
        );


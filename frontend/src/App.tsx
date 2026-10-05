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

        const route = await fetchRoute({
          lat: geo.lat,
          lng: geo.lng,
          distance_km: mission.mission.estimated_distance_km,
          style: mission.mission.route_style,
          seed: `${mission.mission.title}-${Date.now()}`,
          checkpoint_fractions: fractions,
          provider,
        });
        setRouteData(route);
      } catch (err) {
        console.warn('Route computation warning:', err);
        // Fallback simple geometric coordinates if API unreachable
        const offset = 0.005;
        setRouteData({
          provider: 'local',
          geometry: [
            [geo.lat, geo.lng],
            [geo.lat + offset, geo.lng + offset],
            [geo.lat + offset, geo.lng - offset],
            [geo.lat, geo.lng],
          ],
          checkpoints: mission.mission.checkpoints.map((_, i) => [
            geo.lat + (i + 1) * 0.002,
            geo.lng + (i + 1) * 0.002,
          ]),
          distance_km: mission.mission.estimated_distance_km,
          notice: 'Computed using offline local geometric circle.',
        });
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [geo.lat, geo.lng]
  );

  // Handle Mission Creation
  const handleGenerateMission = async (req: MissionRequest) => {
    setIsGeneratingMission(true);
    try {
      const resp = await createMission(req);
      setMissionData(resp);
      saveLastMission(resp);
      setTab('mission');
      await loadRouteForMission(resp, 'osrm');
    } catch (err) {
      console.error('Failed to create mission:', err);
      alert('Could not generate mission. Running in offline demo mode.');
    } finally {
      setIsGeneratingMission(false);
    }
  };

  // Start Run Flow
  const handleLockAndStart = () => {
    tracker.startRun();
    setShowFocusOverlay(true);
    setTab('active');
  };

  // Finish Run Flow
  const handleFinishRun = () => {
    tracker.finishRun();
    setTab('post');
  };

  // Post Run Save
  const handleSaveRun = async (feeling: Feeling, note: string, reflection: string) => {
    if (!missionData) return;
    try {
      const saved = await saveRun({
        mission_title: missionData.mission.title,
        activity: missionData.request.activity,
        difficulty: missionData.mission.difficulty,
        goal: missionData.request.goal,
        environment: missionData.request.environment,
        planned_minutes: missionData.request.duration_min,
        duration_sec: tracker.elapsedSeconds,
        distance_km: tracker.distanceKm,
        checkpoints_total: missionData.mission.checkpoints.length,
        checkpoints_done: tracker.completedCheckpoints.length,
        finished_early: tracker.elapsedSeconds < (missionData.request.duration_min * 60) / 2,
        feeling,
        note,
        reflection,
        mode: missionData.mode,
        mission: missionData.mission as unknown as Record<string, unknown>,
      });

      // Update runs list
      setRuns((prev) => [saved, ...prev]);

      // Refresh stats
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to save run:', err);
    }
  };

  // Generate Reflection
  const handleGenerateReflection = async (
    feeling: Feeling,
    note: string
  ): Promise<ReflectionResponse> => {
    if (!missionData) throw new Error('No mission data');
    const completedTitles = missionData.mission.checkpoints
      .filter((_, i) => tracker.completedCheckpoints.includes(i))
      .map((c) => c.title);

    return fetchReflection({
      mission_title: missionData.mission.title,
      activity: missionData.request.activity,
      planned_minutes: missionData.request.duration_min,
      duration_sec: tracker.elapsedSeconds,
      distance_km: tracker.distanceKm,
      checkpoints_total: missionData.mission.checkpoints.length,
      checkpoints_done: tracker.completedCheckpoints.length,
      completed_challenges: completedTitles,
      feeling,
      note,
      finished_early: tracker.elapsedSeconds < (missionData.request.duration_min * 60) / 2,
    });
  };

  // Delete Handlers
  const handleDeleteRun = async (id: number) => {
    try {
      await deleteRun(id);
      setRuns((prev) => prev.filter((r) => r.id !== id));
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to delete run:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllRuns();
      setRuns([]);
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to delete all runs:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1310] text-[#f1f5f3] flex flex-col font-sans selection:bg-emerald-900 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={tab}
        setTab={(t) => setTab(t)}
        health={health}
        onOpenHowItWorks={() => setShowHowItWorks(true)}
      />

      {/* Dynamic Health / Status Banner */}
      <HealthBanner health={health} />

      {/* Main View Router */}
      <main className="flex-1 w-full pb-16">
        {tab === 'landing' && (
          <LandingPage
            onStart={() => setTab('create')}
            onHowItWorks={() => setShowHowItWorks(true)}
            health={health}
          />
        )}

        {tab === 'create' && (
          <CreateRunPage
            onGenerate={handleGenerateMission}
            isLoading={isGeneratingMission}
            health={health}
          />
        )}

        {tab === 'mission' && missionData && (
          <MissionPage
            missionData={missionData}
            routeData={routeData}
            onLockAndStart={handleLockAndStart}
            onBack={() => setTab('create')}
            isLoadingRoute={isLoadingRoute}
            onRefreshRoute={(prov) => loadRouteForMission(missionData, prov)}
          />
        )}

        {tab === 'active' && missionData && (
          <ActiveRunPage
            missionData={missionData}
            routeData={routeData}
            status={tracker.status}
            elapsedSeconds={tracker.elapsedSeconds}
            distanceKm={tracker.distanceKm}
            completedCheckpoints={tracker.completedCheckpoints}
            currentCheckpointIndex={tracker.currentCheckpointIndex}
            isSimulatedSpeed={tracker.isSimulatedSpeed}
            onPause={tracker.pauseRun}
            onResume={tracker.resumeRun}
            onFinish={handleFinishRun}
            onToggleCheckpoint={tracker.toggleCheckpoint}
            onToggleSimSpeed={tracker.toggleSimulatedSpeed}
            onShowFocus={() => setShowFocusOverlay(true)}
          />
        )}

        {tab === 'post' && missionData && (
          <PostRunPage
            missionData={missionData}
            routeData={routeData}
            elapsedSeconds={tracker.elapsedSeconds}
            distanceKm={tracker.distanceKm}
            completedCheckpoints={tracker.completedCheckpoints}
            onSaveRun={handleSaveRun}
            onGenerateReflection={handleGenerateReflection}
            onGoToDashboard={() => setTab('dashboard')}
            onNewRun={() => setTab('create')}
          />
        )}

        {tab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            runs={runs}
            onDeleteRun={handleDeleteRun}
            onDeleteAll={handleDeleteAll}
            onRefresh={loadInitialData}
            onNewRun={() => setTab('create')}
          />
        )}
      </main>

      {/* Focus Mode Screen Overlay (Locks screen to encourage looking at nature) */}
      {showFocusOverlay && (
        <FocusOverlay
          missionTitle={missionData?.mission.title || 'Outdoor Mission'}
          nextCheckpointTitle={
            missionData?.mission.checkpoints[tracker.currentCheckpointIndex]?.title
          }
          screenOffMessage={missionData?.mission.screen_off_message}
          onUnlock={() => setShowFocusOverlay(false)}
        />
      )}

      {/* How It Works & Philosophy Modal */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[#1a2620] py-6 px-4 text-center text-xs text-zinc-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="text-zinc-400">RunRanger • Hacktoberfest 2026</span>
          <span>•</span>
          <span>Theme: Touch Grass</span>
          <span>•</span>
          <span>100% Local Open-Weight AI (Gemma 3)</span>
          <span>•</span>
          <span>₹0 Cost Architecture</span>
        </div>
        <div>
          Map data &copy;{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            OpenStreetMap contributors
          </a>
          . All activity data stored locally in SQLite.
        </div>
      </footer>
    </div>
  );
}

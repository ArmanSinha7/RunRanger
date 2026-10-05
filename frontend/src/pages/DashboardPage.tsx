import React, { useState } from 'react';
import { Flame, Download, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { Run, Stats } from '../types/run';
import { BadgeList } from '../components/BadgeList';
import { formatDistance, formatDurationLong, formatDate } from '../utils/formatters';
import { getExportUrl } from '../services/api';

interface DashboardPageProps {
  stats: Stats | null;
  runs: Run[];
  onDeleteRun: (id: number) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  onNewRun: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  runs,
  onDeleteRun,
  onDeleteAll,
  onNewRun,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAll();
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Your Progress & Logbook
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            All stored locally on your device in SQLite. Zero cloud tracking.
          </p>
        </div>

        <button
          onClick={onNewRun}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-950/40 transition-colors cursor-pointer self-start sm:self-auto"
        >
          Start New Mission
        </button>
      </div>

      {/* Progress Stats Cluster */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Your Cumulative Stats
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-[#121c17] border border-[#24352d]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
              Total Runs
            </span>
            <span className="text-2xl font-bold font-mono text-white">
              {stats?.total_runs ?? runs.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#121c17] border border-[#24352d]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
              Total Distance
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {formatDistance(stats?.total_distance_km ?? 0)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#121c17] border border-[#24352d]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
              Active Time
            </span>
            <span className="text-2xl font-bold font-mono text-teal-300">
              {formatDurationLong(stats?.total_active_sec ?? 0)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#121c17] border border-[#24352d]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
              Challenges
            </span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              {stats?.challenges_completed ?? 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#121c17] border border-[#24352d]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
              Streak
            </span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold font-mono text-orange-400">
                {stats?.current_streak_days ?? 0}d
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121c17] border border-[#24352d]">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
              Longest Run
            </span>
            <span className="text-2xl font-bold font-mono text-white">
              {formatDistance(stats?.longest_run_km ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Badges / Milestones */}
      {stats?.badges && stats.badges.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Outdoor Milestones & Badges
            </h2>
            <span className="text-xs text-zinc-400">
              {stats.badges.filter((b) => b.earned).length} of {stats.badges.length} unlocked
            </span>
          </div>

          <BadgeList badges={stats.badges} />
        </div>
      )}

      {/* Recent Missions Log */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Recent Outdoor Missions ({runs.length})
        </h2>

        {runs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121c17] border border-[#24352d] text-center space-y-3">
            <span className="text-4xl block">🌱</span>
            <p className="text-sm text-zinc-300 font-medium">
              No logged missions yet. Lace up and take your first step!
            </p>
            <button
              onClick={onNewRun}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
            >
              Start Mission #1
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((r) => (
              <div
                key={r.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#121c17] border border-[#24352d] hover:border-emerald-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-base">
                      {r.mission_title}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 capitalize">
                      {r.activity} • {r.difficulty}
                    </span>
                    {r.feeling && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {r.feeling}
                      </span>
                    )}
                  </div>


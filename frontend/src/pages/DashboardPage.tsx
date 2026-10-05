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

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span>{formatDate(r.created_at)}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-300 font-semibold">
                      {formatDistance(r.distance_km)}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-zinc-300">
                      {formatDurationLong(r.duration_sec)}
                    </span>
                    <span>•</span>
                    <span>
                      {r.checkpoints_done}/{r.checkpoints_total} Checkpoints
                    </span>
                  </div>

                  {r.reflection && (
                    <p className="text-xs text-zinc-300 italic pt-1 border-t border-[#1b2b22] line-clamp-2">
                      "{r.reflection}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onDeleteRun(r.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    title="Delete this run"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Guarantee & Local Data Management */}
      <div className="p-6 rounded-3xl bg-[#101713] border border-[#203328] space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              Device-Only Data Policy
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your activity and location data stay on your device unless you explicitly choose to export them. RunRanger requires no accounts, uses no telemetry, and tracks no external identifiers.
            </p>
          </div>
        </div>

        {/* Data Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={getExportUrl('json')}
            download="runranger-data.json"
            className="px-4 py-2 rounded-xl bg-[#16241d] hover:bg-[#1e3428] text-emerald-300 border border-emerald-800/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data (JSON)</span>
          </a>

          <a
            href={getExportUrl('csv')}
            download="runranger-data.csv"
            className="px-4 py-2 rounded-xl bg-[#16241d] hover:bg-[#1e3428] text-teal-300 border border-teal-800/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data (CSV)</span>
          </a>

          {runs.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-950/80 text-red-300 border border-red-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121c17] border border-[#24352d] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base text-white">
                Delete all running history?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              This will permanently delete all logged missions from your local SQLite database. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { HardDrive, ExternalLink } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

export const QuickStats: React.FC = () => {
  const { stats } = useDrive();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="bg-[#121216] rounded-3xl p-5 sm:p-6 border border-zinc-800/80 shadow-obsidian mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
            <HardDrive className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-none">
              Poojaspace Vault Storage
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Calculated precisely from files saved in your Google Drive
            </p>
          </div>
        </div>

        <a
          href="https://one.google.com/storage"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Google One</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Titanium Segmented Storage Track */}
      <div className="mt-3 bg-zinc-900 h-2.5 rounded-full overflow-hidden flex border border-zinc-800">
        <div
          className="bg-amber-400 h-full rounded-full transition-all duration-500 shadow-gold-glow-sm"
          style={{ width: `${Math.min(100, Math.max(5, (stats.photoCount / (stats.fileCount || 1)) * 100))}%` }}
          title="Photos"
        />
        <div
          className="bg-amber-600 h-full transition-all duration-500"
          style={{ width: `${Math.min(100, (stats.videoCount / (stats.fileCount || 1)) * 100)}%` }}
          title="Videos"
        />
        <div
          className="bg-zinc-500 h-full transition-all duration-500"
          style={{ width: `${Math.min(100, (stats.documentCount / (stats.fileCount || 1)) * 100)}%` }}
          title="Documents"
        />
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-4 gap-2.5 mt-4 text-center">
        <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
          <span className="block text-sm sm:text-base font-extrabold text-amber-400">
            {formatBytes(stats.totalBytes)}
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Used</span>
        </div>

        <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
          <span className="block text-sm sm:text-base font-extrabold text-white">
            {stats.photoCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Photos</span>
        </div>

        <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
          <span className="block text-sm sm:text-base font-extrabold text-white">
            {stats.videoCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Videos</span>
        </div>

        <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
          <span className="block text-sm sm:text-base font-extrabold text-white">
            {stats.documentCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Docs</span>
        </div>
      </div>
    </div>
  );
};
